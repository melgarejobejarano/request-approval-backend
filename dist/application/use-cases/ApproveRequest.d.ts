import { IRequestRepository } from '../interfaces/IRequestRepository';
import { IJiraService } from '../interfaces/IJiraService';
import { UserRole } from '../../domain/value-objects/UserRole';
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
export declare class ApproveRequestUseCase {
    private readonly requestRepository;
    private readonly jiraService;
    constructor(requestRepository: IRequestRepository, jiraService: IJiraService);
    execute(input: ApproveRequestInput): Promise<ApproveRequestOutput>;
}
//# sourceMappingURL=ApproveRequest.d.ts.map