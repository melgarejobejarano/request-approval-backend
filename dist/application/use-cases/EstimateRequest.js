"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateRequestUseCase = void 0;
const errors_1 = require("../../shared/errors");
/**
 * Estimate Request Use Case
 * Allows authenticated users to add effort estimation to requests
 *
 * MVP: Role gating disabled - any authenticated user can estimate
 * TODO: Re-enable for production with Cognito: Only INTERNAL users can estimate
 */
class EstimateRequestUseCase {
    requestRepository;
    constructor(requestRepository) {
        this.requestRepository = requestRepository;
    }
    async execute(input) {
        const { requestId, estimatedDays, comment, userName } = input;
        // MVP: Role gating disabled - any authenticated user can estimate
        // TODO: Re-enable for production:
        // if (!hasPermission(userRole, Permission.ESTIMATE_REQUEST)) {
        //   throw new UnauthorizedError('Only INTERNAL users can estimate requests');
        // }
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