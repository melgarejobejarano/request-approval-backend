import { IRequestRepository } from '../interfaces/IRequestRepository';
import { UserRole, hasPermission, Permission } from '../../domain/value-objects/UserRole';
import { NotFoundError, UnauthorizedError } from '../../shared/errors';

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
export class GetRequestByIdUseCase {
  constructor(private readonly requestRepository: IRequestRepository) {}

  async execute(input: GetRequestByIdInput): Promise<GetRequestByIdOutput> {
    const { requestId, userId, userRole } = input;

    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundError(`Request with ID ${requestId} not found`);
    }

    // Check permissions
    const canViewAll = hasPermission(userRole, Permission.VIEW_ALL_REQUESTS);
    const canViewOwn = hasPermission(userRole, Permission.VIEW_OWN_REQUESTS);
    const isOwner = request.clientId === userId;

    if (!canViewAll && !(canViewOwn && isOwner)) {
      throw new UnauthorizedError('You do not have permission to view this request');
    }

    return {
      request: request.toResponse()
    };
  }
}
