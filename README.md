# Final Project

This project is a full-stack workflow / flowchart editor:

- `frontend`: Vue 3 + Vite
- `backend`: NestJS + Prisma
- database: PostgreSQL

## Before You Start


You must prepare the following environment before trying to run the project:

- Node.js `22.12+` (Node 22 LTS is recommended)
- `pnpm`
- Docker Desktop (required for PostgreSQL)

You can verify them with:

```bash
node -v
pnpm -v
docker -v
```

## How To Run The Entire Project After Cloning

You must follow the steps below in the exact order. Do not skip steps, and do not start the frontend before the backend and database are ready.

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd final-project
```

### 2. Install dependencies for both backend and frontend

The frontend and backend are separate projects. You must install dependencies in both directories.

```bash
cd backend
pnpm install
cd ..

cd frontend
pnpm install
cd ..
```

### 3. Configure backend environment variables

Create a `.env` file inside `backend`. The simplest way is to copy the example file:

```bash
cd backend
cp .env.example .env
```

If you are using Windows PowerShell, run:

```powershell
Copy-Item .env.example .env
```

Default configuration:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flowchat?schema=public"
PORT=3000
CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"
```

### 4. Start the database

The backend directory already includes a PostgreSQL `docker-compose.yml`:

```bash
cd backend
docker compose up -d
```

After this, PostgreSQL should be available on `localhost:5432`.

### 5. Initialize Prisma

For the first run, you must generate the Prisma Client and push the schema to the database:

```bash
cd backend
pnpm prisma:generate
pnpm prisma:db:push
```

### 6. Start the backend

```bash
cd backend
pnpm run start:dev
```

The backend runs by default at:

- `http://localhost:3000`
- health check: `http://localhost:3000/health`

### 7. Start the frontend

Open a new terminal window and run:

```bash
cd frontend
pnpm dev
```

The frontend runs by default at:

- `http://localhost:5173`

The frontend calls `http://localhost:3000` by default, so no extra frontend API configuration is required if the backend is running correctly.

## Required Startup Order

Every time you run the project locally, use this order:

1. In `backend`, run `docker compose up -d`
2. In `backend`, run `pnpm run start:dev`
3. In `frontend`, run `pnpm dev`

If you do not follow this order, the frontend may fail to load data or connect to the API.

## Common Commands

### Backend

```bash
cd backend
pnpm run start:dev
pnpm prisma:generate
pnpm prisma:db:push
```

### Frontend

```bash
cd frontend
pnpm dev
pnpm build
```

## Common Issues

### 1. The frontend opens, but no data is shown

Check the following first:

- PostgreSQL is running: `docker compose up -d`
- the backend is running: `pnpm run start:dev`
- `DATABASE_URL` in `backend/.env` is correct

### 2. Port conflict

Default ports:

- frontend: `5173`
- backend: `3000`
- PostgreSQL: `5432`

If one of these ports is already in use, you must update the related configuration before starting the project.

### 3. Docker is not running

If `docker compose up -d` fails, make sure Docker Desktop is open and running first.
