# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CariAir is a Next.js 15 web platform serving as Malaysia's mineral and spring water source registry. Users can search, compare, and learn about mineral water brands with data on pH levels, TDS, mineral composition, and pricing.

## Development Commands

This project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Start development (requires database running)
pnpm dev                    # Starts Next.js dev server (hot reload)

# Database (PostgreSQL in Docker)
pnpm run dev:db             # Start PostgreSQL container
pnpm run dev:db:stop        # Stop PostgreSQL container
pnpm run dev:db:logs        # View database logs

# Build and lint
pnpm build                  # Build for production
pnpm lint                   # Run ESLint

# Database schema (requires PostgreSQL env vars)
pnpm run db:schema          # Load sql/schema.sql
```

**Recommended workflow:**
1. Run `pnpm run dev:db` in Terminal 1 to start PostgreSQL
2. Run `pnpm dev` in Terminal 2 to start Next.js (fast hot reload)

**Required Environment Variables:**

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=
DB_NAME=cariair

# Authentication
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_SECRET=

# AI Chatbot (Groq API)
GROQ_API_KEY=
```

## Architecture

### Framework Stack
- **Next.js 15** with App Router (React Server Components by default)
- **React 19** with TypeScript
- **next-intl** for internationalization (Malay `ms` as default, English `en`)
- **next-auth v5** (Auth.js) with PostgreSQL adapter for authentication
- **Tailwind CSS** + **shadcn/ui** (Radix-based component library)

### Database Architecture

**PostgreSQL** with connection pooling via `pg`:

- `lib/db.ts` - Connection pool singleton with `getPool()`, `query()`, `withTransaction()` helpers
- `lib/db/*.ts` - Table-specific data access layer (products, users, brands, sources, images)
- `sql/schema.sql` - Database schema: NextAuth tables (users, accounts, sessions, verification_tokens) + data tables (brands, manufacturers, sources, images)
- Images stored as BYTEA in PostgreSQL (`images` table), served via `/api/images/[id]`

**Naming Conventions:**
- Database uses `snake_case` columns
- TypeScript uses `camelCase` properties
- Use `toCamelCase()` / `toSnakeCase()` helpers from `lib/db.ts` for conversions

### API Routes Structure

All API routes are in `app/api/*/`:

- `/api/auth/*` - NextAuth.js handlers (Google OAuth + credentials)
- `/api/products` - GET (public search/filter), POST (authenticated create)
- `/api/sources` - Water sources data
- `/api/brands` - Brand listings
- `/api/manufacturers` - Manufacturer data
- `/api/images/[id]` - Image retrieval (BYTEA → binary response)
- `/api/chat` - Groq-powered AI chatbot (feature flag: `CHATBOT_ENABLED` in `lib/features.ts`)

**API Pattern:**
```typescript
// Route handlers use NextRequest/NextResponse
// Authentication check: const session = await auth();
// Query building: use buildWhereClause() from lib/db.ts
```

### i18n Setup

- `i18n/routing.ts` - Locale config: `ms` (default), `en`
- `i18n/request.ts` - next-intl server configuration, reads `CARIAIR_LOCALE` cookie
- `messages/{ms,en}.json` - Translation strings
- Locale detection via cookie (not URL prefix)

### Authentication

Configured in `lib/auth.ts`:
- Google OAuth via `@auth/pg-adapter`
- Email/password with bcrypt password hashing
- Session stored in database (30-day expiry)
- Protected routes check: `const session = await auth()`

### Component Organization

- `components/ui/*` - shadcn/ui components (Radix primitives + Tailwind)
- `components/*` - Application-specific components (product cards, filters, maps, chatbot)
- `app/*/page.tsx` - Route pages (App Router)
- `app/layout.tsx` - Root layout with navigation, footer, chatbot (optional), and i18n provider

### Path Aliases

From `tsconfig.json`:
- `@/*` - Maps to repository root (e.g., `@/lib/db` → `./lib/db`)
- No sub-aliases defined (e.g., `@/components` uses `@/components` directly)

## Key Implementation Details

**PostgreSQL Connection Pooling:**
The singleton pattern in `lib/db.ts` prevents connection pool exhaustion during development hot reloads. Always use `query()` helper instead of creating new Pool instances.

**Image Handling:**
Images are stored in PostgreSQL as BYTEA and served through `/api/images/[id]` routes. When displaying, construct URLs as `/api/images/${image.id}`.

**Feature Flags:**
`lib/features.ts` exports feature flags like `CHATBOT_ENABLED`. Used conditionally in layout and components.

**Type Safety:**
- Database types in `lib/types/db.ts`
- NextAuth types extended in `types/next-auth.d.ts`
- Water source schema interfaces in `lib/data-schema.ts` (reference, not used directly with DB)

**Mobile Navigation:**
`MobileBottomNav` component provides tab navigation on mobile, visible only on small screens via CSS breakpoint.

**Chatbot:**
Groq SDK powers the AI chatbot at `components/water-chatbot.tsx`. Requires `GROQ_API_KEY` env var. Feature flag controls visibility.
