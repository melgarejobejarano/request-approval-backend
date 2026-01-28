"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRequestsUseCase = void 0;
const UserRole_1 = require("../../domain/value-objects/UserRole");
/**
 * Get Requests Use Case
 * Retrieves requests based on user role and permissions
 */
class GetRequestsUseCase {
    requestRepository;
    constructor(requestRepository) {
        this.requestRepository = requestRepository;
    }
    async execute(input) {
        const { userId, userRole } = input;
        let requests;
        // Check permissions and fetch appropriate requests
        if ((0, UserRole_1.hasPermission)(userRole, UserRole_1.Permission.VIEW_ALL_REQUESTS)) {
            // INTERNAL and APPROVER can view all requests
            requests = await this.requestRepository.findAll();
        }
        else if ((0, UserRole_1.hasPermission)(userRole, UserRole_1.Permission.VIEW_OWN_REQUESTS)) {
            // CLIENT can only view their own requests
            requests = await this.requestRepository.findByClientId(userId);
        }
        else {
            throw new Error('Unauthorized: User does not have permission to view requests');
        }
        return {
            requests: requests.map(r => r.toResponse()),
            count: requests.length
        };
    }
}
exports.GetRequestsUseCase = GetRequestsUseCase;
//# sourceMappingURL=GetRequests.js.map