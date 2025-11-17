import { NextResponse } from 'next/server';
import { appendAuditLog } from '@/lib/mockStore';

export async function POST(request: Request) {
  const { application_id, action, actor, metadata } = await request.json();
  const entry = appendAuditLog(application_id, action, actor, metadata);
  return NextResponse.json({
    audit_id: entry?.audit_id,
    log_hash: entry?.log_hash,
  });
}


