import { Request } from '../../domain/entities/Request';
import { IRequestRepository } from '../../application/interfaces/IRequestRepository';
/**
 * DynamoDB Request Repository
 * Implements the IRequestRepository interface for DynamoDB persistence
 */
export declare class DynamoDBRequestRepository implements IRequestRepository {
    private readonly docClient;
    private readonly tableName;
    constructor();
    save(request: Request): Promise<void>;
    update(request: Request): Promise<void>;
    findById(id: string): Promise<Request | null>;
    findAll(): Promise<Request[]>;
    findByClientId(clientId: string): Promise<Request[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=DynamoDBRequestRepository.d.ts.map