# SARWA · Setup Guide

If `npm install` fails because of system npm cache permissions, run with a fresh cache:

```bash
# Option 1: Use a project-local cache
NPM_CONFIG_CACHE="$(pwd)/.npm-cache" npm install --legacy-peer-deps

# Option 2: Use --prefix-cache
npm config set cache ./.npm-cache --location project
npm install --legacy-peer-deps

# Option 3: Use yarn/pnpm if available
pnpm install
```

If you encounter `ERESOLVE` errors, the legacy peer-deps flag handles React Hook Form / @hookform/resolvers compatibility.

## PostgreSQL setup

```bash
# Local Postgres via docker
docker run --name sarwa-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

# Create database
docker exec -it sarwa-db psql -U postgres -c "CREATE DATABASE sarwa;"
```

## Running migrations

```bash
npm run db:generate       # generate Prisma client
npm run db:migrate        # apply schema (creates tables)
npm run db:seed           # seed sample data
```

## Running dev servers

```bash
npm run dev
# Backend  → http://localhost:4000/api/v1
# Frontend → http://localhost:3000
```

## Default credentials

After seeding:

- **Admin panel:** `admin@sarwa.in` / `admin123`  → http://localhost:3000/admin
- **Demo customer:** `demo@sarwa.in` / `customer123`

## Production

- Frontend: Deploy `apps/frontend` to **Vercel**.
- Backend: Deploy `apps/backend` to **Railway / Render / EC2**.
- Database: Managed Postgres on any provider.
- Storage: AWS S3 (set `AWS_*` + `S3_BUCKET` env vars).
- Configure secrets in `apps/backend/.env`.
