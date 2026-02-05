/**
 * Application Configuration
 * Centralized configuration management using environment variables
 */
export interface Config {
    aws: {
        region: string;
        dynamoDBTableName: string;
    };
    jira: {
        baseUrl: string;
        username: string;
        apiToken: string;
        projectKey: string;
        canceledLabel: string;
    };
    app: {
        environment: string;
        logLevel: string;
    };
    cors: {
        allowedOrigins: string[];
    };
}
/**
 * Load configuration from environment variables
 */
export declare function loadConfig(): Config;
export declare function getConfig(): Config;
/**
 * Check if JIRA integration is configured
 */
export declare function isJiraConfigured(): boolean;
/**
 * Check if running in production
 */
export declare function isProduction(): boolean;
//# sourceMappingURL=index.d.ts.map