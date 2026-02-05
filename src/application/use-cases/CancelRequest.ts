import { IRequestRepository } from '../interfaces/IRequestRepository';
import { IJiraService } from '../interfaces/IJiraService';
import { NotFoundError, ConflictError } from '../../shared/errors';
import { getConfig } from '../../shared/config';

export interface CancelRequestInput {
  requestId: string;
  reason?: string;
  userId: string;
  userName: string;
}

export interface CancelRequestOutput {
  request: Record<string, unknown>;
  jiraUpdated: boolean;
}

/**
 * Cancel Request Use Case
 * Cancels a request and marks it in Jira (best-effort)
 * 
 * Design principles:
 * - DynamoDB update is the source of truth
 * - Jira updates are best-effort (failures are logged, not thrown)
 * - Cancel is idempotent (calling on already-canceled request succeeds)
 * - Only returns error if DynamoDB update fails
 */
export class CancelRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly jiraService: IJiraService
  ) {}

  async execute(input: CancelRequestInput): Promise<CancelRequestOutput> {
    const { requestId, reason, userName } = input;
    const config = getConfig();

    console.log(`[CancelRequest] User ${userName} is canceling request ${requestId}`);

    // Find the request
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundError(`Request with ID ${requestId} not found`);
    }

    // Apply cancellation (idempotent - succeeds if already canceled)
    try {
      request.cancel(userName, reason);
    } catch (error) {
      // Convert domain error to application error
      if (error instanceof Error && error.message.includes('Cannot cancel')) {
        throw new ConflictError(error.message);
      }
      throw error;
    }

    // Save the updated request - this is the critical operation
    await this.requestRepository.update(request);

    console.log(`[CancelRequest] Request ${requestId} canceled successfully in DynamoDB`);

    // Best-effort Jira updates - failures must not cause 500
    let jiraUpdated = false;
    if (request.jiraIssueKey) {
      jiraUpdated = await this.updateJiraIssue(
        request.jiraIssueKey,
        userName,
        reason,
        config.jira.canceledLabel
      );
    }

    return {
      request: request.toResponse(),
      jiraUpdated
    };
  }

  /**
   * Update Jira issue with canceled marker (best-effort)
   * Never throws - all errors are caught and logged
   */
  private async updateJiraIssue(
    issueKey: string,
    userName: string,
    reason: string | undefined,
    canceledLabel: string
  ): Promise<boolean> {
    let commentAdded = false;
    let labelAdded = false;

    // Add comment
    try {
      const reasonText = reason || 'No reason provided';
      const comment = `Request canceled in RequestFlow. Reason: ${reasonText}. Canceled by ${userName}.`;
      await this.jiraService.addComment(issueKey, comment);
      console.log(`[CancelRequest] Added Jira comment to ${issueKey}`);
      commentAdded = true;
    } catch (error) {
      console.warn(`[CancelRequest] Failed to add Jira comment to ${issueKey}:`, error);
    }

    // Add label
    try {
      labelAdded = await this.jiraService.addLabel(issueKey, canceledLabel);
      if (labelAdded) {
        console.log(`[CancelRequest] Added Jira label "${canceledLabel}" to ${issueKey}`);
      }
    } catch (error) {
      console.warn(`[CancelRequest] Failed to add Jira label to ${issueKey}:`, error);
    }

    return commentAdded || labelAdded;
  }
}
