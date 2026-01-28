"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const GetRequestById_1 = require("../../../application/use-cases/GetRequestById");
const DynamoDBRequestRepository_1 = require("../../persistence/DynamoDBRequestRepository");
const utils_1 = require("./utils");
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
const handler = async (event) => {
    return (0, utils_1.withHandler)(event, async (evt, userContext) => {
        const origin = evt.headers['origin'] || evt.headers['Origin'];
        // Get request ID from path
        const requestId = (0, utils_1.getPathParameter)(evt, 'id');
        // Initialize dependencies
        const requestRepository = new DynamoDBRequestRepository_1.DynamoDBRequestRepository();
        // Execute use case
        const useCase = new GetRequestById_1.GetRequestByIdUseCase(requestRepository);
        const result = await useCase.execute({
            requestId,
            userId: userContext.userId,
            userRole: userContext.userRole
        });
        return (0, utils_1.createSuccessResponse)(200, {
            message: 'Request retrieved successfully',
            data: result
        }, origin);
    });
};
exports.handler = handler;
//# sourceMappingURL=getRequestById.js.map