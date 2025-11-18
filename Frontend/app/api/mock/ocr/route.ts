import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { appendAuditLog } from '@/lib/mockStore';

export async function POST(request: Request) {
  const { application_id } = await request.json();
  appendAuditLog(application_id, 'OCR processed', 'system');

  return NextResponse.json({
    application_id,
    ocr_json: {
      name: 'Demo Applicant',
      dob: '1994-05-18',
      address: '221B Demo Street, London',
      raw_text: 'Demo Document',
      bboxes: [],
    },
    doc_confidence: 0.91,
    doc_hash: crypto.randomUUID(),
  });
}



