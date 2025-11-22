# TrustLock Orchestrator

FastAPI-based orchestration service that manages the TrustLock KYC lifecycle by coordinating OCR, Face Match, Risk, Storage, and Audit services via async tasks.

## Quickstart

```bash
cd services/orchestrator
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Infrastructure

- Start Postgres and Redis locally (Docker example):

```bash
docker run --name tl-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
docker run --name tl-redis -p 6379:6379 -d redis:7
```

- Run migrations:

```bash
alembic upgrade head
```

### Application & workers

```bash
uvicorn app.main:app --reload
celery -A app.workers.tasks.celery_app worker --loglevel=info
```

### Demo script

```bash
./scripts/demo_orchestrator.sh
```

> The demo script requires `curl` and `jq` on your PATH.

## Curl samples

```bash
curl -X POST http://localhost:8000/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"pass123"}'

curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

curl -X POST http://localhost:8000/kyc/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"method":"doc"}'

curl -X POST http://localhost:8000/kyc/upload \
  -H "Authorization: Bearer <token>" \
  -F "application_id=<uuid>" \
  -F "id_front=@demo_files/id_front.jpg" \
  -F "selfie=@demo_files/selfie.jpg"
```

## Testing

```bash
pytest
```

`tests/test_kyc_flow.py` mocks downstream clients to validate KYC start → upload → processing → reviewer flow.

## Environment variables

See `.env.example` for required configuration such as `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, and downstream service URLs. Set `USE_STUBS=true` for local stubbed clients.

