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

    const settings = await nextDNSClient.getParentalControlSettings(validation.data);
    return successResponse(settings);
  } catch (error: any) {
    console.error('Error fetching parental control settings:', error);
    return errorResponse('Failed to fetch parental control settings', error?.status ?? 500);
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

    const settings = await nextDNSClient.updateParentalControlSettings(validation.data, body);
    return successResponse(settings);
  } catch (error: any) {
    console.error('Error updating parental control settings:', error);
    return errorResponse('Failed to update parental control settings', error?.status ?? 500);
  }
}
