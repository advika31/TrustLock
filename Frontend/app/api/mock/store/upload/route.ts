import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { appendDocument } from '@/lib/mockStore';

export async function POST(request: Request) {
  const { application_id, document_type, image_base64 } = await request.json();
  const doc = appendDocument(application_id, document_type, image_base64);
  return NextResponse.json({
    storage_path: doc.url,
    hash: crypto.randomUUID(),
  });
}

