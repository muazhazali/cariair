# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are Malaysian consumers comparing bottled water before purchase. They need to understand what a product contains, where its water comes from, and how it differs from nearby choices without having to interpret technical labels unaided.

Secondary users are researchers and developers who use CariAir's open catalogue, exports, and API as structured Malaysian bottled-water data.

## Product Purpose

CariAir helps people trace bottled water sold in Malaysia to its source, compare pH, total dissolved solids (TDS), and mineral composition, and understand those measurements in plain language. Success means a visitor can move from an unfamiliar bottle or brand to a transparent, useful source record and make a better-informed comparison.

## Positioning

CariAir is a bilingual, open-source Malaysian bottled-water registry that brings product identity, source location, KKM approval records, and composition data into one searchable and comparable public catalogue. Its distinctive mechanism is connecting consumer-facing products to both their underlying water sources and understandable water-quality measurements.

## Operating Context

- Consumers browse, search, filter, and sort mineral and drinking-water products by brand, type, pH, and TDS.
- Visitors inspect source locations on a map and open product records for composition, manufacturer, approval, and source details.
- Educational content explains pH, TDS, minerals, water categories, and Malaysian standards in plain language.
- Researchers and developers can inspect the documented API or export product data as CSV or JSON.
- Community contributors can supply catalogue data for review; published records remain the product's public source of truth.

## Capabilities and Constraints

- Malay (`ms`) is the default language and English (`en`) is supported; durable product content must remain usable in both languages.
- Catalogue data uses the schema-v2 flat JSON store in `data/db.json`; product images are file assets under `public/images/products/`.
- Product records cover mineral water and drinking water, with source, brand, manufacturer, pH, TDS, mineral, image, and KKM approval fields where evidence is available.
- The registry supports search, comparison, geographic exploration, educational reading, API access, and bulk export.
- Data is community-reviewed, so the interface must distinguish recorded facts, missing data, and pending or unverified information rather than implying certainty.
- Health information is educational and based on recorded composition and general nutritional science; it must not be presented as medical advice or a guaranteed personal outcome.
- Authentication is not currently implemented. Product behavior must not rely on authenticated accounts until that layer exists.

## Brand Commitments

- Product name: CariAir.
- Default public voice: clear, calm, factual, locally relevant, and approachable to readers without specialist knowledge.
- Malay-first bilingual access, transparency, open data, community participation, and source traceability are enduring commitments.
- CariAir is open source; visitors may inspect the code, contribute, or run their own instance.

## Evidence on Hand

- The live catalogue in `data/db.json`, including product, source, company, composition, and approval fields where recorded.
- Product photography in `public/images/products/` and geographic coordinates for mapped sources where available.
- Malay and English product copy in `messages/ms.json` and `messages/en.json`.
- Public API documentation at `/docs`, plus CSV and JSON export endpoints.
- The public source repository linked from the product's About page.
- No independent audit, laboratory certification, testimonials, outcome studies, or medical evidence has been established in this product record. Future work must not fabricate or imply them.

## Product Principles

1. Trace claims to records: connect every useful comparison to the product, source, approval, or composition data behind it.
2. Make technical water data understandable without flattening away important distinctions or uncertainty.
3. Serve Malaysian users first through local regulatory context and Malay-first bilingual access.
4. Prefer transparent absence over invented completeness when catalogue evidence is missing.
5. Keep the registry open and reusable for consumers, contributors, researchers, and developers.
