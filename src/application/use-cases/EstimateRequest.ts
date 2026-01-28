import { IRequestRepository } from '../interfaces/IRequestRepository';
import { UserRole, hasPermission, Permission } from '../../domain/value-objects/UserRole';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../shared/errors';

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
 * Allows INTERNAL users to add effort estimation to requests
 */
export class EstimateRequestUseCase {
  constructor(private readonly requestRepository: IRequestRepository) {}

  async execute(input: EstimateRequestInput): Promise<EstimateRequestOutput> {
    const { requestId, estimatedDays, comment, userId, userName, userRole } = input;

    // Check permission
    if (!hasPermission(userRole, Permission.ESTIMATE_REQUEST)) {
      throw new UnauthorizedError('Only INTERNAL users can estimate requests');
    }

    // Validate input
    if (!estimatedDays || estimatedDays <= 0) {
      throw new ValidationError('Estimated days must be a positive number');
    }

    if (!comment || comment.trim().length === 0) {
      throw new ValidationError('Estimation comment is required');
    }

    // Find the request
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundError(`Request with ID ${requestId} not found`);
    }

    // Apply estimation
    request.estimate(estimatedDays, comment, userName);

    // Save the updated request
    await this.requestRepository.update(request);

    return {
      request: request.toResponse()
    };
  }
}
