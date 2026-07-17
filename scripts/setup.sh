#!/usr/bin/env bash
# SARWA project setup script
set -e
echo "→ Installing root dependencies"
npm install
echo "→ Installing workspaces (this may take a while)"
npm install --workspaces
echo "→ Generating Prisma client"
npm run db:generate
echo ""
echo "→ Next: Start Postgres, then:"
echo "    cp apps/backend/.env.example apps/backend/.env"
echo "    cp apps/frontend/.env.example apps/frontend/.env"
echo "    npm run db:migrate"
echo "    npm run db:seed"
echo "    npm run dev"
