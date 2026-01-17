import { NextRequest } from 'next/server';
import { nextDNSClient } from '@/lib/nextdns-client';
import { profileIdSchema, domainSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate profile ID
    const validation = profileIdSchema.safeParse(id);
    if (!validation.success) {
      return errorResponse('Invalid profile ID', 400);
    }

    const allowlist = await nextDNSClient.getAllowlist(validation.data);
    return successResponse(allowlist);
  } catch (error: any) {
    console.error('Error fetching allowlist:', error);
    return errorResponse('Failed to fetch allowlist', error?.status ?? 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const domain = body?.domain ?? body?.id;

    // Validate profile ID
    const idValidation = profileIdSchema.safeParse(id);
    if (!idValidation.success) {
      return errorResponse('Invalid profile ID', 400);
    }

    // Validate domain
    const domainValidation = domainSchema.safeParse(domain);
    if (!domainValidation.success) {
      return errorResponse('Invalid domain format', 400);
    }

    const result = await nextDNSClient.addToAllowlist(idValidation.data, domainValidation.data);
    return successResponse(result, 'Domain added to allowlist', 201);
  } catch (error: any) {
    console.error('Error adding to allowlist:', error);
    return errorResponse('Failed to add to allowlist', error?.status ?? 500);
  }
}
