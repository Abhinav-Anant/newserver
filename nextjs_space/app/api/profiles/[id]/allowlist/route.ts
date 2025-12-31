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

    const allowlist = await nextDNSClient.getAllowlist(id);

    return NextResponse.json({ data: allowlist }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching allowlist:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to fetch allowlist' },
      { status: error?.status ?? 500 }
    );
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

    if (!id) {
      return NextResponse.json(
        { error: true, message: 'Profile ID is required' },
        { status: 400 }
      );
    }

    if (!domain) {
      return NextResponse.json(
        { error: true, message: 'Domain is required' },
        { status: 400 }
      );
    }

    const result = await nextDNSClient.addToAllowlist(id, domain);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error adding to allowlist:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to add to allowlist' },
      { status: error?.status ?? 500 }
    );
  }
}
