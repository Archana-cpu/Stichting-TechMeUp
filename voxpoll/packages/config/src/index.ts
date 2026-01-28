/**
 * @voxpoll/config
 * Shared configuration utilities and types
 */

/**
 * Environment configuration type
 */
export interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  DATABASE_URL: string;
  REDIS_URL?: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  API_PORT?: number;
  CORS_ORIGIN?: string;
}

/**
 * Validate that required environment variables are present
 */
export function validateEnv<T extends Record<string, unknown>>(
  env: Record<string, unknown>,
  required: (keyof T)[]
): T {
  const missing: string[] = [];

  for (const key of required) {
    if (env[key as string] === undefined || env[key as string] === "") {
      missing.push(key as string);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return env as T;
}

/**
 * Get an environment variable with a default value
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get an environment variable as a number
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return num;
}

/**
 * Get an environment variable as a boolean
 */
export function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Check if we're in development mode
 */
export function isDev(): boolean {
  return process.env["NODE_ENV"] === "development";
}

/**
 * Check if we're in production mode
 */
export function isProd(): boolean {
  return process.env["NODE_ENV"] === "production";
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return process.env["NODE_ENV"] === "test";
}
