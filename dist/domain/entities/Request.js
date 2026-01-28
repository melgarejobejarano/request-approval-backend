"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const uuid_1 = require("uuid");
const RequestStatus_1 = require("../value-objects/RequestStatus");
class Request {
    id;
    title;
    description;
    clientId;
    clientName;
    status;
    estimatedDays;
    estimationComment;
    estimatedBy;
    estimatedAt;
    approvedBy;
    approvalComment;
    approvedAt;
    jiraIssueKey;
    jiraIssueUrl;
    createdAt;
    updatedAt;
    constructor(props) {
        this.id = props.id || (0, uuid_1.v4)();
        this.title = props.title;
        this.description = props.description;
        this.clientId = props.clientId;
        this.clientName = props.clientName;
        this.status = props.status || RequestStatus_1.RequestStatus.NEW;
        this.estimatedDays = props.estimatedDays;
        this.estimationComment = props.estimationComment;
        this.estimatedBy = props.estimatedBy;
        this.estimatedAt = props.estimatedAt;
        this.approvedBy = props.approvedBy;
        this.approvalComment = props.approvalComment;
        this.approvedAt = props.approvedAt;
        this.jiraIssueKey = props.jiraIssueKey;
        this.jiraIssueUrl = props.jiraIssueUrl;
        this.createdAt = props.createdAt || new Date().toISOString();
        this.updatedAt = props.updatedAt || this.createdAt;
    }
    /**
     * Factory method to create a new Request
     */
    static create(props) {
        if (!props.title || props.title.trim().length === 0) {
            throw new Error('Request title is required');
        }
        if (!props.description || props.description.trim().length === 0) {
            throw new Error('Request description is required');
        }
        if (!props.clientId || props.clientId.trim().length === 0) {
            throw new Error('Client ID is required');
        }
        if (!props.clientName || props.clientName.trim().length === 0) {
            throw new Error('Client name is required');
        }
        return new Request(props);
    }
    /**
     * Reconstitute a Request from persistence
     */
    static fromPersistence(props) {
        return new Request(props);
    }
    /**
     * Add estimation to the request
     */
    estimate(estimatedDays, comment, estimatedBy) {
        if (this.status !== RequestStatus_1.RequestStatus.NEW) {
            throw new Error(`Cannot estimate request in ${this.status} status`);
        }
        if (estimatedDays <= 0) {
            throw new Error('Estimated days must be greater than 0');
        }
        this.estimatedDays = estimatedDays;
        this.estimationComment = comment;
        this.estimatedBy = estimatedBy;
        this.estimatedAt = new Date().toISOString();
        this.status = RequestStatus_1.RequestStatus.ESTIMATED;
        this.updatedAt = new Date().toISOString();
    }
    /**
     * Approve the request
     */
    approve(approvedBy, comment) {
        if (this.status !== RequestStatus_1.RequestStatus.ESTIMATED) {
            throw new Error(`Cannot approve request in ${this.status} status. Request must be estimated first.`);
        }
        this.approvedBy = approvedBy;
        this.approvalComment = comment;
        this.approvedAt = new Date().toISOString();
        this.status = RequestStatus_1.RequestStatus.APPROVED;
        this.updatedAt = new Date().toISOString();
    }
    /**
     * Reject the request
     */
    reject(rejectedBy, comment) {
        if (this.status !== RequestStatus_1.RequestStatus.ESTIMATED) {
            throw new Error(`Cannot reject request in ${this.status} status. Request must be estimated first.`);
        }
        if (!comment || comment.trim().length === 0) {
            throw new Error('Rejection comment is required');
        }
        this.approvedBy = rejectedBy;
        this.approvalComment = comment;
        this.approvedAt = new Date().toISOString();
        this.status = RequestStatus_1.RequestStatus.REJECTED;
        this.updatedAt = new Date().toISOString();
    }
    /**
     * Set JIRA issue information
     */
    setJiraIssue(issueKey, issueUrl) {
        this.jiraIssueKey = issueKey;
        this.jiraIssueUrl = issueUrl;
        this.updatedAt = new Date().toISOString();
    }
    /**
     * Check if the request can transition to a new status
     */
    canTransitionTo(newStatus) {
        return (0, RequestStatus_1.isValidStatusTransition)(this.status, newStatus);
    }
    /**
     * Check if the request is in a terminal state
     */
    isTerminal() {
        return (0, RequestStatus_1.isTerminalStatus)(this.status);
    }
    /**
     * Convert to plain object for persistence
     */
    toPersistence() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            clientId: this.clientId,
            clientName: this.clientName,
            status: this.status,
            estimatedDays: this.estimatedDays,
            estimationComment: this.estimationComment,
            estimatedBy: this.estimatedBy,
            estimatedAt: this.estimatedAt,
            approvedBy: this.approvedBy,
            approvalComment: this.approvalComment,
            approvedAt: this.approvedAt,
            jiraIssueKey: this.jiraIssueKey,
            jiraIssueUrl: this.jiraIssueUrl,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
    /**
     * Convert to API response format
     */
    toResponse() {
        return this.toPersistence();
    }
}
exports.Request = Request;
//# sourceMappingURL=Request.js.map