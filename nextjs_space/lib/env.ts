/**
 * Environment variable validation and retrieval
 * This ensures required configuration is present at startup
 */

interface Environment {
  NEXTDNS_API_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  DATABASE_URL?: string;
}

let cachedEnv: Environment | null = null;

/**
 * Validate that a required environment variable is set
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

/**
 * Get and validate environment variables
 */
export function getEnv(): Environment {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    const env: Environment = {
      NEXTDNS_API_KEY: requireEnv('NEXTDNS_API_KEY'),
      NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
    };

    // Validate NODE_ENV
    if (!['development', 'production', 'test'].includes(env.NODE_ENV)) {
      throw new Error(`Invalid NODE_ENV value: ${env.NODE_ENV}`);
    }

    cachedEnv = env;
    return env;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid or missing environment variables: ${message}`);
  }
}
