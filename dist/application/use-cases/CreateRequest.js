"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRequestUseCase = void 0;
const Request_1 = require("../../domain/entities/Request");
/**
 * Create Request Use Case
 * Handles the creation of new client requests
 */
class CreateRequestUseCase {
    requestRepository;
    jiraService;
    aiService;
    constructor(requestRepository, jiraService, aiService) {
        this.requestRepository = requestRepository;
        this.jiraService = jiraService;
        this.aiService = aiService;
    }
    async execute(input) {
        // Create the request entity
        const requestProps = {
            title: input.title,
            description: input.description,
            clientId: input.clientId,
            clientName: input.clientName
        };
        const request = Request_1.Request.create(requestProps);
        // Create JIRA issue
        let jiraIssue;
        try {
            const jiraRequest = {
                summary: input.title,
                description: input.description,
                clientName: input.clientName,
                requestId: request.id
            };
            const jiraResponse = await this.jiraService.createIssue(jiraRequest);
            request.setJiraIssue(jiraResponse.issueKey, jiraResponse.issueUrl);
            jiraIssue = {
                issueKey: jiraResponse.issueKey,
                issueUrl: jiraResponse.issueUrl
            };
        }
        catch (error) {
            // Log error but don't fail the request creation
            console.error('Failed to create JIRA issue:', error);
        }
        // Get AI suggestions (optional, non-blocking)
        let aiSuggestion;
        try {
            if (await this.aiService.isAvailable()) {
                aiSuggestion = await this.aiService.analyzeRequest({
                    title: input.title,
                    description: input.description,
                    clientName: input.clientName
                });
            }
        }
        catch (error) {
            // Log error but don't fail the request creation
            console.error('Failed to get AI suggestions:', error);
        }
        // Save the request
        await this.requestRepository.save(request);
        return {
            request: request.toResponse(),
            jiraIssue,
            aiSuggestion
        };
    }
}
exports.CreateRequestUseCase = CreateRequestUseCase;
//# sourceMappingURL=CreateRequest.js.map