#!/bin/bash

# Client Request & Approval System - Manual Deployment Script
# Use this if AWS SAM CLI is not available
# Usage: ./scripts/deploy-manual.sh [region]

set -e

REGION=${1:-eu-central-1}
STACK_NAME="client-request-approval-system"
TABLE_NAME="ClientRequests"

echo "=========================================="
echo "Manual AWS Deployment"
echo "Region: $REGION"
echo "=========================================="

# Check AWS CLI
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required. Aborting." >&2; exit 1; }

# Build the project
echo ""
echo "Step 1: Building project..."
npm ci
npm run build

# Create deployment package
echo ""
echo "Step 2: Creating deployment package..."
cd dist
zip -r ../deployment.zip .
cd ..

# Check if DynamoDB table exists
echo ""
echo "Step 3: Creating DynamoDB table..."
TABLE_EXISTS=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" 2>&1 || true)

if echo "$TABLE_EXISTS" | grep -q "ResourceNotFoundException"; then
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
            AttributeName=clientId,AttributeType=S \
        --key-schema AttributeName=id,KeyType=HASH \
        --global-secondary-indexes \
            "[{
                \"IndexName\": \"clientId-index\",
                \"KeySchema\": [{\"AttributeName\":\"clientId\",\"KeyType\":\"HASH\"}],
                \"Projection\": {\"ProjectionType\":\"ALL\"}
            }]" \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION"
    
    echo "Waiting for table to be active..."
    aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
    echo "DynamoDB table created successfully!"
else
    echo "DynamoDB table already exists."
fi

# Create IAM role for Lambda (if not exists)
echo ""
echo "Step 4: Creating IAM role..."
ROLE_NAME="ClientRequestsLambdaRole"
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text 2>/dev/null || true)

if [ -z "$ROLE_ARN" ]; then
    # Create the role
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }'
    
    # Attach policies
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Create DynamoDB policy
    aws iam put-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-name DynamoDBAccess \
        --policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Scan",
                    "dynamodb:Query"
                ],
                "Resource": [
                    "arn:aws:dynamodb:'$REGION':*:table/'$TABLE_NAME'",
                    "arn:aws:dynamodb:'$REGION':*:table/'$TABLE_NAME'/index/*"
                ]
            }]
        }'
    
    # Wait for role to propagate
    echo "Waiting for IAM role to propagate..."
    sleep 10
    
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
    echo "IAM role created: $ROLE_ARN"
else
    echo "IAM role already exists: $ROLE_ARN"
fi

# Define Lambda functions
FUNCTIONS=(
    "CreateRequest:infrastructure/aws/handlers/createRequest.handler"
    "GetRequests:infrastructure/aws/handlers/getRequests.handler"
    "GetRequestById:infrastructure/aws/handlers/getRequestById.handler"
    "EstimateRequest:infrastructure/aws/handlers/estimateRequest.handler"
    "ApproveRequest:infrastructure/aws/handlers/approveRequest.handler"
)

echo ""
echo "Step 5: Creating/Updating Lambda functions..."
for func in "${FUNCTIONS[@]}"; do
    IFS=':' read -r NAME HANDLER <<< "$func"
    FUNCTION_NAME="${STACK_NAME}-${NAME}"
    
    # Check if function exists
    FUNC_EXISTS=$(aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" 2>&1 || true)
    
    if echo "$FUNC_EXISTS" | grep -q "ResourceNotFoundException"; then
        echo "Creating function: $FUNCTION_NAME"
        aws lambda create-function \
            --function-name "$FUNCTION_NAME" \
            --runtime nodejs18.x \
            --role "$ROLE_ARN" \
            --handler "$HANDLER" \
            --zip-file fileb://deployment.zip \
            --timeout 30 \
            --memory-size 256 \
            --environment "Variables={DYNAMODB_TABLE_NAME=$TABLE_NAME,NODE_ENV=production,ALLOWED_ORIGINS=http://localhost:3000}" \
            --region "$REGION"
    else
        echo "Updating function: $FUNCTION_NAME"
        aws lambda update-function-code \
            --function-name "$FUNCTION_NAME" \
            --zip-file fileb://deployment.zip \
            --region "$REGION"
    fi
done

echo ""
echo "=========================================="
echo "Lambda functions deployed!"
echo ""
echo "Next steps:"
echo "1. Create an API Gateway REST API"
echo "2. Configure the routes to point to Lambda functions"
echo "3. Enable CORS on API Gateway"
echo "4. Deploy the API to a stage"
echo ""
echo "Or use SAM CLI for automated API Gateway setup:"
echo "  sam deploy --guided"
echo "=========================================="
