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

    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const analytics = await nextDNSClient.getAnalytics(validation.data, queryParams);
    return successResponse(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return errorResponse('Failed to fetch analytics', error?.status ?? 500);
  }
}
