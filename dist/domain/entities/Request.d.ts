import { RequestStatus } from '../value-objects/RequestStatus';
/**
 * Request Entity
 * Represents a client work request in the system
 */
export interface RequestProps {
    id?: string;
    title: string;
    description: string;
    clientId: string;
    clientName: string;
    status?: RequestStatus;
    estimatedDays?: number;
    estimationComment?: string;
    estimatedBy?: string;
    estimatedAt?: string;
    approvedBy?: string;
    approvalComment?: string;
    approvedAt?: string;
    jiraIssueKey?: string;
    jiraIssueUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}
export declare class Request {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly clientId: string;
    readonly clientName: string;
    status: RequestStatus;
    estimatedDays?: number;
    estimationComment?: string;
    estimatedBy?: string;
    estimatedAt?: string;
    approvedBy?: string;
    approvalComment?: string;
    approvedAt?: string;
    jiraIssueKey?: string;
    jiraIssueUrl?: string;
    readonly createdAt: string;
    updatedAt: string;
    private constructor();
    /**
     * Factory method to create a new Request
     */
    static create(props: RequestProps): Request;
    /**
     * Reconstitute a Request from persistence
     */
    static fromPersistence(props: RequestProps): Request;
    /**
     * Add estimation to the request
     */
    estimate(estimatedDays: number, comment: string, estimatedBy: string): void;
    /**
     * Approve the request
     */
    approve(approvedBy: string, comment?: string): void;
    /**
     * Reject the request
     */
    reject(rejectedBy: string, comment: string): void;
    /**
     * Set JIRA issue information
     */
    setJiraIssue(issueKey: string, issueUrl: string): void;
    /**
     * Check if the request can transition to a new status
     */
    canTransitionTo(newStatus: RequestStatus): boolean;
    /**
     * Check if the request is in a terminal state
     */
    isTerminal(): boolean;
    /**
     * Convert to plain object for persistence
     */
    toPersistence(): Record<string, unknown>;
    /**
     * Convert to API response format
     */
    toResponse(): Record<string, unknown>;
}
//# sourceMappingURL=Request.d.ts.map