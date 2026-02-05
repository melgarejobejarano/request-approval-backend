# Client Request & Approval System

A production-ready backend API for managing client work requests with an approval workflow. Built on AWS serverless infrastructure using API Gateway, Lambda, and DynamoDB.

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Frontend Integration](#frontend-integration)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Replacing the AI Service](#replacing-the-ai-service)
- [Development](#development)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Clean Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐   │
│  │   Domain    │     │ Application │     │   Infrastructure    │   │
│  │  (Entities) │◄────│ (Use Cases) │◄────│    (AWS/Services)   │   │
│  └─────────────┘     └─────────────┘     └─────────────────────┘   │
│                                                                     │
│  • Request          • CreateRequest     • Lambda Handlers          │
│  • RequestStatus    • GetRequests       • DynamoDB Repository      │
│  • UserRole         • EstimateRequest   • JIRA Integration         │
│                     • ApproveRequest    • Mock AI Service          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────┐
         │             AWS Infrastructure           │
         ├──────────────────────────────────────────┤
         │                                          │
         │   ┌──────────────┐                       │
         │   │ API Gateway  │──► REST API + CORS   │
         │   └──────┬───────┘                       │
         │          │                               │
         │   ┌──────▼───────┐                       │
         │   │   Lambda     │──► 5 Functions       │
         │   └──────┬───────┘                       │
         │          │                               │
         │   ┌──────▼───────┐                       │
         │   │  DynamoDB    │──► ClientRequests    │
         │   └──────────────┘                       │
         │                                          │
         └──────────────────────────────────────────┘
```

## Features

### Request Workflow

```
NEW ──► PENDING_APPROVAL ──► APPROVED
             │           └──► REJECTED
             └──► CANCELED

(Any status) ──► CANCELED (except terminal states)
```

1. **CLIENT** creates a request → Status: `NEW`
2. **INTERNAL** user estimates effort → Status: `PENDING_APPROVAL`
3. **APPROVER** (Jules) approves or rejects → Status: `APPROVED` or `REJECTED`
4. Users can cancel requests before approval → Status: `CANCELED`

> **Note**: Legacy records with status `ESTIMATED` are automatically normalized to `PENDING_APPROVAL` on read.

### Core Capabilities

- ✅ Role-based access control (CLIENT, INTERNAL, APPROVER)
- ✅ Request lifecycle management
- ✅ JIRA integration for issue tracking
- ✅ AI-powered request analysis (mock, easily replaceable)
- ✅ Full CORS support for frontend integration
- ✅ Clean architecture for maintainability

## API Reference

### Base URL

```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}
```

### Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/requests` | Create a new request | CLIENT |
| GET | `/requests` | List requests | ALL |
| GET | `/requests/{id}` | Get request details | ALL |
| PATCH | `/requests/{id}/estimate` | Add estimation | INTERNAL |
| PATCH | `/requests/{id}/approve` | Approve/reject | APPROVER |

### Required Headers

```http
X-User-Id: user-123
X-User-Role: CLIENT | INTERNAL | APPROVER
X-User-Name: John Doe
Content-Type: application/json
```

### Example Requests

#### Create Request (CLIENT)

```bash
curl -X POST https://api.example.com/requests \
  -H "Content-Type: application/json" \
  -H "X-User-Id: client-001" \
  -H "X-User-Role: CLIENT" \
  -H "X-User-Name: Acme Corp" \
  -d '{
    "title": "Website Redesign",
    "description": "Complete redesign of corporate website with modern UI"
  }'
```

**Response:**
```json
{
  "message": "Request created successfully",
  "data": {
    "request": {
      "id": "abc-123",
      "title": "Website Redesign",
      "description": "Complete redesign...",
      "clientId": "client-001",
      "clientName": "Acme Corp",
      "status": "NEW",
      "createdAt": "2026-01-28T12:00:00.000Z",
      "jiraIssueKey": "REQ-42",
      "jiraIssueUrl": "https://jira.example.com/browse/REQ-42"
    },
    "aiSuggestion": {
      "suggested_tasks": ["Requirements analysis", "Technical design", ...],
      "complexity": "medium",
      "estimated_days": 10,
      "risks": ["Scope creep potential"]
    }
  }
}
```

#### Estimate Request (INTERNAL)

```bash
curl -X PATCH https://api.example.com/requests/abc-123/estimate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: internal-001" \
  -H "X-User-Role: INTERNAL" \
  -H "X-User-Name: Jane Engineer" \
  -d '{
    "estimated_days": 15,
    "comment": "Including design phase and two rounds of revisions"
  }'
```

#### Approve Request (APPROVER)

```bash
curl -X PATCH https://api.example.com/requests/abc-123/approve \
  -H "Content-Type: application/json" \
  -H "X-User-Id: approver-001" \
  -H "X-User-Role: APPROVER" \
  -H "X-User-Name: Jules" \
  -d '{
    "action": "approve",
    "comment": "Approved - proceed with phase 1"
  }'
```

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **CLIENT** | Create requests, View own requests |
| **INTERNAL** | View all requests, Estimate requests |
| **APPROVER** | View all requests, Approve/Reject requests |

### How Roles Work

1. **Authentication**: User role is passed via `X-User-Role` header
2. **Authorization**: Each endpoint checks if the user's role has the required permission
3. **Data Filtering**: CLIENTs only see their own requests; others see all

In production, you would integrate with an identity provider (Cognito, Auth0) that provides JWT tokens containing role claims.

## Frontend Integration

### React Example

```typescript
// api.ts
const API_BASE = 'https://your-api-gateway-url.amazonaws.com/production';

interface RequestHeaders {
  userId: string;
  userRole: 'CLIENT' | 'INTERNAL' | 'APPROVER';
  userName: string;
}

async function apiCall(
  endpoint: string,
  method: string,
  headers: RequestHeaders,
  body?: object
) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': headers.userId,
      'X-User-Role': headers.userRole,
      'X-User-Name': headers.userName,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

// Usage
export const requestsApi = {
  create: (headers: RequestHeaders, data: { title: string; description: string }) =>
    apiCall('/requests', 'POST', headers, data),
  
  getAll: (headers: RequestHeaders) =>
    apiCall('/requests', 'GET', headers),
  
  getById: (headers: RequestHeaders, id: string) =>
    apiCall(`/requests/${id}`, 'GET', headers),
  
  estimate: (headers: RequestHeaders, id: string, data: { estimated_days: number; comment: string }) =>
    apiCall(`/requests/${id}/estimate`, 'PATCH', headers, data),
  
  approve: (headers: RequestHeaders, id: string, data: { action: 'approve' | 'reject'; comment?: string }) =>
    apiCall(`/requests/${id}/approve`, 'PATCH', headers, data),
};
```

### React Component Example

```tsx
// RequestList.tsx
import { useEffect, useState } from 'react';
import { requestsApi } from './api';

export function RequestList({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = {
      userId: user.id,
      userRole: user.role,
      userName: user.name,
    };

    requestsApi.getAll(headers)
      .then(res => setRequests(res.data.requests))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {requests.map(req => (
        <div key={req.id}>
          <h3>{req.title}</h3>
          <span className={`status-${req.status.toLowerCase()}`}>
            {req.status}
          </span>
          {req.estimatedDays && <p>Estimated: {req.estimatedDays} days</p>}
        </div>
      ))}
    </div>
  );
}
```

## Deployment

Infrastructure is defined as code using AWS CloudFormation. The template is located at `cloudformation/template.yml`.

### Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials

### Deployment Methods

#### 1. GitHub Actions (Recommended for CI/CD)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys:

- **Push to `main`**: Deploys to production
- **Push to `develop`**: Deploys to development
- **Manual trigger**: Choose any environment

**Required GitHub Secrets:**
- `AWS_ROLE_ARN`: IAM role ARN for OIDC authentication
- `JIRA_BASE_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` (optional)

**Required GitHub Variables:**
- `ALLOWED_ORIGINS`: CORS allowed origins

#### 2. CloudFormation CLI Deploy

```bash
# Make the script executable
chmod +x cloudformation/deploy.sh

# Deploy to development
./cloudformation/deploy.sh development

# Deploy to production
./cloudformation/deploy.sh production
```

#### 3. AWS Console

1. Build the Lambda deployment package:
   ```bash
   npm ci && npm run build
   mkdir -p deployment && cp -r dist/* deployment/ && cp -r node_modules deployment/
   cd deployment && zip -r ../deployment.zip . && cd ..
   ```

2. Upload `deployment.zip` to an S3 bucket

3. Go to AWS CloudFormation Console → Create Stack

4. Upload `cloudformation/template.yml`

5. Fill in the parameters

### CloudFormation Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `Environment` | Deployment environment | `production` |
| `LambdaS3Bucket` | S3 bucket with Lambda code | Required |
| `LambdaS3Key` | S3 key for deployment.zip | `deployment.zip` |
| `JiraBaseUrl` | JIRA instance URL | (empty) |
| `JiraUsername` | JIRA username | (empty) |
| `JiraApiToken` | JIRA API token | (empty) |
| `JiraProjectKey` | JIRA project key | `REQ` |
| `AllowedOrigins` | CORS origins | `*` |
| `LambdaTimeout` | Lambda timeout (seconds) | `30` |
| `LambdaMemorySize` | Lambda memory (MB) | `256` |

### CloudFormation Outputs

After deployment, the stack provides these outputs:

| Output | Description |
|--------|-------------|
| `ApiGatewayUrl` | Base URL for the API |
| `DynamoDBTableName` | Name of the DynamoDB table |
| `LambdaExecutionRoleArn` | ARN of the Lambda IAM role |

### Delete Stack

```bash
aws cloudformation delete-stack --stack-name client-requests-production
```

## Configuration

### Environment Variables

Copy `env.example.txt` to your Lambda environment:

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_REGION` | AWS region (e.g., eu-central-1) | Yes |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name | Yes |
| `JIRA_BASE_URL` | JIRA instance URL | No |
| `JIRA_USERNAME` | JIRA username/email | No |
| `JIRA_API_TOKEN` | JIRA API token | No |
| `JIRA_PROJECT_KEY` | JIRA project key | No |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | No |

### JIRA Integration

To enable JIRA integration:

1. Generate an API token at https://id.atlassian.com/manage-profile/security/api-tokens
2. Set the environment variables:
   ```
   JIRA_BASE_URL=https://your-domain.atlassian.net
   JIRA_USERNAME=your-email@example.com
   JIRA_API_TOKEN=your-token
   JIRA_PROJECT_KEY=REQ
   ```

When JIRA is not configured, the system runs in mock mode and logs operations.

## Replacing the AI Service

The AI service is currently a mock implementation. To replace it with a real AI service:

### Step 1: Create a new implementation

```typescript
// src/infrastructure/integrations/OpenAIService.ts
import { IAIService, AISuggestion, AIAnalysisRequest } from '../../application/interfaces/IAIService';

export class OpenAIService implements IAIService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeRequest(request: AIAnalysisRequest): Promise<AISuggestion> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: 'Analyze the following request and provide structured suggestions...'
        }, {
          role: 'user',
          content: `Title: ${request.title}\nDescription: ${request.description}`
        }],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}
```

### Step 2: Update the handler dependency injection

```typescript
// In createRequest.ts
import { OpenAIService } from '../../integrations/OpenAIService';

// Replace:
const aiService = new MockAIService();

// With:
const aiService = new OpenAIService(process.env.OPENAI_API_KEY || '');
```

### Step 3: Add environment variable

Add `OPENAI_API_KEY` to your Lambda environment configuration.

## Development

### Project Structure

```
src/
├── domain/                 # Core business logic
│   ├── entities/          # Domain entities
│   └── value-objects/     # Value objects & enums
├── application/           # Application logic
│   ├── interfaces/        # Repository & service contracts
│   └── use-cases/         # Business use cases
├── infrastructure/        # External concerns
│   ├── aws/handlers/      # Lambda handlers
│   ├── persistence/       # DynamoDB implementation
│   └── integrations/      # JIRA, AI services
└── shared/               # Cross-cutting concerns
    ├── config/           # Configuration
    ├── errors/           # Error types
    └── middleware/       # CORS, auth middleware
```

### Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run linting
npm run lint

# Run tests
npm test
```

### Adding New Features

1. **Domain Changes**: Update entities/value objects in `src/domain/`
2. **Business Logic**: Create use cases in `src/application/use-cases/`
3. **API Endpoints**: Add handlers in `src/infrastructure/aws/handlers/`
4. **Update CloudFormation**: Add new Lambda functions to `cloudformation/template.yml`

### Project Files

```
├── cloudformation/
│   ├── template.yml          # CloudFormation infrastructure template
│   ├── deploy.sh             # Deployment script
│   └── parameters/           # Environment-specific parameters
│       ├── development.json
│       └── production.json
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD workflow
├── src/                      # Application source code
├── package.json
└── tsconfig.json
```

## License

MIT
