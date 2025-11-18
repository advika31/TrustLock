# Integration Notes (Person A/B/C/D)

## Person A – Orchestrator
- Replace `/api/mock/kyc/start` → `POST ${API_BASE_URL}/kyc/start`
- `/api/mock/events` SSE feed → point to orchestration event hub
- `/api/mock/status/:application_id` → map to orchestrator status endpoint

## Person B – OCR & Face
- `/api/mock/store/upload` handles binary upload, expect `{ storage_path, hash }`
- `/api/mock/ocr` responds with OCR JSON; replace with OCR microservice
- `/api/mock/face/match` returns similarity + liveness

## Person C – Risk/XAI
- `/api/mock/risk/score` input: `{ application_id, features }`
- Response: `{ risk_score, drpa_level, explanations[], audit_id }`
- `/api/mock/events` POST used to push DRPA monitoring events

## Person D – Storage/Audit
- `/api/mock/store/upload` for document storage
- `/api/mock/audit/append` for immutable audit trail
- `/api/mock/admin/settings` surfaces thresholds + sanctions uploads

See `README.md` for sample cURL commands and JSON schemas.



