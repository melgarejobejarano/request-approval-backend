"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const ApproveRequest_1 = require("../../../application/use-cases/ApproveRequest");
const DynamoDBRequestRepository_1 = require("../../persistence/DynamoDBRequestRepository");
const JiraService_1 = require("../../integrations/JiraService");
const UserRole_1 = require("../../../domain/value-objects/UserRole");
const errors_1 = require("../../../shared/errors");
const utils_1 = require("./utils");
/**
 * Approve/Reject Request Lambda Handler
 * PATCH /requests/{id}/approve
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Must be APPROVER
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
const handler = async (event) => {
    return (0, utils_1.withHandler)(event, async (evt, userContext) => {
        const origin = evt.headers['origin'] || evt.headers['Origin'];
        // Only APPROVER role can approve/reject requests
        if (userContext.userRole !== UserRole_1.UserRole.APPROVER) {
            throw new errors_1.UnauthorizedError('Only APPROVER users can approve or reject requests');
        }
        // Get request ID from path
        const requestId = (0, utils_1.getPathParameter)(evt, 'id');
        // Parse and validate request body
        const body = (0, utils_1.parseBody)(evt);
        if (!body.action || !['approve', 'reject'].includes(body.action)) {
            throw new errors_1.ValidationError('action must be either "approve" or "reject"');
        }
        if (body.action === 'reject' && (!body.comment || body.comment.trim().length === 0)) {
            throw new errors_1.ValidationError('comment is required when rejecting a request');
        }
        // Initialize dependencies
        const requestRepository = new DynamoDBRequestRepository_1.DynamoDBRequestRepository();
        const jiraService = new JiraService_1.JiraService();
        // Execute use case
        const useCase = new ApproveRequest_1.ApproveRequestUseCase(requestRepository, jiraService);
        const result = await useCase.execute({
            requestId,
            action: body.action,
            comment: body.comment?.trim(),
            userId: userContext.userId,
            userName: userContext.userName,
            userRole: userContext.userRole
        });
        const actionVerb = body.action === 'approve' ? 'approved' : 'rejected';
        return (0, utils_1.createSuccessResponse)(200, {
            message: `Request ${actionVerb} successfully`,
            data: result
        }, origin);
    });
};
exports.handler = handler;
//# sourceMappingURL=approveRequest.js.map