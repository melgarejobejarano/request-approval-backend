import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateRequestUseCase, CreateRequestInput } from '../../../application/use-cases/CreateRequest';
import { DynamoDBRequestRepository } from '../../persistence/DynamoDBRequestRepository';
import { JiraService } from '../../integrations/JiraService';
import { MockAIService } from '../../integrations/MockAIService';
import { UserRole } from '../../../domain/value-objects/UserRole';
import { ValidationError, UnauthorizedError } from '../../../shared/errors';
import { withHandler, createSuccessResponse, parseBody } from './utils';

interface CreateRequestBody {
  title: string;
  description: string;
}

/**
 * Create Request Lambda Handler
 * POST /requests
 * 
 * Required headers:
 * - X-User-Id: Client's user ID
 * - X-User-Role: Must be CLIENT
 * - X-User-Name: Client's display name
 * 
 * Request body:
 * {
 *   "title": "Request title",
 *   "description": "Request description"
 * }
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return withHandler(event, async (evt, userContext) => {
    const origin = evt.headers['origin'] || evt.headers['Origin'];

    // Only CLIENT role can create requests
    if (userContext.userRole !== UserRole.CLIENT) {
      throw new UnauthorizedError('Only CLIENT users can create requests');
    }

    // Parse and validate request body
    const body = parseBody<CreateRequestBody>(evt);

    if (!body.title || body.title.trim().length === 0) {
      throw new ValidationError('Title is required');
    }

    if (!body.description || body.description.trim().length === 0) {
      throw new ValidationError('Description is required');
    }

    // Initialize dependencies
    const requestRepository = new DynamoDBRequestRepository();
    const jiraService = new JiraService();
    const aiService = new MockAIService();

    // Execute use case
    const useCase = new CreateRequestUseCase(
      requestRepository,
      jiraService,
      aiService
    );

    const input: CreateRequestInput = {
      title: body.title.trim(),
      description: body.description.trim(),
      clientId: userContext.userId,
      clientName: userContext.userName
    };

    const result = await useCase.execute(input);

    return createSuccessResponse(201, {
      message: 'Request created successfully',
      data: result
    }, origin);
  });
};
