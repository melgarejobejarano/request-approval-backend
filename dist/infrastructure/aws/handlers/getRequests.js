"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const GetRequests_1 = require("../../../application/use-cases/GetRequests");
const DynamoDBRequestRepository_1 = require("../../persistence/DynamoDBRequestRepository");
const utils_1 = require("./utils");
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
const handler = async (event) => {
    return (0, utils_1.withHandler)(event, async (evt, userContext) => {
        const origin = evt.headers['origin'] || evt.headers['Origin'];
        // Initialize dependencies
        const requestRepository = new DynamoDBRequestRepository_1.DynamoDBRequestRepository();
        // Execute use case
        const useCase = new GetRequests_1.GetRequestsUseCase(requestRepository);
        const result = await useCase.execute({
            userId: userContext.userId,
            userRole: userContext.userRole
        });
        return (0, utils_1.createSuccessResponse)(200, {
            message: 'Requests retrieved successfully',
            data: result
        }, origin);
    });
};
exports.handler = handler;
//# sourceMappingURL=getRequests.js.map