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
 * Allows APPROVER users to approve or reject estimated requests
 */
export declare class ApproveRequestUseCase {
    private readonly requestRepository;
    private readonly jiraService;
    constructor(requestRepository: IRequestRepository, jiraService: IJiraService);
    execute(input: ApproveRequestInput): Promise<ApproveRequestOutput>;
}
//# sourceMappingURL=ApproveRequest.d.ts.map