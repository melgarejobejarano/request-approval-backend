"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const CancelRequest_1 = require("../../../application/use-cases/CancelRequest");
const DynamoDBRequestRepository_1 = require("../../persistence/DynamoDBRequestRepository");
const JiraService_1 = require("../../integrations/JiraService");
const utils_1 = require("./utils");
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
const handler = async (event) => {
    return (0, utils_1.withHandler)(event, async (evt, userContext) => {
        const origin = evt.headers['origin'] || evt.headers['Origin'];
        // Get request ID from path
        const requestId = (0, utils_1.getPathParameter)(evt, 'id');
        // Parse request body (optional)
        let reason;
        try {
            const body = (0, utils_1.parseBody)(evt);
            reason = body?.reason?.trim();
        }
        catch {
            // Body is optional for cancel, so ignore parse errors
        }
        console.log(`[CancelRequest] User ${userContext.userName} (role: ${userContext.userRole}) is canceling a request`);
        // Initialize dependencies
        const requestRepository = new DynamoDBRequestRepository_1.DynamoDBRequestRepository();
        const jiraService = new JiraService_1.JiraService();
        // Execute use case
        const useCase = new CancelRequest_1.CancelRequestUseCase(requestRepository, jiraService);
        const result = await useCase.execute({
            requestId,
            reason,
            userId: userContext.userId,
            userName: userContext.userName
        });
        return (0, utils_1.createSuccessResponse)(200, {
            message: 'Request canceled successfully',
            data: result
        }, origin);
    });
};
exports.handler = handler;
//# sourceMappingURL=cancelRequest.js.map