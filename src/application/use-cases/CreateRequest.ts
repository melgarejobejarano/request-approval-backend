import { Request, RequestProps } from '../../domain/entities/Request';
import { IRequestRepository } from '../interfaces/IRequestRepository';
import { IJiraService, CreateJiraIssueRequest } from '../interfaces/IJiraService';
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
export class CreateRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly jiraService: IJiraService,
    private readonly aiService: IAIService
  ) {}

  async execute(input: CreateRequestInput): Promise<CreateRequestOutput> {
    // Create the request entity
    const requestProps: RequestProps = {
      title: input.title,
      description: input.description,
      clientId: input.clientId,
      clientName: input.clientName
    };

    const request = Request.create(requestProps);

    // Create JIRA issue
    let jiraIssue: { issueKey: string; issueUrl: string } | undefined;
    try {
      const jiraRequest: CreateJiraIssueRequest = {
        summary: input.title,
        description: input.description,
        clientName: input.clientName,
        requestId: request.id
      };

      const jiraResponse = await this.jiraService.createIssue(jiraRequest);
      request.setJiraIssue(jiraResponse.issueKey, jiraResponse.issueUrl);
      jiraIssue = {
        issueKey: jiraResponse.issueKey,
        issueUrl: jiraResponse.issueUrl
      };
    } catch (error) {
      // Log error but don't fail the request creation
      console.error('Failed to create JIRA issue:', error);
    }

    // Get AI suggestions (optional, non-blocking)
    let aiSuggestion: AISuggestion | undefined;
    try {
      if (await this.aiService.isAvailable()) {
        aiSuggestion = await this.aiService.analyzeRequest({
          title: input.title,
          description: input.description,
          clientName: input.clientName
        });
      }
    } catch (error) {
      // Log error but don't fail the request creation
      console.error('Failed to get AI suggestions:', error);
    }

    // Save the request
    await this.requestRepository.save(request);

    return {
      request: request.toResponse(),
      jiraIssue,
      aiSuggestion
    };
  }
}
