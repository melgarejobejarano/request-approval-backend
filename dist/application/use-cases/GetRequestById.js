"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRequestByIdUseCase = void 0;
const UserRole_1 = require("../../domain/value-objects/UserRole");
const errors_1 = require("../../shared/errors");
/**
 * Get Request By ID Use Case
 * Retrieves a specific request by ID with permission checks
 */
class GetRequestByIdUseCase {
    requestRepository;
    constructor(requestRepository) {
        this.requestRepository = requestRepository;
    }
    async execute(input) {
        const { requestId, userId, userRole } = input;
        const request = await this.requestRepository.findById(requestId);
        if (!request) {
            throw new errors_1.NotFoundError(`Request with ID ${requestId} not found`);
        }
        // Check permissions
        const canViewAll = (0, UserRole_1.hasPermission)(userRole, UserRole_1.Permission.VIEW_ALL_REQUESTS);
        const canViewOwn = (0, UserRole_1.hasPermission)(userRole, UserRole_1.Permission.VIEW_OWN_REQUESTS);
        const isOwner = request.clientId === userId;
        if (!canViewAll && !(canViewOwn && isOwner)) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this request');
        }
        return {
            request: request.toResponse()
        };
    }
}
exports.GetRequestByIdUseCase = GetRequestByIdUseCase;
//# sourceMappingURL=GetRequestById.js.map