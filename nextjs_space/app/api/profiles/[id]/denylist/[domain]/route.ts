import { NextRequest } from 'next/server';
import { nextDNSClient } from '@/lib/nextdns-client';
import { profileIdSchema, domainSchema } from '@/lib/validation';
import { errorResponse, successResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; domain: string } }
) {
  try {
    const { id, domain } = params;

    // Validate profile ID and domain
    const idValidation = profileIdSchema.safeParse(id);
    if (!idValidation.success) {
      return errorResponse('Invalid profile ID', 400);
    }

    const domainValidation = domainSchema.safeParse(domain);
    if (!domainValidation.success) {
      return errorResponse('Invalid domain', 400);
    }

    await nextDNSClient.removeFromDenylist(idValidation.data, domainValidation.data);
    return successResponse({ success: true }, 'Domain removed from denylist');
  } catch (error: any) {
    console.error('Error removing from denylist:', error);
    return errorResponse('Failed to remove from denylist', error?.status ?? 500);
  }
}
