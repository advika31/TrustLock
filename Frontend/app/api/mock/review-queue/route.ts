import { NextResponse } from 'next/server';
import { listReviewQueue } from '@/lib/mockStore';

export async function GET() {
  return NextResponse.json({ applications: listReviewQueue() });
}


