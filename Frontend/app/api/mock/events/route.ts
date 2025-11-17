import crypto from 'crypto';
import { NextResponse } from 'next/server';
import {
  appendMonitoringEvent,
  listMonitoringEvents,
  MonitoringEvent,
  subscribeToEvents,
} from '@/lib/mockStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: MonitoringEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      listMonitoringEvents().forEach(send);
      const unsubscribe = subscribeToEvents(send);
      controller.enqueue(encoder.encode(':connected\n\n'));
      controller.closed.finally(unsubscribe);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const event: MonitoringEvent = {
    id: crypto.randomUUID(),
    application_id: body.application_id,
    event_type: body.event_type,
    message: body.message || 'Manual monitoring event',
    timestamp: new Date().toISOString(),
    risk_score: body.risk_score || 50,
  };
  appendMonitoringEvent(event);
  return NextResponse.json(event);
}

