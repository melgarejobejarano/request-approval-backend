import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApproveRequestUseCase } from '../../../application/use-cases/ApproveRequest';
import { DynamoDBRequestRepository } from '../../persistence/DynamoDBRequestRepository';
import { JiraService } from '../../integrations/JiraService';
import { ValidationError } from '../../../shared/errors';
import { withHandler, createSuccessResponse, parseBody, getPathParameter } from './utils';

interface ApproveRequestBody {
  action: 'approve' | 'reject';
  comment?: string;
}

/**
 * Approve/Reject Request Lambda Handler
 * PATCH /requests/{id}/approve
 * 
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Any valid role (MVP: role gating disabled)
 * - X-User-Name: User's display name (e.g., "Jules")
 * 
 * Path parameters:
 * - id: Request ID
 * 
 * Request body:
 * {
 *   "action": "approve" | "reject",
 *   "comment": "Optional comment (required for rejection)"
 * }
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withHandler(event, async (evt, userContext) => {
    const origin = evt.headers['origin'] || evt.headers['Origin'];

    // MVP: Role gating disabled - any authenticated user can approve/reject
    // TODO: Re-enable for production: Only APPROVER role can approve/reject requests

    // Get request ID from path
    const requestId = getPathParameter(evt, 'id');

    // Parse and validate request body
    const body = parseBody<ApproveRequestBody>(evt);

    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      throw new ValidationError('action must be either "approve" or "reject"');
    }

    if (body.action === 'reject' && (!body.comment || body.comment.trim().length === 0)) {
      throw new ValidationError('comment is required when rejecting a request');
    }

    // Initialize dependencies
    const requestRepository = new DynamoDBRequestRepository();
    const jiraService = new JiraService();

    // Execute use case
    const useCase = new ApproveRequestUseCase(requestRepository, jiraService);

    const result = await useCase.execute({
      requestId,
      action: body.action,
      comment: body.comment?.trim(),
      userId: userContext.userId,
      userName: userContext.userName,
      userRole: userContext.userRole
    });

    const actionVerb = body.action === 'approve' ? 'approved' : 'rejected';

    return createSuccessResponse(200, {
      message: `Request ${actionVerb} successfully`,
      data: result
    }, origin);
  });
};
