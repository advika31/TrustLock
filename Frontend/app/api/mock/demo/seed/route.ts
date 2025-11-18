import { NextResponse } from 'next/server';
import { ensureSeedData } from '@/lib/mockStore';

export async function POST() {
  ensureSeedData();
  return NextResponse.json({ ok: true });
}



