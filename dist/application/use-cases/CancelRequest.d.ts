import { IRequestRepository } from '../interfaces/IRequestRepository';
import { IJiraService } from '../interfaces/IJiraService';
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
export declare class CancelRequestUseCase {
    private readonly requestRepository;
    private readonly jiraService;
    constructor(requestRepository: IRequestRepository, jiraService: IJiraService);
    execute(input: CancelRequestInput): Promise<CancelRequestOutput>;
    /**
     * Update Jira issue with canceled marker (best-effort)
     * Never throws - all errors are caught and logged
     */
    private updateJiraIssue;
}
//# sourceMappingURL=CancelRequest.d.ts.map