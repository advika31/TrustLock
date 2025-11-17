import { NextResponse } from 'next/server';
import { startKycRecord } from '@/lib/mockStore';

export async function POST(request: Request) {
  const body = await request.json();
  const record = startKycRecord({
    name: body.user?.name || 'Unknown',
    email: body.user?.email || 'unknown@example.com',
    phone: body.user?.phone || '',
    method: body.method || 'DOC',
  });
  return NextResponse.json({
    application_id: record.application_id,
    status: 'PENDING',
    created_at: record.created_at,
  });
}


