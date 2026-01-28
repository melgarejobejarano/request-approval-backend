import { IJiraService, JiraIssueResponse, CreateJiraIssueRequest } from '../../application/interfaces/IJiraService';
/**
 * JIRA Service Implementation
 * Integrates with JIRA REST API for issue management
 */
export declare class JiraService implements IJiraService {
    private readonly baseUrl;
    private readonly authHeader;
    private readonly projectKey;
    constructor();
    private makeRequest;
    createIssue(request: CreateJiraIssueRequest): Promise<JiraIssueResponse>;
    updateIssueStatus(issueKey: string, status: string): Promise<void>;
    addComment(issueKey: string, comment: string): Promise<void>;
    getIssue(issueKey: string): Promise<JiraIssueResponse | null>;
}
//# sourceMappingURL=JiraService.d.ts.map