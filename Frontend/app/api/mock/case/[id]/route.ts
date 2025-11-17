import { NextResponse } from 'next/server';
import { getApplication, updateCaseStatus } from '@/lib/mockStore';

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const record = getApplication(params.id);
  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}

export async function POST(request: Request, { params }: Params) {
  const body = await request.json();
  const record = updateCaseStatus(params.id, body.action, body.note);
  return NextResponse.json(record);
}


