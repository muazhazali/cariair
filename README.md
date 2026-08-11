# CariAir

Malaysia's Mineral and Spring Water Source Registry

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS">
</p>

## Overview

CariAir is a Next.js 16 web platform serving as Malaysia's comprehensive mineral and spring water source registry. Users can search, compare, and learn about mineral water brands with detailed data on:

- pH levels
- Total Dissolved Solids (TDS)
- Mineral composition (calcium, magnesium, potassium, sodium, etc.)
- Water source locations with KKM approval numbers
- Brand and manufacturer information
- Interactive map of water sources

## Tech Stack

- **Framework**: Next.js 16 with App Router (React Server Components)
- **Frontend**: React 19, TypeScript (Strict Mode), Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Storage**: JSON file (`data/db.json`) via `lib/json-store.ts` — no database server required
- **Internationalization**: next-intl (Malay `ms` as default, English `en`)
- **API Documentation**: Swagger/OpenAPI at `/docs`
- **Deployment**: Native Node.js with systemd

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/muazhazali/cariair.git
cd cariair

# Install dependencies
pnpm install

# Set up environment variables (optional — only for chatbot/analytics)
cp .env.example .env.local
# Edit .env.local as needed
```

### Development

```bash
# Start Next.js dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

No database setup is required — all data is read from and written to
`data/db.json` at runtime.

## Environment Variables

Create `.env.local` for development (all optional):

```bash
# Chatbot (optional)
GROQ_API_KEY=""

# Analytics (optional)
NEXT_PUBLIC_UMAMI_SCRIPT_URL=""
NEXT_PUBLIC_UMAMI_WEBSITE_ID=""
```

The JSON store needs no environment variables. See `.env.example` for the
authoritative list.

## Production Deployment

### Native Node.js Deployment (Recommended)

Build the standalone Next.js app and run it directly with Node.js:

```bash
# Build for production
pnpm build

# Start the production server
./start-prod.sh
```

### Auto-start on Boot

For LXC containers or servers requiring auto-start, install the systemd service:

```bash
# Install native systemd service
sudo ./scripts/install-native.sh

# Or manually:
sudo cp cariair-native.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now cariair-native
```

See [PRODUCTION.md](PRODUCTION.md) for detailed deployment instructions.

## Project Structure

```
cariair/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── export/       # CSV/JSON export endpoints
│   │   ├── openapi/      # OpenAPI specification
│   │   └── ...
│   ├── docs/             # API documentation (Swagger UI)
│   ├── (routes)/         # Page routes
│   └── layout.tsx        # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── db/               # Data operations (JSON store wrappers)
│   │   ├── products.ts   # Product queries
│   │   ├── sources.ts    # Source queries
│   │   └── ...
│   ├── json-store.ts     # JSON file storage engine
│   ├── products.ts       # Compatibility shim (used by app/page.tsx)
│   ├── features.ts       # Feature flags
│   └── types/            # TypeScript types
├── data/                  # JSON database
│   └── db.json           # All app data
├── i18n/                 # Internationalization
├── messages/             # Translation files
│   ├── ms.json          # Malay
│   └── en.json          # English
└── scripts/             # Deployment scripts
```

## Key Features

### Data Architecture

- JSON file storage via `lib/json-store.ts` (atomic tmp+rename writes,
  in-memory cache, serialized writes)
- Images stored as files in `public/images/db/`, not in the data store
- `lib/db/{products,brands,sources,manufacturers,images}.ts` are thin
  wrappers over the JSON store
- Record field names are snake_case; see `lib/types/db.ts`

### API Routes

- `/api/products` - Product search and filtering with pagination
- `/api/sources` - Water source data with KKM approval numbers
- `/api/brands` - Brand listings and parent companies
- `/api/manufacturers` - Manufacturer information
- `/api/images/[id]` - Image retrieval
- `/api/export/products` - CSV export of all products
- `/api/export/products/json` - JSON export of all products
- `/api/openapi` - OpenAPI specification
- `/api/health` - Health check + data store stats
- `/api/db-test` - Data store connectivity test

### API Documentation

Interactive API documentation is available at `/docs` powered by Swagger UI. The documentation includes:

- All available endpoints
- Request/response schemas
- Query parameters
- Example requests

### Data Export

Export all product data for analysis:

- **CSV Export**: `/api/export/products` - Download as `cariair-products.csv`
- **JSON Export**: `/api/export/products/json` - Download as `cariair-products.json`

### Internationalization

- Locale detection via cookie (`CARIAIR_LOCALE`), not URL prefix
- Malay (`ms`) as default language
- English (`en`) as secondary
- Easy to add more languages

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production (standalone output) |
| `pnpm start` | Start production server (`next start`) |
| `pnpm lint` | Run ESLint (deprecated in Next 16) |

Typecheck with `pnpm exec tsc --noEmit` (no dedicated script).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Security

- Generate secure secrets with `openssl rand -base64 32`
- Keep `.env` files secure (chmod 600)
- TypeScript strict mode enabled for compile-time safety

See [SECURITY.md](SECURITY.md) for security policies.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

For issues or feature requests, please open a GitHub issue.

---

<p align="center">Made with ❤️ for Malaysia's water community</p>