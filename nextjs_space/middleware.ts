import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiting store
 * In production, use Redis for distributed systems
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // requests per window
};

/**
 * Rate limiting middleware
 */
function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             request.ip ||
             'unknown';
  return ip;
}

export function rateLimit(request: NextRequest): { allowed: boolean; remaining: number } {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const limit = rateLimitStore.get(key);

  // Clean up expired entries
  if (limit && limit.resetTime < now) {
    rateLimitStore.delete(key);
  }

  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };

  if (current.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count++;
  rateLimitStore.set(key, current);

  return { allowed: true, remaining: RATE_LIMIT.maxRequests - current.count };
}

export default function middleware(request: NextRequest): NextResponse {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const { allowed } = rateLimit(request);

    if (!allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
