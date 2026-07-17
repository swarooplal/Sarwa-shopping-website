# SARWA — Luxury Indian Saree & Jewellery eCommerce

A scalable enterprise-grade luxury eCommerce platform built for the Indian fashion market. Inspired by premium Indian fashion brands, SARWA delivers an elegant, timeless, feminine, and minimal shopping experience for sarees and jewellery.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Hook Form, Zod, TanStack Query
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Storage:** AWS S3 (with local fallback for dev)
- **Auth:** JWT + Refresh Tokens + Role-based access control
- **Payments:** Razorpay / Stripe / COD
- **Deployment:** Vercel (frontend), Railway/Render/EC2 (backend)

## Repository Structure

```
sarwa/
├── apps/
│   ├── frontend/   # Next.js storefront + admin (route groups)
│   └── backend/    # Express API server
├── packages/
│   ├── shared/     # Shared types, Zod schemas, utilities
│   ├── ui/         # Reusable UI primitives
│   └── prisma/     # Prisma schema, migrations, seed
└── docs/           # Architecture & API docs
```

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations (requires Postgres)
npm run db:migrate

# Seed sample data
npm run db:seed

# Start backend (port 4000) + frontend (port 3000) together
npm run dev
```

## Brand Identity

| Token        | Value            | Use                       |
|--------------|------------------|---------------------------|
| Primary      | Deep Forest Green | CTAs, accents           |
| Secondary    | Ivory            | Surfaces, cards           |
| Accent       | Champagne Gold   | Highlights, dividers      |
| Text         | Charcoal         | Body copy                 |
| Background   | White            | Page bg                   |

- **Headings:** Cormorant Garamond (serif)
- **Body:** Inter (sans)
- **Buttons:** Rounded, soft shadows, smooth hover

## Features

### Storefront
- Hero slider (managed from admin), collections, featured categories, new arrivals, trending, reviews, Instagram gallery, newsletter
- Mega menu (multi-level, fully dynamic)
- Search with autocomplete, filters, recent searches
- Wishlist (guest + auth), cart (coupons, shipping, tax, ETA), guest & login checkout
- Customer account: orders, addresses, profile
- Blog, About, Contact, FAQ, Policies

### Admin Panel
- Dashboard with KPIs, sales graph, top products
- Product CRUD, variants, images, video, SEO, related/cross/upsell, featured/trending flags
- Categories (unlimited nesting), collections
- Mega menu builder (drag/drop, unlimited levels, reorder, enable/disable)
- Hero slider & banner manager (schedule, mobile/desktop images, CTA, priority)
- Orders: invoices, timeline, statuses, refund/return/cancel
- Customers, coupons, reviews (approve/reject), blogs
- CMS pages (about, policies, FAQ)
- RBAC: Admin / Manager / Editor / Staff
- Dark mode, responsive sidebar

### Platform
- SEO: schema, sitemap, robots, OG, canonical, meta tags
- Performance: SSR, code splitting, image optimization, lazy loading
- Security: Helmet, rate limit, CSRF, XSS & SQLi guards
- Analytics: GA, Meta Pixel, GTM

## Documentation

See `docs/` for architecture, API, and admin guides.
