# TrustLock Frontend

A complete Next.js TypeScript frontend application for TrustLock, a secure KYC verification platform with explainable AI.

## Overview

TrustLock Frontend provides a responsive, accessible user interface for:
- Document capture and OCR verification
- Face matching and liveness detection
- Risk scoring with explainable AI decision traces
- Compliance dashboard for officer review
- Integration management and documentation

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** CSS Modules + SCSS
- **Testing:** Jest + React Testing Library
- **No UI Framework:** Lightweight, custom components only

## Project Structure

```
Frontend/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── onboard/           # Onboarding flow
│   ├── dashboard/          # Compliance dashboard
│   ├── admin/integrations/ # Integration config
│   └── docs/              # Documentation page
├── components/            # React components
│   ├── CameraCapture.tsx  # Camera + upload component
│   ├── DocumentCard.tsx   # Document display card
│   ├── OCRResultViewer.tsx # OCR results with bounding boxes
│   ├── FaceMatchBadge.tsx # Face match score display
│   ├── XaiTrace.tsx       # Explainable AI trace viewer
│   ├── ComplianceList.tsx # Dashboard list component
│   ├── Modal.tsx          # Accessible modal component
│   └── ...
├── lib/                   # Utilities and services
│   └── api.ts            # API client with mock/real modes
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared schemas interfaces
├── styles/                # Global styles
│   ├── variables.scss    # CSS variables
│   ├── accessible-reset.scss # Minimal reset
│   └── globals.scss      # Global styles
└── __tests__/            # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Run in mock mode (recommended for development):
```bash
npm run dev:mock
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server (normal mode)
- `npm run dev:mock` - Start development server with mock mode enabled
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_OCR_URL=http://localhost:8001
NEXT_PUBLIC_RISK_URL=http://localhost:8002
NEXT_PUBLIC_STORAGE_URL=http://localhost:8003

# Mock Mode Toggle
NEXT_PUBLIC_MOCK=true

# Frontend Origin (for CORS)
NEXT_PUBLIC_FRONTEND_ORIGIN=http://localhost:3000

# Optional: JWT Token for authenticated requests
# NEXT_PUBLIC_AUTH_TOKEN=your_jwt_token
```

## Mock Mode vs Real Mode

### Mock Mode (`NEXT_PUBLIC_MOCK=true`)

- Returns deterministic sample data
- No backend required
- Perfect for development and demos
- All API functions return mock responses matching shared_schemas

### Real Mode (`NEXT_PUBLIC_MOCK=false`)

- Makes actual fetch calls to configured backend URLs
- Requires all microservices to be running
- Uses JWT authentication if `NEXT_PUBLIC_AUTH_TOKEN` is set

## Integration Points

### Frontend Feature → Backend Microservice → Endpoint

| Frontend Feature | Backend Service | Endpoint | Person |
|-----------------|----------------|----------|--------|
| Document OCR | OCR Service | `POST /infer/document` | Person A |
| Face Matching | Face Match Service | `POST /face/match` | Person B |
| Risk Scoring | Risk Service | `POST /score` | Person C |
| Document Storage | Storage Service | `POST /store/upload` | Person D |
| Audit Logging | Audit Service | `POST /audit/append` | System |
| Application List | Main API | `GET /applications` | System |
| Application Details | Main API | `GET /applications/:id` | System |

## Frontend Integration Checklist

For backend/ML teams integrating with this frontend:

### 1. OCR Endpoint (Person A)

**Endpoint:** `POST ${NEXT_PUBLIC_OCR_URL}/infer/document`

**Request:**
```json
{
  "application_id": "app_123",
  "image_base64": "iVBORw0KGgoAAAANS...",
  "document_type": "id_front"
}
```

**Expected Response:**
```json
{
  "application_id": "app_123",
  "ocr_json": {
    "name": "John Doe",
    "date_of_birth": "1990-05-15",
    "address": "123 Main St, New York, NY 10001",
    "document_number": "DL12345678",
    "expiry_date": "2028-12-31",
    "nationality": "US",
    "bounding_boxes": {
      "name": [0.1, 0.2, 0.4, 0.05],
      "date_of_birth": [0.1, 0.3, 0.3, 0.05]
    }
  },
  "doc_confidence": 0.92,
  "doc_hash": "abc123def456...",
  "face_image_hash": "xyz789..."
}
```

**Notes:**
- Bounding boxes use normalized coordinates (0-1)
- Format: `[x, y, width, height]`
- `doc_confidence` should be 0.0-1.0

### 2. Face Match Endpoint (Person B)

**Endpoint:** `POST ${NEXT_PUBLIC_API_BASE}/face/match`

**Request:**
```json
{
  "application_id": "app_123",
  "id_photo_base64": "iVBORw0KGgo...",
  "selfie_base64": "iVBORw0KGgo..."
}
```

**Expected Response:**
```json
{
  "application_id": "app_123",
  "similarity": 0.88,
  "liveness_result": "passed",
  "embedding_hash": "sha256_hash_here",
  "confidence": 0.85
}
```

**Notes:**
- `similarity` and `confidence` are 0.0-1.0
- `liveness_result` must be `"passed"`, `"failed"`, or `"unknown"`

### 3. Risk Scoring Endpoint (Person C)

**Endpoint:** `POST ${NEXT_PUBLIC_RISK_URL}/score`

**Request:**
```json
{
  "application_id": "app_123",
  "features": {
    "ocr_results": { /* OcrResponse */ },
    "face_match": { /* FaceMatchResponse */ },
    "document_hashes": ["hash1", "hash2"],
    "metadata": {}
  }
}
```

**Expected Response:**
```json
{
  "application_id": "app_123",
  "risk_score": 0.65,
  "drpa_level": "medium",
  "explanations": [
    {
      "factor": "Document Authenticity",
      "weight": 0.3,
      "contribution": 0.4,
      "description": "Document shows signs of tampering",
      "suggested_action": "flag"
    }
  ],
  "audit_id": "audit_123",
  "factors": {
    "document_authenticity": 0.85,
    "face_match_confidence": 0.88,
    "data_consistency": 0.9,
    "watchlist_match": 0.05,
    "behavioral_anomalies": 0.1
  }
}
```

**Notes:**
- `contribution` can be negative (reduces risk) or positive (increases risk)
- `suggested_action` is optional but recommended

### 4. Storage Upload Endpoint (Person D)

**Endpoint:** `POST ${NEXT_PUBLIC_STORAGE_URL}/store/upload`

**Request (multipart/form-data):**
```
application_id: app_123
document_type: id_front
file: [binary file data]
```

**OR (JSON with base64):**
```json
{
  "application_id": "app_123",
  "document_type": "id_front",
  "file_base64": "iVBORw0KGgo..."
}
```

**Expected Response:**
```json
{
  "storage_path": "/storage/app_123/id_front/abc123.jpg",
  "hash": "sha256_hash_here",
  "url": "https://storage.example.com/..."
}
```

### 5. Audit Append Endpoint

**Endpoint:** `POST ${NEXT_PUBLIC_API_BASE}/audit/append`

**Request:**
```json
{
  "application_id": "app_123",
  "action": "approve",
  "actor": "officer_123",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Expected Response:**
```json
{
  "log_hash": "sha256_hash_here"
}
```

### 6. SSI Verification (Mock)

**Endpoint:** `POST ${NEXT_PUBLIC_API_BASE}/ssi/verify`

**Request:**
```json
{
  "credential_jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "presentation_request": {}
}
```

**Expected Response:**
```json
{
  "verified": true,
  "attributes": {
    "name": "John Doe",
    "date_of_birth": "1990-05-15",
    "address": "123 Main St",
    "document_number": "VC12345678"
  },
  "issuer": "did:example:issuer",
  "credential_hash": "sha256_hash_here"
}
```

### 7. CORS Configuration

Backend services must include CORS headers:

```
Access-Control-Allow-Origin: ${NEXT_PUBLIC_FRONTEND_ORIGIN}
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 8. Authentication

For staff/admin endpoints, include JWT token:

```
Authorization: Bearer {NEXT_PUBLIC_AUTH_TOKEN}
```

### 9. ONNX Endpoints (ML Models)

If using ONNX/PyTorch models:

- **Input:** Base64 encoded images (PNG/JPEG)
- **Pre-processing:** Resize to 224x224 (or specify requirements)
- **Output:** Embeddings as `float32[]` with SHA256 `embedding_hash`
- **Example:**
```json
{
  "embedding": [0.123, 0.456, ...],
  "embedding_hash": "sha256_hash_here"
}
```

### 10. Health Check Endpoint

Add `/health` route to each service:

**Response:**
```json
{
  "status": "ok",
  "service": "ocr"
}
```

## UI Testing Checklist

Before final submission, verify:

- [ ] Mobile viewport (375px, 414px) - no horizontal scroll, readable text
- [ ] Tablet viewport (768px, 1024px) - proper grid layouts
- [ ] Desktop viewport (1280px, 1920px) - max-width containers respected
- [ ] Keyboard navigation (Tab, Enter, Space, Escape) - all interactive elements accessible
- [ ] Focus rings visible on all focusable elements
- [ ] Color contrast (WCAG AA minimum) - use browser dev tools
- [ ] Screen reader labels - test with NVDA/JAWS/VoiceOver
- [ ] Camera capture flow works on mobile device
- [ ] No layout shifts during loading (use skeleton loaders)
- [ ] Responsive breakpoints - test at 640px, 768px, 1024px boundaries
- [ ] Modal/drawer closes with Escape key
- [ ] Form validation messages are clear
- [ ] Error states show helpful messages
- [ ] Empty states provide guidance

## Running Tests

```bash
npm run test
```

Tests cover:
- CameraCapture component (renders, sample image button)
- Onboard flow (method selection, document upload)
- Dashboard (list rendering, modal opening)

## Building for Production

```bash
npm run build
npm run start
```

**Note:** Console logs are disabled in production builds (unless `NEXT_PUBLIC_MOCK=true`).

## Troubleshooting

### Camera not working
- Check browser permissions
- Use HTTPS in production (required for getUserMedia)
- Fallback to file upload is available

### API calls failing
- Verify environment variables are set
- Check CORS headers on backend
- Ensure backend services are running
- Check browser console for detailed errors

### Layout issues on mobile
- Use browser dev tools device emulation
- Test on actual devices if possible
- Check CSS variables and breakpoints

### Mock mode not working
- Ensure `NEXT_PUBLIC_MOCK=true` in `.env`
- Restart dev server after changing env vars
- Check browser console for mode indicator

## Contributing

1. Follow TypeScript strict mode
2. Use CSS Modules for component styles
3. Maintain accessibility (ARIA labels, keyboard nav)
4. Write tests for new components
5. Update README for new integration points

## License

[Your License Here]

## Support

For integration questions, see `/admin/integrations` page in the app or `/docs` for detailed documentation.

