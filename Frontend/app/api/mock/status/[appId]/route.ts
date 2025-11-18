import { NextResponse } from 'next/server';
import { getApplication } from '@/lib/mockStore';

interface Params {
  params: { appId: string };
}

export async function GET(_: Request, { params }: Params) {
  const record = getApplication(params.appId);
  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({
    status: record.status,
    risk: record.risk,
    audit_log: record.audit_log,
    updated_at: record.updated_at,
  });
}



