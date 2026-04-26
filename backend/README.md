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

## Health check

- `GET /`
- `GET /health`

## Flowchart API

- `GET /flowcharts`
- `GET /flowcharts/:id`
- `POST /flowcharts`
- `DELETE /flowcharts/:id`
