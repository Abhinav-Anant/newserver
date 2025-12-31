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

    const settings = await nextDNSClient.getParentalControlSettings(id);

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching parental control settings:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to fetch parental control settings' },
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

    const settings = await nextDNSClient.updateParentalControlSettings(id, body);

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error updating parental control settings:', error);
    return NextResponse.json(
      { error: true, message: error?.message ?? 'Failed to update parental control settings' },
      { status: error?.status ?? 500 }
    );
  }
}
