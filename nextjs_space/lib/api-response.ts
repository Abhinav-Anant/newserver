import { NextResponse } from 'next/server';

/**
 * Standardized API error response
 */
export interface ApiErrorResponse {
  error: true;
  message: string;
}

/**
 * Standardized API success response
 */
export interface ApiSuccessResponse<T = any> {
  data?: T;
  message?: string;
}

/**
 * Create a standardized error response
 * Do not expose internal error details in production
 */
export function errorResponse(message: string, status: number = 500) {
  // In production, log the full error server-side, but return generic message
  const isProduction = process?.env?.NODE_ENV === 'production';
  if (isProduction && status === 500) {
    console.error('API Error:', message);
    return NextResponse.json(
      { error: true, message: 'Internal server error' },
      { status }
    );
  }

  return NextResponse.json(
    { error: true, message },
    { status }
  );
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(data?: T, message?: string, status: number = 200) {
  const response = data ? { data, ...(message && { message }) } : { message: message || 'Success' };
  return NextResponse.json(response, { status });
}
