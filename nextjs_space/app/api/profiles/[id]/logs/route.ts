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

    const logs = await nextDNSClient.getLogs(id, queryParams);

    return NextResponse.json({ data: logs }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to fetch logs' },
      { status: error?.status ?? 500 }
    );
  }
}
