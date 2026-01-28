import { IRequestRepository } from '../interfaces/IRequestRepository';
import { IJiraService } from '../interfaces/IJiraService';
import { IAIService, AISuggestion } from '../interfaces/IAIService';
export interface CreateRequestInput {
    title: string;
    description: string;
    clientId: string;
    clientName: string;
}
export interface CreateRequestOutput {
    request: Record<string, unknown>;
    jiraIssue?: {
        issueKey: string;
        issueUrl: string;
    };
    aiSuggestion?: AISuggestion;
}
/**
 * Create Request Use Case
 * Handles the creation of new client requests
 */
export declare class CreateRequestUseCase {
    private readonly requestRepository;
    private readonly jiraService;
    private readonly aiService;
    constructor(requestRepository: IRequestRepository, jiraService: IJiraService, aiService: IAIService);
    execute(input: CreateRequestInput): Promise<CreateRequestOutput>;
}
//# sourceMappingURL=CreateRequest.d.ts.map