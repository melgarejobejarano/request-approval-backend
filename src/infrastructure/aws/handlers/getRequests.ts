import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetRequestsUseCase } from '../../../application/use-cases/GetRequests';
import { DynamoDBRequestRepository } from '../../persistence/DynamoDBRequestRepository';
import { withHandler, createSuccessResponse } from './utils';

/**
 * Get Requests Lambda Handler
 * GET /requests
 * 
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: CLIENT, INTERNAL, or APPROVER
 * - X-User-Name: User's display name
 * 
 * Returns:
 * - CLIENT: Only their own requests
 * - INTERNAL/APPROVER: All requests
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withHandler(event, async (evt, userContext) => {
    const origin = evt.headers['origin'] || evt.headers['Origin'];

    // Initialize dependencies
    const requestRepository = new DynamoDBRequestRepository();

    // Execute use case
    const useCase = new GetRequestsUseCase(requestRepository);

    const result = await useCase.execute({
      userId: userContext.userId,
      userRole: userContext.userRole
    });

    return createSuccessResponse(200, {
      message: 'Requests retrieved successfully',
      data: result
    }, origin);
  });
};
