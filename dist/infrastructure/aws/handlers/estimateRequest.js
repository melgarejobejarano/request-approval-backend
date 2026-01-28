"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const EstimateRequest_1 = require("../../../application/use-cases/EstimateRequest");
const DynamoDBRequestRepository_1 = require("../../persistence/DynamoDBRequestRepository");
const UserRole_1 = require("../../../domain/value-objects/UserRole");
const errors_1 = require("../../../shared/errors");
const utils_1 = require("./utils");
/**
 * Estimate Request Lambda Handler
 * PATCH /requests/{id}/estimate
 *
 * Required headers:
 * - X-User-Id: User's ID
 * - X-User-Role: Must be INTERNAL
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
const handler = async (event) => {
    return (0, utils_1.withHandler)(event, async (evt, userContext) => {
        const origin = evt.headers['origin'] || evt.headers['Origin'];
        // Only INTERNAL role can estimate requests
        if (userContext.userRole !== UserRole_1.UserRole.INTERNAL) {
            throw new errors_1.UnauthorizedError('Only INTERNAL users can estimate requests');
        }
        // Get request ID from path
        const requestId = (0, utils_1.getPathParameter)(evt, 'id');
        // Parse and validate request body
        const body = (0, utils_1.parseBody)(evt);
        if (!body.estimated_days || typeof body.estimated_days !== 'number' || body.estimated_days <= 0) {
            throw new errors_1.ValidationError('estimated_days must be a positive number');
        }
        if (!body.comment || body.comment.trim().length === 0) {
            throw new errors_1.ValidationError('comment is required');
        }
        // Initialize dependencies
        const requestRepository = new DynamoDBRequestRepository_1.DynamoDBRequestRepository();
        // Execute use case
        const useCase = new EstimateRequest_1.EstimateRequestUseCase(requestRepository);
        const result = await useCase.execute({
            requestId,
            estimatedDays: body.estimated_days,
            comment: body.comment.trim(),
            userId: userContext.userId,
            userName: userContext.userName,
            userRole: userContext.userRole
        });
        return (0, utils_1.createSuccessResponse)(200, {
            message: 'Request estimated successfully',
            data: result
        }, origin);
    });
};
exports.handler = handler;
//# sourceMappingURL=estimateRequest.js.map