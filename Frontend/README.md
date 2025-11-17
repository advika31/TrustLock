# TrustLock Frontend (Next.js 14)

Human-crafted, production-like KYC UX featuring multilingual voice guidance, offline queues, SSI wallet simulation, explainable AI dashboards, and Workbox-free service worker caching. Refer to `public/assets/architecture.svg` for system wiring.

```
.
├─ app/                    # App Router pages + API mocks
├─ components/             # UI primitives (Stepper, CameraCapture, etc.)
├─ content/i18n/           # en / hi-IN / es translations
├─ hooks/                  # Camera, voice, SSE helpers
├─ providers/              # Locale, Voice, Offline context providers
├─ services/               # api.ts, offlineQueue.ts, onnx.ts
├─ public/models/onnx/     # Placeholder ONNX model
├─ public/assets/          # Architecture diagram + icons
├─ docs/                   # Backend integration memo
└─ demo/run_demo.sh        # Seeds mock data via Next API
```

## Features
- No Tailwind – CSS Modules with pastel TrustLock palette + accessible spacing.
- PWA + service worker + offline queue (IndexedDB) showing pending uploads.
- getUserMedia capture with canvas auto-enhance, low-light + blur metrics, and Web Speech instructions.
- SSI wallet mock, consent modal, and branch IoT simulator.
- Compliance dashboard, case detail page, admin thresholds, and monitoring playground (SSE).
- i18n (English, Hindi, Spanish) with persistent locale + voice toggle.
- onnxruntime-web stub for client-side pre-validation.

## Quick Start
1. `git clone <repo-url>`
2. `cd frontend`
3. `npm install`
4. `npm run dev` → visit http://localhost:3000

Mock APIs live under `/api/mock/*` so the app works immediately.

### Scripts
- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm run test`
- `npm run demo` → executes `scripts/seedDemo.mjs` to hit `/api/mock/demo/seed`

## Environment Variables
Create `.env.local` if needed (Vercel-ready).

| Key | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `/api/mock` | Base path used by `services/api.ts` |
| `NEXT_PUBLIC_ONNX_MODEL_URL` | `/models/onnx/placeholder.onnx` | Browser ONNX model |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` | Initial locale for LocaleProvider |

### Changing backends
Point `NEXT_PUBLIC_API_BASE_URL` to your orchestrator gateway (e.g. `http://localhost:8000`). All fetches (KYC start, OCR, risk, audit, admin, SSE triggers) go through `services/api.ts`.

## Architecture / Data Flow
1. **UI layer** (`components/*`, `app/*`) renders flows and dashboards.
2. **Providers** wire locale, voice, offline queue, and toast notifications.
3. **Services** abstract fetches, retries, abort signals, and offline replays.
4. **Mock store** (`lib/mockStore.ts`) mimics Orchestrator/OCR/Risk/Face/Audit.
5. **API layer** in `app/api/mock/*` responds to frontend and SSE clients.

See `docs/integration.md` for Person A/B/C/D responsibilities.

## Integration Endpoints (replace `/api/mock` with your backend)

> Each example uses `curl http://localhost:3000/api/mock/...` while in mock mode.

1. **Start KYC**
```bash
curl -X POST http://localhost:3000/api/mock/kyc/start \
  -H "Content-Type: application/json" \
  -d '{"user":{"name":"Ava","email":"ava@example.com","phone":"+1-555"},"method":"DOC","meta":{"device_id":"demo","locale":"en-US"}}'
```

2. **Upload Document**
```bash
curl -X POST http://localhost:3000/api/mock/store/upload \
  -H "Content-Type: application/json" \
  -d '{"application_id":"app_demo","document_type":"id_front","image_base64":"data:image/jpeg;base64,..."}'
```

3. **Call OCR**
```bash
curl -X POST http://localhost:3000/api/mock/ocr \
  -H "Content-Type: application/json" \
  -d '{"application_id":"app_demo","document_type":"id_card","image_base64":"..."}'
```

4. **Face Match**
```bash
curl -X POST http://localhost:3000/api/mock/face/match \
  -H "Content-Type: application/json" \
  -d '{"application_id":"app_demo","id_photo_base64":"...","selfie_base64":"...","require_liveness":true}'
```

5. **Risk Score**
```bash
curl -X POST http://localhost:3000/api/mock/risk/score \
  -H "Content-Type: application/json" \
  -d '{"application_id":"app_demo","features":{"metadata":{"riskHint":0.42}}}'
```

6. **Append Audit**
```bash
curl -X POST http://localhost:3000/api/mock/audit/append \
  -H "Content-Type: application/json" \
  -d '{"application_id":"app_demo","action":"approve","actor":"officer_1"}'
```

Match these contracts in your real services (schemas repeated in README + `/docs/integration.md`).

## Person A/B/C/D Mapping
- **Person A (Orchestrator):** `/kyc/start`, `/status/:id`, `/events` (SSE POST + GET), `/review-queue`. Replace `lib/mockStore.ts` with orchestrator proxy.
- **Person B (OCR/Face):** `/store/upload`, `/ocr`, `/face/match`.
- **Person C (Risk/XAI):** `/risk/score`, SSE event emission.
- **Person D (Storage/Audit):** `/store/upload`, `/audit/append`, `/admin/settings`.

## ONNX Integration
- Drop real models into `public/models/onnx/`.
- Update `NEXT_PUBLIC_ONNX_MODEL_URL`.
- `services/onnx.ts` loads `onnxruntime-web` lazily and exposes `runPrecheck()`.
- Example expectation: float32 inputs, single output map. Adjust tensor names to match your model.

## Mock Server vs Real Backend
- Mock mode (default) uses Next API routes + in-memory store + SSE broadcast.
- To hit real services: set env, disable `/api/mock` usage, or add rewrite in `next.config.js`.
- `demo/run_demo.sh` performs POSTs against `/api/mock/demo/seed` to reset data.

### `demo/run_demo.sh`
```bash
#!/usr/bin/env bash
curl -s -X POST http://localhost:3000/api/mock/demo/seed | jq
```

## Accessibility & Internationalization
- Semantic headings, form labels, keyboard focus states (`:focus-visible`).
- Voice guidance toggle uses Web Speech API; textual fallback placed near actions.
- Language selector persists via `localStorage` and covers `en`, `hi-IN`, `es`.
- Screen-reader helpers `.sr-only` for hidden labels.
- Tested for contrast > 4.5:1 across palette.

## Offline-first Behaviors
- `public/service-worker.js` caches shell & handles GET fallbacks.
- `services/offlineQueue.ts` stores POST payloads in IndexedDB; `OfflineIndicator` shows queue + manual retry.
- Onboarding doc flow enqueues uploads if `navigator.onLine === false`.

## Testing
- `__tests__/components/CameraCapture.test.tsx` – verifies guidance + sample capture.
- `__tests__/components/Dashboard.test.tsx` – ensures queue listing renders.
- `__tests__/components/OnboardFlow.test.tsx` – checks step transitions.
Run `npm run test` (Jest + RTL).

## Accessibility Checklist (used for this build)
- Keyboard traversal of landing + onboarding.
- Voice toggle ARIA-pressed state.
- `aria-live="polite"` for camera guidance + offline bar.
- Color palette validated via axe.
- Document viewer supports zoom buttons for keyboard users.

## Deployment (Vercel)
- Node 18+.
- Build command `npm run build`.
- Output `.next`.
- Environment vars (API base + ONNX) added via Vercel dashboard.
- Turn on "Include source files" if referencing `/public/models/onnx`.

## Troubleshooting
- **Camera blocked** → ensure HTTPS / check OS permissions / fallback to upload button.
- **SSE not streaming on Windows** → disable proxy buffering or visit `/api/mock/events` directly.
- **Service worker stale cache** → bump `CACHE_NAME` in `public/service-worker.js`.
- **IndexedDB errors** → clear site data; queue auto-rebuilds.
- **Voice guidance missing** → Safari requires user interaction before speech; toggle after first click.

## Further Reading
- `docs/integration.md` – short brief for backend teams.
- `HUMAN_DESIGN_NOTES.md` – palette + spacing rationale.
- `public/assets/architecture.svg` – embedable diagram for presentations.

Enjoy shipping TrustLock! Open issues/ideas as GitHub discussions.***

