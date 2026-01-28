import { IRequestRepository } from '../interfaces/IRequestRepository';
import { UserRole } from '../../domain/value-objects/UserRole';
export interface GetRequestsInput {
    userId: string;
    userRole: UserRole;
}
export interface GetRequestsOutput {
    requests: Record<string, unknown>[];
    count: number;
}
/**
 * Get Requests Use Case
 * Retrieves requests based on user role and permissions
 */
export declare class GetRequestsUseCase {
    private readonly requestRepository;
    constructor(requestRepository: IRequestRepository);
    execute(input: GetRequestsInput): Promise<GetRequestsOutput>;
}
//# sourceMappingURL=GetRequests.d.ts.map