"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateRequestUseCase = void 0;
const UserRole_1 = require("../../domain/value-objects/UserRole");
const errors_1 = require("../../shared/errors");
/**
 * Estimate Request Use Case
 * Allows INTERNAL users to add effort estimation to requests
 */
class EstimateRequestUseCase {
    requestRepository;
    constructor(requestRepository) {
        this.requestRepository = requestRepository;
    }
    async execute(input) {
        const { requestId, estimatedDays, comment, userId, userName, userRole } = input;
        // Check permission
        if (!(0, UserRole_1.hasPermission)(userRole, UserRole_1.Permission.ESTIMATE_REQUEST)) {
            throw new errors_1.UnauthorizedError('Only INTERNAL users can estimate requests');
        }
        // Validate input
        if (!estimatedDays || estimatedDays <= 0) {
            throw new errors_1.ValidationError('Estimated days must be a positive number');
        }
        if (!comment || comment.trim().length === 0) {
            throw new errors_1.ValidationError('Estimation comment is required');
        }
        // Find the request
        const request = await this.requestRepository.findById(requestId);
        if (!request) {
            throw new errors_1.NotFoundError(`Request with ID ${requestId} not found`);
        }
        // Apply estimation
        request.estimate(estimatedDays, comment, userName);
        // Save the updated request
        await this.requestRepository.update(request);
        return {
            request: request.toResponse()
        };
    }
}
exports.EstimateRequestUseCase = EstimateRequestUseCase;
//# sourceMappingURL=EstimateRequest.js.map