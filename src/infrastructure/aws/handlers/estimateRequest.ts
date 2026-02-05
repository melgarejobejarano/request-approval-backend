import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { EstimateRequestUseCase } from '../../../application/use-cases/EstimateRequest';
import { DynamoDBRequestRepository } from '../../persistence/DynamoDBRequestRepository';
import { ValidationError } from '../../../shared/errors';
import { withHandler, createSuccessResponse, parseBody, getPathParameter } from './utils';

interface EstimateRequestBody {
  estimated_days: number;
  comment: string;
}

/**
 * Estimate Request Lambda Handler
 * PATCH /requests/{id}/estimate
 * 
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Any valid role (MVP: role gating disabled)
 * - X-User-Name: User's display name
 * 
 * Path parameters:
 * - id: Request ID
 * 
 * Request body:
 * {
 *   "estimated_days": 5,
 *   "comment": "Estimation notes"
 * }
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withHandler(event, async (evt, userContext) => {
    const origin = evt.headers['origin'] || evt.headers['Origin'];

    // MVP: Role gating disabled - any authenticated user can estimate
    // TODO: Re-enable for production: Only INTERNAL role can estimate requests

    // Get request ID from path
    const requestId = getPathParameter(evt, 'id');

    // Parse and validate request body
    const body = parseBody<EstimateRequestBody>(evt);

    if (!body.estimated_days || typeof body.estimated_days !== 'number' || body.estimated_days <= 0) {
      throw new ValidationError('estimated_days must be a positive number');
    }

    if (!body.comment || body.comment.trim().length === 0) {
      throw new ValidationError('comment is required');
    }

    // Initialize dependencies
    const requestRepository = new DynamoDBRequestRepository();

    // Execute use case
    const useCase = new EstimateRequestUseCase(requestRepository);

    const result = await useCase.execute({
      requestId,
      estimatedDays: body.estimated_days,
      comment: body.comment.trim(),
      userId: userContext.userId,
      userName: userContext.userName,
      userRole: userContext.userRole
    });

    return createSuccessResponse(200, {
      message: 'Request estimated successfully',
      data: result
    }, origin);
  });
};
