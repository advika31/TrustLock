import { NextResponse } from 'next/server';
import { persistFaceMatch } from '@/lib/mockStore';

export async function POST(request: Request) {
  const { application_id } = await request.json();
  const similarity = 0.82;
  const faceMatch = persistFaceMatch(application_id, {
    similarity,
    liveness_result: similarity > 0.75 ? 'passed' : 'failed',
  });
  return NextResponse.json(faceMatch);
}


