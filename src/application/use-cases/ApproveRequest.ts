import { IRequestRepository } from '../interfaces/IRequestRepository';
import { IJiraService } from '../interfaces/IJiraService';
import { UserRole } from '../../domain/value-objects/UserRole';
import { NotFoundError, ValidationError } from '../../shared/errors';

export interface ApproveRequestInput {
  requestId: string;
  action: 'approve' | 'reject';
  comment?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
}

export interface ApproveRequestOutput {
  request: Record<string, unknown>;
  jiraUpdated: boolean;
}

/**
 * Approve/Reject Request Use Case
 * Allows authenticated users to approve or reject estimated requests
 * 
 * MVP: Role gating disabled - any authenticated user can approve/reject
 * TODO: Re-enable for production with Cognito: Only APPROVER users can approve/reject
 */
export class ApproveRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly jiraService: IJiraService
  ) {}

  async execute(input: ApproveRequestInput): Promise<ApproveRequestOutput> {
    const { requestId, action, comment, userName } = input;

    // MVP: Role gating disabled - any authenticated user can approve/reject
    // TODO: Re-enable for production:
    // if (action === 'approve' && !hasPermission(userRole, Permission.APPROVE_REQUEST)) {
    //   throw new UnauthorizedError('Only APPROVER users can approve requests');
    // }
    // if (action === 'reject' && !hasPermission(userRole, Permission.REJECT_REQUEST)) {
    //   throw new UnauthorizedError('Only APPROVER users can reject requests');
    // }

    // Validate rejection requires comment
    if (action === 'reject' && (!comment || comment.trim().length === 0)) {
      throw new ValidationError('Comment is required when rejecting a request');
    }

    // Find the request
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundError(`Request with ID ${requestId} not found`);
    }

    // Apply approval or rejection
    if (action === 'approve') {
      request.approve(userName, comment);
    } else {
      request.reject(userName, comment!);
    }

    // Save the updated request
    await this.requestRepository.update(request);

    // Update JIRA issue if exists
    let jiraUpdated = false;
    if (request.jiraIssueKey) {
      try {
        const jiraStatus = action === 'approve' ? 'Approved' : 'Rejected';
        await this.jiraService.updateIssueStatus(request.jiraIssueKey, jiraStatus);

        if (comment) {
          await this.jiraService.addComment(
            request.jiraIssueKey,
            `Request ${action}d by ${userName}: ${comment}`
          );
        }

        jiraUpdated = true;
      } catch (error) {
        console.error('Failed to update JIRA issue:', error);
      }
    }

    return {
      request: request.toResponse(),
      jiraUpdated
    };
  }
}
