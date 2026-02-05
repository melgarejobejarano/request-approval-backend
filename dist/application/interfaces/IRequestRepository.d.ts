import { Request } from '../../domain/entities/Request';
/**
 * Request Repository Interface
 * Defines the contract for request persistence operations
 */
export interface IRequestRepository {
    /**
     * Save a new request
     */
    save(request: Request): Promise<void>;
    /**
     * Update an existing request
     */
    update(request: Request): Promise<void>;
    /**
     * Find a request by ID
     */
    findById(id: string): Promise<Request | null>;
    /**
     * Find all requests
     * @param includeCanceled - If true, includes canceled requests (default: false)
     */
    findAll(includeCanceled?: boolean): Promise<Request[]>;
    /**
     * Find requests by client ID
     * @param includeCanceled - If true, includes canceled requests (default: false)
     */
    findByClientId(clientId: string, includeCanceled?: boolean): Promise<Request[]>;
    /**
     * Delete a request by ID
     */
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=IRequestRepository.d.ts.map