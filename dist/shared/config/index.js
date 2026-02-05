"use strict";
/**
 * Application Configuration
 * Centralized configuration management using environment variables
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.getConfig = getConfig;
exports.isJiraConfigured = isJiraConfigured;
exports.isProduction = isProduction;
function getEnvVar(name, defaultValue) {
    const value = process.env[name];
    if (!value && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value || defaultValue || '';
}
function getEnvVarOptional(name, defaultValue = '') {
    return process.env[name] || defaultValue;
}
/**
 * Load configuration from environment variables
 */
function loadConfig() {
    return {
        aws: {
            region: getEnvVar('AWS_REGION', 'eu-central-1'),
            dynamoDBTableName: getEnvVar('DYNAMODB_TABLE_NAME', 'ClientRequests')
        },
        jira: {
            baseUrl: getEnvVarOptional('JIRA_BASE_URL'),
            username: getEnvVarOptional('JIRA_USERNAME'),
            apiToken: getEnvVarOptional('JIRA_API_TOKEN'),
            projectKey: getEnvVarOptional('JIRA_PROJECT_KEY', 'REQ'),
            canceledLabel: getEnvVarOptional('JIRA_CANCELED_LABEL', 'requestflow-canceled')
        },
        app: {
            environment: getEnvVarOptional('NODE_ENV', 'development'),
            logLevel: getEnvVarOptional('LOG_LEVEL', 'info')
        },
        cors: {
            allowedOrigins: getEnvVarOptional('ALLOWED_ORIGINS', 'http://localhost:3000')
                .split(',')
                .map(origin => origin.trim())
                .filter(origin => origin.length > 0)
        }
    };
}
/**
 * Singleton config instance
 */
let configInstance = null;
function getConfig() {
    if (!configInstance) {
        configInstance = loadConfig();
    }
    return configInstance;
}
/**
 * Check if JIRA integration is configured
 */
function isJiraConfigured() {
    const config = getConfig();
    return !!(config.jira.baseUrl && config.jira.username && config.jira.apiToken);
}
/**
 * Check if running in production
 */
function isProduction() {
    return getConfig().app.environment === 'production';
}
//# sourceMappingURL=index.js.map