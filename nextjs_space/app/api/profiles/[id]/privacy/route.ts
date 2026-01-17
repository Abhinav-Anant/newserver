import { NextRequest } from 'next/server';
import { nextDNSClient } from '@/lib/nextdns-client';
import { profileIdSchema } from '@/lib/validation';
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

    const settings = await nextDNSClient.getPrivacySettings(validation.data);
    return successResponse(settings);
  } catch (error: any) {
    console.error('Error fetching privacy settings:', error);
    return errorResponse('Failed to fetch privacy settings', error?.status ?? 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate profile ID
    const validation = profileIdSchema.safeParse(id);
    if (!validation.success) {
      return errorResponse('Invalid profile ID', 400);
    }

    const settings = await nextDNSClient.updatePrivacySettings(validation.data, body);
    return successResponse(settings);
  } catch (error: any) {
    console.error('Error updating privacy settings:', error);
    return errorResponse('Failed to update privacy settings', error?.status ?? 500);
  }
}
