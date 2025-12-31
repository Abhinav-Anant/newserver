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

    const settings = await nextDNSClient.getPrivacySettings(id);

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to fetch privacy settings' },
      { status: error?.status ?? 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: true, message: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const settings = await nextDNSClient.updatePrivacySettings(id, body);

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to update privacy settings' },
      { status: error?.status ?? 500 }
    );
  }
}
