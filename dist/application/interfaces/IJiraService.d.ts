/**
 * JIRA Issue Response
 */
export interface JiraIssueResponse {
    issueKey: string;
    issueUrl: string;
    status: string;
}
/**
 * JIRA Issue Creation Request
 */
export interface CreateJiraIssueRequest {
    summary: string;
    description: string;
    clientName: string;
    requestId: string;
}
/**
 * JIRA Service Interface
 * Defines the contract for JIRA integration operations
 */
export interface IJiraService {
    /**
     * Create a new JIRA issue
     * @param request The issue creation request
     * @returns The created issue details
     */
    createIssue(request: CreateJiraIssueRequest): Promise<JiraIssueResponse>;
    /**
     * Update JIRA issue status
     * @param issueKey The JIRA issue key (e.g., "REQ-123")
     * @param status The new status
     */
    updateIssueStatus(issueKey: string, status: string): Promise<void>;
    /**
     * Add a comment to a JIRA issue
     * @param issueKey The JIRA issue key
     * @param comment The comment text
     */
    addComment(issueKey: string, comment: string): Promise<void>;
    /**
     * Get issue details
     * @param issueKey The JIRA issue key
     */
    getIssue(issueKey: string): Promise<JiraIssueResponse | null>;
    /**
     * Add a label to an issue (best-effort, does not throw)
     * @param issueKey The JIRA issue key
     * @param label The label to add
     * @returns true if successful, false otherwise
     */
    addLabel(issueKey: string, label: string): Promise<boolean>;
}
//# sourceMappingURL=IJiraService.d.ts.map