import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCorsHeaders, createCorsPreflightResponse } from '../../../shared/middleware/cors';
import { extractUserContext, UserContext } from '../../../shared/middleware/auth';
import { AppError, toErrorResponse, getStatusCode } from '../../../shared/errors';

/**
 * Create a successful JSON response
 */
export function createSuccessResponse(
  statusCode: number,
  body: unknown,
  origin?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(body)
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: Error | AppError,
  origin?: string
): APIGatewayProxyResult {
  const statusCode = getStatusCode(error);
  const errorResponse = toErrorResponse(error);

  // Log error for debugging
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack
  });

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(origin)
    },
    body: JSON.stringify(errorResponse)
  };
}

/**
 * Handler wrapper that provides common functionality
 */
export async function withHandler(
  event: APIGatewayProxyEvent,
  handler: (event: APIGatewayProxyEvent, userContext: UserContext) => Promise<APIGatewayProxyResult>
): Promise<APIGatewayProxyResult> {
  const origin = event.headers['origin'] || event.headers['Origin'];

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createCorsPreflightResponse(origin);
  }

  try {
    // Extract user context from headers
    const userContext = extractUserContext(event);

    // Execute the handler
    return await handler(event, userContext);
  } catch (error) {
    return createErrorResponse(error as Error, origin);
  }
}

/**
 * Parse JSON body from event
 */
export function parseBody<T>(event: APIGatewayProxyEvent): T {
  if (!event.body) {
    throw new AppError('Request body is required', 400);
  }

  try {
    return JSON.parse(event.body) as T;
  } catch {
    throw new AppError('Invalid JSON in request body', 400);
  }
}

/**
 * Get path parameter
 */
export function getPathParameter(event: APIGatewayProxyEvent, name: string): string {
  const value = event.pathParameters?.[name];
  if (!value) {
    throw new AppError(`Missing path parameter: ${name}`, 400);
  }
  return value;
}
