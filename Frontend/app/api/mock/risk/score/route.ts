import { NextResponse } from 'next/server';
import { persistRisk } from '@/lib/mockStore';

export async function POST(request: Request) {
  const { application_id, features } = await request.json();
  const score = Math.min(95, Math.max(5, Math.round((features?.metadata?.riskHint ?? 0.6) * 100)));
  const level = score > 75 ? 'high' : score > 45 ? 'medium' : 'low';
  const risk = persistRisk(application_id, score, level);
  return NextResponse.json(risk);
}


