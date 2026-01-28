import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetRequestByIdUseCase } from '../../../application/use-cases/GetRequestById';
import { DynamoDBRequestRepository } from '../../persistence/DynamoDBRequestRepository';
import { withHandler, createSuccessResponse, getPathParameter } from './utils';

/**
 * Get Request By ID Lambda Handler
 * GET /requests/{id}
 * 
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: CLIENT, INTERNAL, or APPROVER
 * - X-User-Name: User's display name
 * 
 * Path parameters:
 * - id: Request ID
 * 
 * Returns:
 * - CLIENT: Only if they own the request
 * - INTERNAL/APPROVER: Any request
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withHandler(event, async (evt, userContext) => {
    const origin = evt.headers['origin'] || evt.headers['Origin'];

    // Get request ID from path
    const requestId = getPathParameter(evt, 'id');

    // Initialize dependencies
    const requestRepository = new DynamoDBRequestRepository();

    // Execute use case
    const useCase = new GetRequestByIdUseCase(requestRepository);

    const result = await useCase.execute({
      requestId,
      userId: userContext.userId,
      userRole: userContext.userRole
    });

    return createSuccessResponse(200, {
      message: 'Request retrieved successfully',
      data: result
    }, origin);
  });
};
