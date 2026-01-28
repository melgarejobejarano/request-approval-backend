"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraService = void 0;
const config_1 = require("../../shared/config");
const errors_1 = require("../../shared/errors");
/**
 * JIRA Service Implementation
 * Integrates with JIRA REST API for issue management
 */
class JiraService {
    baseUrl;
    authHeader;
    projectKey;
    constructor() {
        const config = (0, config_1.getConfig)();
        this.baseUrl = config.jira.baseUrl;
        this.projectKey = config.jira.projectKey;
        // Create Basic Auth header
        const credentials = Buffer.from(`${config.jira.username}:${config.jira.apiToken}`).toString('base64');
        this.authHeader = `Basic ${credentials}`;
    }
    async makeRequest(endpoint, method, body) {
        if (!(0, config_1.isJiraConfigured)()) {
            console.warn('JIRA is not configured. Skipping JIRA operation.');
            return null;
        }
        const url = `${this.baseUrl}/rest/api/3${endpoint}`;
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: this.authHeader,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: body ? JSON.stringify(body) : undefined
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new errors_1.ExternalServiceError('JIRA', `HTTP ${response.status}: ${errorText}`);
            }
            if (response.status === 204) {
                return null;
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof errors_1.ExternalServiceError) {
                throw error;
            }
            throw new errors_1.ExternalServiceError('JIRA', `Request failed: ${error}`);
        }
    }
    async createIssue(request) {
        if (!(0, config_1.isJiraConfigured)()) {
            // Return mock response when JIRA is not configured
            const mockKey = `${this.projectKey}-MOCK-${Date.now()}`;
            return {
                issueKey: mockKey,
                issueUrl: `https://jira.example.com/browse/${mockKey}`,
                status: 'Pending Approval'
            };
        }
        const issueBody = {
            fields: {
                project: {
                    key: this.projectKey
                },
                summary: request.summary,
                description: {
                    type: 'doc',
                    version: 1,
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: request.description
                                }
                            ]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: `Client: ${request.clientName}`
                                }
                            ]
                        },
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: `Request ID: ${request.requestId}`
                                }
                            ]
                        }
                    ]
                },
                issuetype: {
                    name: 'Task'
                },
                labels: ['client-request', 'pending-approval']
            }
        };
        const result = await this.makeRequest('/issue', 'POST', issueBody);
        return {
            issueKey: result.key,
            issueUrl: `${this.baseUrl}/browse/${result.key}`,
            status: 'Pending Approval'
        };
    }
    async updateIssueStatus(issueKey, status) {
        if (!(0, config_1.isJiraConfigured)()) {
            console.log(`[MOCK JIRA] Would update issue ${issueKey} to status: ${status}`);
            return;
        }
        // First, get available transitions
        const transitionsResponse = await this.makeRequest(`/issue/${issueKey}/transitions`, 'GET');
        if (!transitionsResponse) {
            return;
        }
        // Find the transition that matches the target status
        const transition = transitionsResponse.transitions.find(t => t.name.toLowerCase() === status.toLowerCase());
        if (!transition) {
            console.warn(`No transition found for status: ${status}`);
            return;
        }
        // Execute the transition
        await this.makeRequest(`/issue/${issueKey}/transitions`, 'POST', {
            transition: { id: transition.id }
        });
    }
    async addComment(issueKey, comment) {
        if (!(0, config_1.isJiraConfigured)()) {
            console.log(`[MOCK JIRA] Would add comment to ${issueKey}: ${comment}`);
            return;
        }
        await this.makeRequest(`/issue/${issueKey}/comment`, 'POST', {
            body: {
                type: 'doc',
                version: 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: comment
                            }
                        ]
                    }
                ]
            }
        });
    }
    async getIssue(issueKey) {
        if (!(0, config_1.isJiraConfigured)()) {
            return null;
        }
        const result = await this.makeRequest(`/issue/${issueKey}`, 'GET');
        if (!result) {
            return null;
        }
        return {
            issueKey: result.key,
            issueUrl: `${this.baseUrl}/browse/${result.key}`,
            status: result.fields.status.name
        };
    }
}
exports.JiraService = JiraService;
//# sourceMappingURL=JiraService.js.map