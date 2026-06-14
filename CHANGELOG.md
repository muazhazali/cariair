# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-06-14

### Added
- Initial release of CariAir
- PostgreSQL database with full data migration from PocketBase
- Docker support for easy local development
- Complete water source registry for Malaysian mineral water brands
- Product search with filters (pH, TDS, brand, source type)
- Interactive map showing water source locations
- Product comparison feature
- Water quality analytics dashboard
- AI-powered chatbot for water-related questions (Groq integration)
- Image storage with PostgreSQL BYTEA
- Multi-language support (Malay and English)
- Responsive design for mobile and desktop
- NextAuth.js authentication with Google OAuth
- Contribution system for adding new water data

### Data
- 14 water brands (Spritzer, Cactus, Dasani, Ice Mountain, etc.)
- 13 water sources with GPS coordinates
- 13 manufacturers
- 15 products with complete mineral composition data
- 14 product images

### Technical
- Next.js 15 with App Router
- React 19 with Server Components
- TypeScript for type safety
- Tailwind CSS + Radix UI components
- PostgreSQL 16 with connection pooling
- Docker Compose configuration
- CLAUDE.md for AI development context

## Migration Notes

### From PocketBase
This release completes the migration from PocketBase to PostgreSQL. All data including:
- Brands, sources, manufacturers
- Products with mineral compositions
- Images (downloaded and stored in database)
- User accounts

Has been successfully migrated to the new PostgreSQL schema.

[Unreleased]: https://github.com/muazhazali/cariair/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/muazhazali/cariair/releases/tag/v1.0.0
