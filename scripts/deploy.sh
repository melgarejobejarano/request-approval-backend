#!/bin/bash

# Client Request & Approval System - Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environment: development | staging | production (default: production)

set -e

ENVIRONMENT=${1:-production}

echo "=========================================="
echo "Client Request & Approval System"
echo "Deploying to: $ENVIRONMENT"
echo "=========================================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "AWS SAM CLI is required but not installed. Aborting." >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required but not installed. Aborting." >&2; exit 1; }

# Check AWS credentials
echo "Checking AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1 || { echo "AWS credentials not configured. Please run 'aws configure'." >&2; exit 1; }

echo ""
echo "Step 1: Installing dependencies..."
npm ci

echo ""
echo "Step 2: Building TypeScript..."
npm run build

echo ""
echo "Step 3: Validating SAM template..."
sam validate

echo ""
echo "Step 4: Building SAM application..."
sam build

echo ""
echo "Step 5: Deploying to AWS..."
if [ "$ENVIRONMENT" = "development" ]; then
    sam deploy --config-env development
else
    sam deploy --parameter-overrides "Environment=$ENVIRONMENT"
fi

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="

# Get and display the API endpoint
STACK_NAME="client-request-approval-system"
if [ "$ENVIRONMENT" = "development" ]; then
    STACK_NAME="client-request-approval-system-dev"
fi

API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" --output text 2>/dev/null || echo "")

if [ -n "$API_ENDPOINT" ]; then
    echo ""
    echo "API Endpoint: $API_ENDPOINT"
    echo ""
    echo "Available endpoints:"
    echo "  POST   $API_ENDPOINT/requests           - Create request (CLIENT)"
    echo "  GET    $API_ENDPOINT/requests           - List requests"
    echo "  GET    $API_ENDPOINT/requests/{id}      - Get request by ID"
    echo "  PATCH  $API_ENDPOINT/requests/{id}/estimate  - Estimate (INTERNAL)"
    echo "  PATCH  $API_ENDPOINT/requests/{id}/approve   - Approve/Reject (APPROVER)"
fi
