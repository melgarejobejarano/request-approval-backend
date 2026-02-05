import { IRequestRepository } from '../interfaces/IRequestRepository';
import { UserRole } from '../../domain/value-objects/UserRole';
export interface EstimateRequestInput {
    requestId: string;
    estimatedDays: number;
    comment: string;
    userId: string;
    userName: string;
    userRole: UserRole;
}
export interface EstimateRequestOutput {
    request: Record<string, unknown>;
}
/**
 * Estimate Request Use Case
 * Allows authenticated users to add effort estimation to requests
 *
 * MVP: Role gating disabled - any authenticated user can estimate
 * TODO: Re-enable for production with Cognito: Only INTERNAL users can estimate
 */
export declare class EstimateRequestUseCase {
    private readonly requestRepository;
    constructor(requestRepository: IRequestRepository);
    execute(input: EstimateRequestInput): Promise<EstimateRequestOutput>;
}
//# sourceMappingURL=EstimateRequest.d.ts.map