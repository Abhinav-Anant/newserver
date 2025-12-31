import { NextRequest, NextResponse } from 'next/server';
import { nextDNSClient } from '@/lib/nextdns-client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: true, message: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const analytics = await nextDNSClient.getAnalytics(id, queryParams);

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to fetch analytics' },
      { status: error?.status ?? 500 }
    );
  }
}
