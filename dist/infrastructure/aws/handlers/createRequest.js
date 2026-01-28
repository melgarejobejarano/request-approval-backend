"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const CreateRequest_1 = require("../../../application/use-cases/CreateRequest");
const DynamoDBRequestRepository_1 = require("../../persistence/DynamoDBRequestRepository");
const JiraService_1 = require("../../integrations/JiraService");
const MockAIService_1 = require("../../integrations/MockAIService");
const UserRole_1 = require("../../../domain/value-objects/UserRole");
const errors_1 = require("../../../shared/errors");
const utils_1 = require("./utils");
/**
 * Create Request Lambda Handler
 * POST /requests
 *
 * Required headers:
 * - X-User-Id: Client's user ID
 * - X-User-Role: Must be CLIENT
 * - X-User-Name: Client's display name
 *
 * Request body:
 * {
 *   "title": "Request title",
 *   "description": "Request description"
 * }
 */
const handler = async (event) => {
    return (0, utils_1.withHandler)(event, async (evt, userContext) => {
        const origin = evt.headers['origin'] || evt.headers['Origin'];
        // Only CLIENT role can create requests
        if (userContext.userRole !== UserRole_1.UserRole.CLIENT) {
            throw new errors_1.UnauthorizedError('Only CLIENT users can create requests');
        }
        // Parse and validate request body
        const body = (0, utils_1.parseBody)(evt);
        if (!body.title || body.title.trim().length === 0) {
            throw new errors_1.ValidationError('Title is required');
        }
        if (!body.description || body.description.trim().length === 0) {
            throw new errors_1.ValidationError('Description is required');
        }
        // Initialize dependencies
        const requestRepository = new DynamoDBRequestRepository_1.DynamoDBRequestRepository();
        const jiraService = new JiraService_1.JiraService();
        const aiService = new MockAIService_1.MockAIService();
        // Execute use case
        const useCase = new CreateRequest_1.CreateRequestUseCase(requestRepository, jiraService, aiService);
        const input = {
            title: body.title.trim(),
            description: body.description.trim(),
            clientId: userContext.userId,
            clientName: userContext.userName
        };
        const result = await useCase.execute(input);
        return (0, utils_1.createSuccessResponse)(201, {
            message: 'Request created successfully',
            data: result
        }, origin);
    });
};
exports.handler = handler;
//# sourceMappingURL=createRequest.js.map