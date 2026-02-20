# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CariAir is a comprehensive web platform serving as Malaysia's definitive mineral and spring water source registry. The application enables users to search, compare, and learn about various mineral water brands with detailed composition analysis, health insights, and interactive visualizations.

**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, PocketBase (backend), shadcn/ui components

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server (runs on http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint

# Seed database from SQL file (requires .env setup)
pnpm seed
```

> **Package Manager**: This project uses **pnpm**. Do not use `npm` or `yarn`.

## Architecture

### App Router Structure
- **App directory** (`/app`): Next.js 16 App Router with file-based routing
  - `/` - Landing page with featured sources and search
  - `/sources` - Browse all water sources with filters
  - `/sources/[id]` - Individual product detail pages
  - `/analytics` - Data visualization dashboard with charts
  - `/map` - Interactive map showing water source locations
  - `/search` - Dedicated search page
  - `/login`, `/register` - Authentication pages
  - `/about`, `/learn`, `/contribute` - Informational pages

### Data Layer
- **Backend**: PocketBase (self-hosted backend-as-a-service)
- **Database Models** (in `lib/types/pocketbase.ts`):
  - `Product` - Water products with relations to brand, manufacturer, source
  - `Brand` - Water brands (e.g., Spritzer, Cactus)
  - `Manufacturer` - Manufacturing companies
  - `Source` - Water source locations with coordinates
- **Legacy Schema** (`lib/data-schema.ts`): Original WaterSource interface - being migrated to PocketBase models

### PocketBase Integration
- **Client**: `lib/pocketbase.ts` exports lazy singleton `pb` instance
- **Environment**: Requires `NEXT_PUBLIC_POCKETBASE_URL` in `.env`
- **Auth Helpers**: `isUserLoggedIn()`, `getCurrentUser()`, `logout()`, `getImageUrl()`
- **Important**: The `pb` client uses a lazy proxy pattern to avoid build-time env variable issues on Vercel

### Components Organization
- **Feature Components** (`/components`):
  - `product-comparison.tsx` - Side-by-side visual comparison with charts
  - `mobile-comparison-carousel.tsx` - Mobile-optimized swipeable comparison
  - `mineral-composition-panel.tsx` - Detailed mineral breakdown display
  - `health-benefits-panel.tsx` - Health insights based on minerals
  - `analytics-dashboard.tsx` - Charts and data visualizations using Recharts
  - `enhanced-product-filters.tsx` - Advanced filtering UI
  - `sources-view.tsx` - Main sources listing with filters
  - `water-source-map.tsx` - Leaflet map component
  - `main-nav.tsx` - Site navigation
- **UI Components** (`/components/ui`): shadcn/ui components (accordion, alert, button, card, etc.)
- **Path Aliases**: Use `@/` prefix for imports (e.g., `@/components/ui/button`)

### Key Data Files
- **Mineral Data** (`lib/mineral-data.ts`): Reference data for mineral health benefits, recommended daily intake
- **Products** (`lib/products.ts`): Helper functions for fetching/filtering products from PocketBase

### Styling
- **Tailwind CSS**: Utility-first styling with custom configuration in `tailwind.config.js`
- **CSS Variables**: Theme uses CSS variables defined in `app/globals.css`
- **Theme**: Supports light/dark mode via `next-themes`
- **Components**: styled using `class-variance-authority` (cva) and `tailwind-merge` (cn utility)

### Database Seeding
- **SQL Source**: `scripts/seed.sql` contains initial water source data
- **Seeding Script**: `scripts/seed-from-sql.mjs` parses SQL and uploads to PocketBase
- **Setup Scripts**:
  - `scripts/create-collections.mjs` - Creates PocketBase collections/schema
  - `scripts/setup-rules.mjs` - Configures collection access rules
  - `scripts/seed-user.mjs` - Seeds test user data
- **Required Env Vars**: `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`

## Development Patterns

### Fetching Data
- Use PocketBase client from `@/lib/pocketbase`
- Always expand relations when needed: `pb.collection('products').getList({ expand: 'brand,manufacturer,source' })`
- Product images: Use `getImageUrl(product, filename)` helper
- Handle auth state: Check `isUserLoggedIn()` before protected operations

### Component Patterns
- Server Components by default (Next.js 16 App Router)
- Use `"use client"` directive for:
  - Interactive components (filters, carousels, maps)
  - Components using React hooks
  - Components with event handlers
- Form handling: Use `react-hook-form` with `zod` for validation (`@hookform/resolvers`)

### Visualization
- **Charts**: Use Recharts library (imported components like `BarChart`, `LineChart`, `RadarChart`)
- **Maps**: Use `react-leaflet` with Leaflet for interactive maps
- **Comparison**: Mineral comparisons use grouped bar charts with color coding (green=optimal, yellow=moderate, red=high/low)

### Type Safety
- TypeScript strict mode enabled
- Use PocketBase types from `lib/types/pocketbase.ts`
- Mineral composition stored as JSON in `Product.minerals_json`
- Build errors ignored (`ignoreBuildErrors: true`) - but aim to fix TypeScript errors

### Mobile Optimization
- Mobile-first responsive design
- Dedicated mobile components (e.g., `mobile-comparison-carousel.tsx`)
- Touch-friendly interactions (swipe gestures, larger tap targets)
- Bottom sheet patterns for mobile filters

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_POCKETBASE_URL=<pocketbase-instance-url>
POCKETBASE_ADMIN_EMAIL=<admin-email>
POCKETBASE_ADMIN_PASSWORD=<admin-password>
```

## Feature Implementation Notes

### Product Comparison (PRD Phase 1)
- Visual charts preferred over tables
- pH comparison uses horizontal bars with color coding
- TDS shown with gauge/progress bars
- Mineral composition uses grouped bar charts
- Support 2-3 products side-by-side on desktop, carousel on mobile

### Filtering (PRD Phase 2)
- Filter by: water type, brand, pH range, TDS range, location, minerals, price
- Active filters shown as removable chips
- Live result count updates
- Sticky filter sidebar on desktop, bottom sheet on mobile

### Analytics (PRD Phase 2)
- Market overview charts (average pH/TDS by brand)
- Mineral distribution visualizations
- Geographic heatmaps
- Health insights by mineral composition

## Code Style

- Use functional components with TypeScript
- Prefer const arrow functions
- Use Tailwind utility classes over custom CSS
- Component file naming: kebab-case (e.g., `product-comparison.tsx`)
- Follow shadcn/ui component patterns for consistency
