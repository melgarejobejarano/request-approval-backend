"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBRequestRepository = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const Request_1 = require("../../domain/entities/Request");
const config_1 = require("../../shared/config");
const RequestStatus_1 = require("../../domain/value-objects/RequestStatus");
/**
 * DynamoDB Request Repository
 * Implements the IRequestRepository interface for DynamoDB persistence
 */
class DynamoDBRequestRepository {
    docClient;
    tableName;
    constructor() {
        const config = (0, config_1.getConfig)();
        const client = new client_dynamodb_1.DynamoDBClient({ region: config.aws.region });
        this.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
        this.tableName = config.aws.dynamoDBTableName;
    }
    /**
     * Normalize item from DynamoDB, handling legacy status values
     * Converts ESTIMATED -> PENDING_APPROVAL for backward compatibility
     */
    normalizeItem(item) {
        if (item.status && typeof item.status === 'string') {
            item.status = (0, RequestStatus_1.normalizeStatus)(item.status);
        }
        return item;
    }
    async save(request) {
        const item = request.toPersistence();
        await this.docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: this.tableName,
            Item: item,
            ConditionExpression: 'attribute_not_exists(id)'
        }));
    }
    async update(request) {
        const item = request.toPersistence();
        // Build update expression dynamically
        const updateExpressionParts = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};
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
        await this.docClient.send(new lib_dynamodb_1.UpdateCommand({
            TableName: this.tableName,
            Key: { id: request.id },
            UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ConditionExpression: 'attribute_exists(id)'
        }));
    }
    async findById(id) {
        const result = await this.docClient.send(new lib_dynamodb_1.GetCommand({
            TableName: this.tableName,
            Key: { id }
        }));
        if (!result.Item) {
            return null;
        }
        return Request_1.Request.fromPersistence(this.normalizeItem(result.Item));
    }
    async findAll(includeCanceled = false) {
        const result = await this.docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: this.tableName
        }));
        if (!result.Items) {
            return [];
        }
        let requests = result.Items.map(item => Request_1.Request.fromPersistence(this.normalizeItem(item)));
        // Filter out canceled requests unless explicitly requested
        if (!includeCanceled) {
            requests = requests.filter(r => r.status !== RequestStatus_1.RequestStatus.CANCELED);
        }
        return requests;
    }
    async findByClientId(clientId, includeCanceled = false) {
        const result = await this.docClient.send(new lib_dynamodb_1.QueryCommand({
            TableName: this.tableName,
            IndexName: 'clientId-index',
            KeyConditionExpression: 'clientId = :clientId',
            ExpressionAttributeValues: {
                ':clientId': clientId
            }
        }));
        if (!result.Items) {
            return [];
        }
        let requests = result.Items.map(item => Request_1.Request.fromPersistence(this.normalizeItem(item)));
        // Filter out canceled requests unless explicitly requested
        if (!includeCanceled) {
            requests = requests.filter(r => r.status !== RequestStatus_1.RequestStatus.CANCELED);
        }
        return requests;
    }
    async delete(id) {
        await this.docClient.send(new lib_dynamodb_1.DeleteCommand({
            TableName: this.tableName,
            Key: { id }
        }));
    }
}
exports.DynamoDBRequestRepository = DynamoDBRequestRepository;
//# sourceMappingURL=DynamoDBRequestRepository.js.map