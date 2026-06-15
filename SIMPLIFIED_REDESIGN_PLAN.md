# CariAir Simplified Redesign Plan
## Single-Page Architecture with Senior UI/UX Approach

---

## Philosophy

**"The best UI is no UI."**

Users come to CariAir for one reason: find water sources. Everything else is friction.

---

## New Architecture: Just 2 Pages

```
┌─────────────────────────────────────────────────────────┐
│  🏠 Home (/)                     ℹ️  About (/about)     │  ← Only nav items
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │              🗺️  INTERACTIVE MAP                │   │  ← Full-width, 50vh
│  │           (Shows all water sources)             │   │     at top of page
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔍 Search...    [Filters ▼]                     │   │  ← Sticky below map
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  💧     │ │  💧     │ │  💧     │ │  💧     │      │  ← Product grid
│  │ SPRITZER│ │ CACTUS  │ │  ...    │ │  ...    │      │     streams below
│  │ pH 7.2  │ │ pH 7.5  │ │         │ │         │      │
│  │ TDS 120 │ │ TDS 85  │ │         │ │         │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│                    ... more ...                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Page Structure: Home (/)

### Section 1: Hero-Map (50vh, sticky experience)
- Full-width interactive map
- Shows ALL water source locations
- Click marker → highlights product in list below
- Hover marker → quick tooltip with brand name
- Minimal chrome: just zoom controls

### Section 2: Filter Bar (Sticky)
- Search input (text search)
- Filter button → opens drawer/modal with:
  - Water type checkboxes
  - pH range slider
  - TDS range slider
  - Brand multi-select
- Sort dropdown
- Result count

### Section 3: Product Grid (Infinite scroll or paginated)
- Clean card grid
- Responsive: 1 (mobile) / 2 (tablet) / 3 (desktop) / 4 (wide)
- Cards link to detail view (opens in modal/sheet, NOT new page)

### Section 4: Footer
- Minimal: Logo, copyright, GitHub link
- Remove: Learn, Contribute, Analytics links (not core to task)

---

## Page Structure: About (/about)

Simple static page:
- Mission statement
- Data sources
- Open source link
- Contact

That's it. No tabs, no complexity.

---

## Navigation Simplification

### Before (6 items):
Home | Sources | Map | Analytics | Learn | Contribute | About

### After (2 items):
🏠 Home | ℹ️ About

Mobile: Same 2 items, no bottom nav needed (just a hamburger with 2 items is silly - keep the header)

---

## Files to Delete/Reroute

### Pages to Remove (consolidate into home):
- `/sources` → functionality moves to `/`
- `/map` → functionality moves to `/` (map is now at top)
- `/search` → functionality moves to `/` (search is now in filter bar)
- `/analytics` → can be added later as a footer link if needed
- `/learn` → not core to user task, remove for now
- `/contribute` → can be in About page

### Keep:
- `/` (Home - the everything page)
- `/about` (About - simple static)
- `/sources/[id]` → Detail view (but open in modal instead? or keep as separate for SEO?)
- API routes (all remain)

### Navigation Component Changes:
- `MainNav`: 2 items only
- `MobileBottomNav`: DELETE - not needed with 2 pages

---

## Component Redesign

### New: MapSection
- Full-width map at top
- Leaflet/Mapbox with custom markers
- Source type color-coded markers
- Clustering for many sources

### New: FilterBar
- Sticky after scroll past map
- Compact design
- Mobile: collapses to icon buttons

### Redesign: ProductCard (minimal)
```
┌──────────────────┐
│                  │
│     IMAGE        │
│                  │
├──────────────────┤
│ SPRITZER         │  ← Brand
│ Mineral Water 1L │  ← Product name (smaller)
│                  │
│ pH 7.2  •  TDS 120│  ← Key metrics inline
│                  │
│ 📍 Taiping, Perak │  ← Location
└──────────────────┘
```
- No gradient text
- No complex badges
- Clean, scannable

### New: ProductDetailModal (replaces /sources/[id] page)
- Opens when card clicked
- Full product info
- Full-size map of source location
- Nutrition/mineral table
- Close to return to list

---

## Senior UI/UX Decisions

### 1. Map-First Design
Users want to know: "Where is this water from?"
Map answers this immediately. It's the hero.

### 2. No Page Loads for Filtering
Everything happens on one page:
- Filter applied → list updates instantly
- No navigation, no waiting
- Map filters with list (synced)

### 3. Progressive Disclosure
- Advanced filters hidden behind "Filters" button
- Product details in modal (don't leave context)
- Learn content removed (not blocking task)

### 4. Mobile-First Scrolling
- Map takes top 40-50vh
- User scrolls down to see products
- Filter bar sticks below map
- Natural scroll behavior

### 5. Visual Hierarchy
1. Map (largest, top)
2. Search/Filter (sticky, always accessible)
3. Results (the content)

### 6. Remove Cognitive Load
- No decision paralysis (2 nav items)
- No "where do I go?" confusion
- Single entry point, clear path

---

## Implementation Steps

### Phase 1: Strip Down (Delete)
1. Update `MainNav` → 2 items only
2. Delete `MobileBottomNav`
3. Remove `/sources`, `/map`, `/search`, `/analytics`, `/learn`, `/contribute` pages
4. Keep `/about` simple

### Phase 2: Build Home Page
1. Create new `app/page.tsx`:
   - Map section (top)
   - Filter bar (sticky)
   - Product grid
2. Move filtering logic from `SourcesView` into page
3. Update `ProductCard` → minimal design

### Phase 3: Product Detail
Option A: Keep `/sources/[id]` (separate page)
Option B: Modal approach (stay on page)
→ Recommend B for UX, A for SEO

### Phase 4: Polish
1. Ensure mobile scroll feels natural
2. Map interaction smooth
3. Filter transitions
4. Empty states

---

## Wireframe

```
┌─────────────────────────────────────────────────────────┐
│  💧 CariAir                              Home    About  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │                                                 │   │
│  │              [  MAP  GOES  HERE  ]              │   │  50vh
│  │                                                 │   │
│  │                                                 │   │
│  │         (Markers for each source)               │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔍 Search brand or product...       [Filters]│   │  Sticky
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Found 47 water sources                                 │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │         │  │         │  │         │  │         │     │
│  │ [IMG]   │  │ [IMG]   │  │ [IMG]   │  │ [IMG]   │     │
│  │         │  │         │  │         │  │         │     │
│  │SPRITZER │  │ CACTUS  │  │ AEON    │  │  ...    │     │
│  │Mineral  │  │ Drinking│  │ Spring  │  │         │     │
│  │         │  │         │  │         │  │         │     │
│  │pH 7.2   │  │ pH 7.5  │  │ pH 7.0  │  │         │     │
│  │TDS 120  │  │ TDS 85  │  │ TDS 45  │  │         │     │
│  │         │  │         │  │         │  │         │     │
│  │📍 Taiping│  │📍 Shah  │  │📍 Klang │  │         │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │  ...    │  │  ...    │  │  ...    │                  │
│  └─────────┘  └─────────┘  └─────────┘                  │
│                                                         │
│  [        Load More        ] or infinite scroll         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  💧 CariAir                © 2024  ·  Open Source       │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Considerations

### SEO Impact
- Losing `/sources`, `/map` URLs → redirect to `/`
- Product detail pages should remain for SEO (`/sources/[id]`)
- Add proper canonical tags

### Performance
- Large map + product list on one page
- Implement virtual scrolling for many products
- Lazy load product images
- Debounce map updates on filter

### State Management
- Filters in URL query params (shareable)
- Map bounds sync with filter (show only visible sources)

---

## Summary

**Before:** 7+ pages, complex nav, decision fatigue  
**After:** 2 pages, map-first, instant filtering

**Key Win:** Users land → see map → filter → find water. No clicks, no confusion.
