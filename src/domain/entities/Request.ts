import { v4 as uuidv4 } from 'uuid';
import { RequestStatus, isValidStatusTransition, isTerminalStatus } from '../value-objects/RequestStatus';

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

export class Request {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly clientId: string;
  public readonly clientName: string;
  public status: RequestStatus;
  public estimatedDays?: number;
  public estimationComment?: string;
  public estimatedBy?: string;
  public estimatedAt?: string;
  public approvedBy?: string;
  public approvalComment?: string;
  public approvedAt?: string;
  public jiraIssueKey?: string;
  public jiraIssueUrl?: string;
  public readonly createdAt: string;
  public updatedAt: string;

  private constructor(props: RequestProps) {
    this.id = props.id || uuidv4();
    this.title = props.title;
    this.description = props.description;
    this.clientId = props.clientId;
    this.clientName = props.clientName;
    this.status = props.status || RequestStatus.NEW;
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
  public static create(props: RequestProps): Request {
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
  public static fromPersistence(props: RequestProps): Request {
    return new Request(props);
  }

  /**
   * Add estimation to the request
   * Sets status to PENDING_APPROVAL (ready for approver review)
   */
  public estimate(estimatedDays: number, comment: string, estimatedBy: string): void {
    if (this.status !== RequestStatus.NEW) {
      throw new Error(`Cannot estimate request in ${this.status} status`);
    }
    if (estimatedDays <= 0) {
      throw new Error('Estimated days must be greater than 0');
    }

    this.estimatedDays = estimatedDays;
    this.estimationComment = comment;
    this.estimatedBy = estimatedBy;
    this.estimatedAt = new Date().toISOString();
    this.status = RequestStatus.PENDING_APPROVAL;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Approve the request
   */
  public approve(approvedBy: string, comment?: string): void {
    if (this.status !== RequestStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot approve request in ${this.status} status. Request must be estimated first.`);
    }

    this.approvedBy = approvedBy;
    this.approvalComment = comment;
    this.approvedAt = new Date().toISOString();
    this.status = RequestStatus.APPROVED;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Reject the request
   */
  public reject(rejectedBy: string, comment: string): void {
    if (this.status !== RequestStatus.PENDING_APPROVAL) {
      throw new Error(`Cannot reject request in ${this.status} status. Request must be estimated first.`);
    }
    if (!comment || comment.trim().length === 0) {
      throw new Error('Rejection comment is required');
    }

    this.approvedBy = rejectedBy;
    this.approvalComment = comment;
    this.approvedAt = new Date().toISOString();
    this.status = RequestStatus.REJECTED;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Set JIRA issue information
   */
  public setJiraIssue(issueKey: string, issueUrl: string): void {
    this.jiraIssueKey = issueKey;
    this.jiraIssueUrl = issueUrl;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Check if the request can transition to a new status
   */
  public canTransitionTo(newStatus: RequestStatus): boolean {
    return isValidStatusTransition(this.status, newStatus);
  }

  /**
   * Check if the request is in a terminal state
   */
  public isTerminal(): boolean {
    return isTerminalStatus(this.status);
  }

  /**
   * Convert to plain object for persistence
   */
  public toPersistence(): Record<string, unknown> {
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
  public toResponse(): Record<string, unknown> {
    return this.toPersistence();
  }
}
