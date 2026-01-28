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
  };
  app: {
    environment: string;
    logLevel: string;
  };
  cors: {
    allowedOrigins: string[];
  };
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || defaultValue || '';
}

function getEnvVarOptional(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): Config {
  return {
    aws: {
      region: getEnvVar('AWS_REGION', 'eu-central-1'),
      dynamoDBTableName: getEnvVar('DYNAMODB_TABLE_NAME', 'ClientRequests')
    },
    jira: {
      baseUrl: getEnvVarOptional('JIRA_BASE_URL'),
      username: getEnvVarOptional('JIRA_USERNAME'),
      apiToken: getEnvVarOptional('JIRA_API_TOKEN'),
      projectKey: getEnvVarOptional('JIRA_PROJECT_KEY', 'REQ')
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
let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Check if JIRA integration is configured
 */
export function isJiraConfigured(): boolean {
  const config = getConfig();
  return !!(config.jira.baseUrl && config.jira.username && config.jira.apiToken);
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getConfig().app.environment === 'production';
}
