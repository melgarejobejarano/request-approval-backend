import { IRequestRepository } from '../interfaces/IRequestRepository';
import { UserRole, hasPermission, Permission } from '../../domain/value-objects/UserRole';

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
export class GetRequestsUseCase {
  constructor(private readonly requestRepository: IRequestRepository) {}

  async execute(input: GetRequestsInput): Promise<GetRequestsOutput> {
    const { userId, userRole } = input;

    let requests;

    // Check permissions and fetch appropriate requests
    if (hasPermission(userRole, Permission.VIEW_ALL_REQUESTS)) {
      // INTERNAL and APPROVER can view all requests
      requests = await this.requestRepository.findAll();
    } else if (hasPermission(userRole, Permission.VIEW_OWN_REQUESTS)) {
      // CLIENT can only view their own requests
      requests = await this.requestRepository.findByClientId(userId);
    } else {
      throw new Error('Unauthorized: User does not have permission to view requests');
    }

    return {
      requests: requests.map(r => r.toResponse()),
      count: requests.length
    };
  }
}
