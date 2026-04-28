# Backend

## Quick start

1. Copy `.env.example` to `.env`
2. Start PostgreSQL with Docker:

```bash
docker compose up -d
```

3. Generate Prisma client and push schema:

```bash
pnpm prisma:generate
pnpm prisma:db:push
```

4. Start the API:

```bash
pnpm run start:dev
```

Example `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowchat?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"
```

## Health check

- `GET /`
- `GET /health`

## Flowchart API

- `GET /flowcharts`
- `GET /flowcharts/:id`
- `POST /flowcharts`
- `DELETE /flowcharts/:id`
