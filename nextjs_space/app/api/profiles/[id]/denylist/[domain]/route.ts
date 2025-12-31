import { NextRequest, NextResponse } from 'next/server';
import { nextDNSClient } from '@/lib/nextdns-client';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; domain: string } }
) {
  try {
    const { id, domain } = params;

    if (!id || !domain) {
      return NextResponse.json(
        { error: true, message: 'Profile ID and domain are required' },
        { status: 400 }
      );
    }

    await nextDNSClient.removeFromDenylist(id, domain);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error removing from denylist:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to remove from denylist' },
      { status: error?.status ?? 500 }
    );
  }
}
