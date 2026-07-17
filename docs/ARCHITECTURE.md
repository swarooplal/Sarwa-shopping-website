# SARWA Architecture

## High-Level

```
┌──────────────────────────┐    ┌──────────────────────────┐
│  Next.js Storefront      │    │  Next.js Admin Panel     │
│  (apps/frontend)         │    │  (apps/frontend/(admin)) │
└──────────┬───────────────┘    └──────────┬───────────────┘
           │                                │
           │      HTTPS (TanStack Query)    │
           └────────────────┬───────────────┘
                            ▼
                ┌───────────────────────┐
                │ Express API (TS)      │
                │ apps/backend          │
                └───┬────────┬──────┬───┘
                    │        │      │
            ┌───────▼──┐ ┌───▼──┐ ┌─▼────┐
            │ Prisma  │ │ S3   │ │Redis │
            └────┬────┘ └──────┘ └──────┘
                 │
            ┌────▼────────────┐
            │ PostgreSQL       │
            └──────────────────┘
```

## Data Flow

1. Storefront and admin both consume REST endpoints from the backend.
2. JWT access token (15 min) + refresh token (7 days) issued at login.
3. Refresh tokens are stored hashed and rotated.
4. Admin endpoints check role/permission via middleware.
5. S3 used for all media; backend serves signed URLs.
6. Prisma is the single source of truth for schema.

## Folder Layout

- `apps/frontend` — Next.js App Router. Storefront at `/`, admin at `(admin)/admin`.
- `apps/backend` — Express router-per-feature.
- `packages/shared` — DTOs and Zod schemas shared across front/back.
- `packages/prisma` — Single schema. Imports as `@sarwa/db` for client.
- `packages/ui` — Headless primitives wrapped with SARWA styling.

## Conventions

- TypeScript strict everywhere.
- All API responses use the envelope: `{ data, meta?, error? }`.
- Pagination uses `page` + `pageSize` (server-side) and returns `meta.total`.
- Currency: INR, in paise at API layer, rupees in UI.
- Dates: ISO 8601 in/out, localized to IST on render.
