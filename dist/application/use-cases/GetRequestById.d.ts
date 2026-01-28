import { IRequestRepository } from '../interfaces/IRequestRepository';
import { UserRole } from '../../domain/value-objects/UserRole';
export interface GetRequestByIdInput {
    requestId: string;
    userId: string;
    userRole: UserRole;
}
export interface GetRequestByIdOutput {
    request: Record<string, unknown>;
}
/**
 * Get Request By ID Use Case
 * Retrieves a specific request by ID with permission checks
 */
export declare class GetRequestByIdUseCase {
    private readonly requestRepository;
    constructor(requestRepository: IRequestRepository);
    execute(input: GetRequestByIdInput): Promise<GetRequestByIdOutput>;
}
//# sourceMappingURL=GetRequestById.d.ts.map