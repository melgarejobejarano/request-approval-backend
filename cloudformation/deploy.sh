#!/bin/bash
set -e

# =============================================================================
# Client Request & Approval System - CloudFormation Deployment Script
# =============================================================================
# Usage: ./cloudformation/deploy.sh [environment]
# Environments: development, staging, production (default: development)
# =============================================================================

ENVIRONMENT=${1:-development}
STACK_NAME="client-requests-${ENVIRONMENT}"
REGION=${AWS_REGION:-eu-central-1}
S3_BUCKET="client-requests-deployments-${ENVIRONMENT}"

echo "========================================"
echo "CloudFormation Deployment"
echo "========================================"
echo "Environment: ${ENVIRONMENT}"
echo "Stack Name:  ${STACK_NAME}"
echo "Region:      ${REGION}"
echo "========================================"

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Aborting." >&2; exit 1; }

# Verify AWS credentials
echo ""
echo "Step 1: Verifying AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1 || { echo "AWS credentials not configured." >&2; exit 1; }
echo "✓ AWS credentials verified"

# Build the project
echo ""
echo "Step 2: Building project..."
npm ci
npm run build
echo "✓ Build complete"

# Create deployment package
echo ""
echo "Step 3: Creating deployment package..."
rm -rf deployment deployment.zip
mkdir -p deployment
cp -r dist/* deployment/
cp -r node_modules deployment/
cd deployment
zip -qr ../deployment.zip .
cd ..
rm -rf deployment
echo "✓ Deployment package created"

# Create S3 bucket if it doesn't exist
echo ""
echo "Step 4: Setting up S3 bucket..."
if ! aws s3api head-bucket --bucket "${S3_BUCKET}" 2>/dev/null; then
    aws s3 mb "s3://${S3_BUCKET}" --region "${REGION}"
    echo "✓ Created S3 bucket: ${S3_BUCKET}"
else
    echo "✓ S3 bucket exists: ${S3_BUCKET}"
fi

# Upload deployment package to S3
echo ""
echo "Step 5: Uploading deployment package to S3..."
S3_KEY="deployment-$(date +%Y%m%d-%H%M%S).zip"
aws s3 cp deployment.zip "s3://${S3_BUCKET}/${S3_KEY}"
echo "✓ Uploaded to s3://${S3_BUCKET}/${S3_KEY}"

# Validate CloudFormation template
echo ""
echo "Step 6: Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://cloudformation/template.yml \
    --region "${REGION}" > /dev/null
echo "✓ Template validation passed"

# Deploy CloudFormation stack
echo ""
echo "Step 7: Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file cloudformation/template.yml \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        Environment="${ENVIRONMENT}" \
        LambdaS3Bucket="${S3_BUCKET}" \
        LambdaS3Key="${S3_KEY}" \
    --tags \
        Environment="${ENVIRONMENT}" \
        Application=ClientRequestApprovalSystem \
    --no-fail-on-empty-changeset

# Get outputs
echo ""
echo "Step 8: Retrieving stack outputs..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
    --output text)

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query "Stacks[0].Outputs[?OutputKey=='DynamoDBTableName'].OutputValue" \
    --output text)

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "API Gateway URL:"
echo "  ${API_URL}"
echo ""
echo "DynamoDB Table:"
echo "  ${TABLE_NAME}"
echo ""
echo "Available Endpoints:"
echo "  POST   ${API_URL}/requests           - Create request (CLIENT)"
echo "  GET    ${API_URL}/requests           - List requests"
echo "  GET    ${API_URL}/requests/{id}      - Get request by ID"
echo "  PATCH  ${API_URL}/requests/{id}/estimate  - Estimate (INTERNAL)"
echo "  PATCH  ${API_URL}/requests/{id}/approve   - Approve/Reject (APPROVER)"
echo ""
echo "========================================"

# Cleanup local deployment package
rm -f deployment.zip
