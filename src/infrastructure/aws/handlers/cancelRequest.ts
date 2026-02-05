import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CancelRequestUseCase } from '../../../application/use-cases/CancelRequest';
import { DynamoDBRequestRepository } from '../../persistence/DynamoDBRequestRepository';
import { JiraService } from '../../integrations/JiraService';
import { withHandler, createSuccessResponse, parseBody, getPathParameter } from './utils';

interface CancelRequestBody {
  reason?: string;
}

/**
 * Cancel Request Lambda Handler
 * PATCH /requests/{id}/cancel
 * 
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Any valid role
 * - X-User-Name: User's display name
 * 
 * Path parameters:
 * - id: Request ID
 * 
 * Request body (optional):
 * {
 *   "reason": "Optional cancellation reason"
 * }
 * 
 * Design:
 * - Always returns 200 if DynamoDB update succeeds
 * - Jira updates are best-effort (failures logged, not thrown)
 * - Cancel is idempotent (succeeds if already canceled)
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withHandler(event, async (evt, userContext) => {
    const origin = evt.headers['origin'] || evt.headers['Origin'];

    // Get request ID from path
    const requestId = getPathParameter(evt, 'id');

    // Parse request body (optional)
    let reason: string | undefined;
    try {
      const body = parseBody<CancelRequestBody>(evt);
      reason = body?.reason?.trim();
    } catch {
      // Body is optional for cancel, so ignore parse errors
    }

    console.log(`[CancelRequest] User ${userContext.userName} (role: ${userContext.userRole}) is canceling a request`);

    // Initialize dependencies
    const requestRepository = new DynamoDBRequestRepository();
    const jiraService = new JiraService();

    // Execute use case
    const useCase = new CancelRequestUseCase(requestRepository, jiraService);

    const result = await useCase.execute({
      requestId,
      reason,
      userId: userContext.userId,
      userName: userContext.userName
    });

    return createSuccessResponse(200, {
      message: 'Request canceled successfully',
      data: result
    }, origin);
  });
};
