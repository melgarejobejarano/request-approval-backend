import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { Request, RequestProps } from '../../domain/entities/Request';
import { IRequestRepository } from '../../application/interfaces/IRequestRepository';
import { getConfig } from '../../shared/config';
import { normalizeStatus, RequestStatus } from '../../domain/value-objects/RequestStatus';

/**
 * DynamoDB Request Repository
 * Implements the IRequestRepository interface for DynamoDB persistence
 */
export class DynamoDBRequestRepository implements IRequestRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const config = getConfig();
    const client = new DynamoDBClient({ region: config.aws.region });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = config.aws.dynamoDBTableName;
  }

  /**
   * Normalize item from DynamoDB, handling legacy status values
   * Converts ESTIMATED -> PENDING_APPROVAL for backward compatibility
   */
  private normalizeItem(item: Record<string, unknown>): RequestProps {
    if (item.status && typeof item.status === 'string') {
      item.status = normalizeStatus(item.status);
    }
    return item as unknown as RequestProps;
  }

  async save(request: Request): Promise<void> {
    const item = request.toPersistence();

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(id)'
      })
    );
  }

  async update(request: Request): Promise<void> {
    const item = request.toPersistence();

    // Build update expression dynamically
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    const fieldsToUpdate = [
      'status',
      'estimatedDays',
      'estimationComment',
      'estimatedBy',
      'estimatedAt',
      'approvedBy',
      'approvalComment',
      'approvedAt',
      'canceledBy',
      'canceledAt',
      'cancelReason',
      'jiraIssueKey',
      'jiraIssueUrl',
      'updatedAt'
    ];

    fieldsToUpdate.forEach((field, index) => {
      const value = item[field];
      if (value !== undefined) {
        const placeholder = `#field${index}`;
        const valuePlaceholder = `:value${index}`;
        updateExpressionParts.push(`${placeholder} = ${valuePlaceholder}`);
        expressionAttributeNames[placeholder] = field;
        expressionAttributeValues[valuePlaceholder] = value;
      }
    });

    if (updateExpressionParts.length === 0) {
      return; // Nothing to update
    }

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: request.id },
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(id)'
      })
    );
  }

  async findById(id: string): Promise<Request | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id }
      })
    );

    if (!result.Item) {
      return null;
    }

    return Request.fromPersistence(this.normalizeItem(result.Item as Record<string, unknown>));
  }

  async findAll(includeCanceled: boolean = false): Promise<Request[]> {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName
      })
    );

    if (!result.Items) {
      return [];
    }

    let requests = result.Items.map(item => Request.fromPersistence(this.normalizeItem(item as Record<string, unknown>)));
    
    // Filter out canceled requests unless explicitly requested
    if (!includeCanceled) {
      requests = requests.filter(r => r.status !== RequestStatus.CANCELED);
    }
    
    return requests;
  }

  async findByClientId(clientId: string, includeCanceled: boolean = false): Promise<Request[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'clientId-index',
        KeyConditionExpression: 'clientId = :clientId',
        ExpressionAttributeValues: {
          ':clientId': clientId
        }
      })
    );

    if (!result.Items) {
      return [];
    }

    let requests = result.Items.map(item => Request.fromPersistence(this.normalizeItem(item as Record<string, unknown>)));
    
    // Filter out canceled requests unless explicitly requested
    if (!includeCanceled) {
      requests = requests.filter(r => r.status !== RequestStatus.CANCELED);
    }
    
    return requests;
  }

  async delete(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id }
      })
    );
  }
}
