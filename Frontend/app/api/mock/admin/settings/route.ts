import { NextResponse } from 'next/server';
import { getAdminConfig, updateAdminConfig } from '@/lib/mockStore';

export async function GET() {
  return NextResponse.json(getAdminConfig());
}

export async function POST(request: Request) {
  const body = await request.json();
  const config = updateAdminConfig(body);
  return NextResponse.json(config);
}



