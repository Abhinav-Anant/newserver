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

    const settings = await nextDNSClient.getSecuritySettings(validation.data);
    return successResponse(settings);
  } catch (error: any) {
    console.error('Error fetching security settings:', error);
    return errorResponse('Failed to fetch security settings', error?.status ?? 500);
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

    const settings = await nextDNSClient.updateSecuritySettings(validation.data, body);
    return successResponse(settings);
  } catch (error: any) {
    console.error('Error updating security settings:', error);
    return errorResponse('Failed to update security settings', error?.status ?? 500);
  }
}
