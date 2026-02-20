# CariAir - Mineral Water Source Registry
## Product Requirements Document (PRD)

---

## 1. Project Overview

CariAir is a comprehensive web platform designed to help health-conscious consumers discover, compare, and understand mineral and drinking water sources across Malaysia. The platform provides detailed water composition analysis, interactive comparisons, and data-driven insights to guide purchasing decisions.

**Primary Goal**: Empower users to make informed water source choices based on mineral composition, health benefits, and personal preferences.

**Target Users**: Health-conscious consumers (age 20-55) interested in comparing water brands and understanding mineral content.

---

## 2. Core Features & UI/UX Improvements

### 2.1 Enhanced Product Comparison (Visual Side-by-Side)
**Current State**: Basic table comparison with product images and numeric values.
**Improvements Needed**:

- [ ] **Visual Comparison Charts**
  - Replace/supplement table with interactive side-by-side chart visualizations
  - Show pH level comparison using horizontal bar charts with color coding (acidic/neutral/alkaline)
  - Display TDS (Total Dissolved Solids) using gauge/progress bars
  - Show mineral composition using grouped bar charts (Ca, Mg, K, Na, etc.)
  - Color-code values for easy identification: Green (optimal), Yellow (moderate), Red (high/low)

- [ ] **Mineral Composition Breakdown**
  - Show detailed mineral nutrition facts panel for each selected product (similar to nutrition labels)
  - Include recommended daily intake percentages where applicable
  - Highlight key minerals present in each brand
  - Display mineral count badges (e.g., "12 minerals detected")

- [ ] **Health Facts Panel**
  - Create a comparison card showing health benefits of each water:
    - Immune support, bone health, cardiovascular benefits based on mineral content
    - Filtration/purification method comparison
    - pH impact on body (acidic vs alkaline)
  - Add info icons with tooltip explanations for each health claim

- [ ] **Interactive Features**
  - Toggle between different comparison views (chart view, table view, nutrition panel view)
  - Hover over chart bars to see exact values
  - Ability to add/remove products from comparison without reloading
  - "Export Comparison" button to save as PDF or image

---

### 2.2 Advanced Filtering System
**Current State**: Basic filters for water type, brand, pH range, TDS range.
**Improvements Needed**:

- [ ] **Enhanced Filter UI**
  - Redesign filter panel with collapsible sections for better organization
  - Add sticky filter sidebar on desktop (stays visible while scrolling)
  - Create mobile-optimized filter sheet with clearer hierarchy

- [ ] **New Filter Categories**
  - **By Location**: Filter by region/state in Malaysia (show proximity to user)
  - **By Mineral Content**: Filter by specific minerals (Calcium, Magnesium, Potassium, etc.)
  - **By Price Range**: Add price filtering capability
  - **By Source Type**: Distinct filters for Mineral Water vs Bottled Water vs Drinking Water
  - **By Bottle Size**: 500ml, 1.5L, 5L, 20L options

- [ ] **Smart Filter Features**
  - "Recommended for me" quick-select filters based on common health goals (bone health, detox, energy, etc.)
  - "Clear All" and "Reset" buttons for quick actions
  - Show filter badge count (e.g., "3 filters applied")
  - Display active filter chips/tags for easy removal of individual filters

- [ ] **Filter Results**
  - Show live result count as filters are adjusted
  - Add "No results" state with suggestions (e.g., "Try removing X filter")
  - Option to save filter presets as favorites

---

### 2.3 Detailed Mineral Composition & Health Facts Page
**Current State**: Basic product detail pages with limited mineral information.
**Improvements Needed**:

- [ ] **Mineral Composition Section**
  - Create a prominent "Mineral Profile" card on product detail page
  - Display as structured table: Mineral Name | Amount (mg/L) | Health Benefit
  - Add visual icons/badges for each mineral type (Ca=bone icon, Mg=energy icon, etc.)
  - Show percentage of daily recommended intake for major minerals

- [ ] **Health Benefits Section**
  - Create a dedicated "Health Benefits" card showing:
    - Why certain minerals matter for health
    - How this water brand benefits specific health conditions (bone health, muscle function, hydration, etc.)
    - Supported by mineral composition data
  - Use collapsible accordion for different health benefit categories
  - Include simple callouts (e.g., "High in Calcium - Great for Bone Health")

- [ ] **Water Quality Information**
  - Display filtration/purification method clearly
  - pH level explanation (what acidic/alkaline means for health)
  - TDS interpretation guide (what number means)
  - Source type explanation (spring water vs mineral water vs bottled water)

- [ ] **Visual Health Dashboard**
  - Create a "Wellness Score" badge (1-10 scale) based on mineral composition
  - Show radar chart comparing: pH Balance, Mineral Richness, Purity, Price Value
  - Color-coded health icons (e.g., "✓ Good for Hydration", "✓ High in Minerals", "⚠ High TDS")

---

### 2.4 Data Visualization & Analytics Page
**Location/Route**: New route `/analytics` or `/insights`
**Improvements Needed**:

- [ ] **Market Overview Dashboard**
  - Bar chart: Average pH levels by brands
  - Bar chart: Average TDS by brands
  - Distribution chart: Water types in market (Mineral % vs Spring % vs Bottled %)
  - Line chart: Price trends across different bottle sizes

- [ ] **Mineral Distribution Charts**
  - Grouped bar chart: Top brands by major minerals (Ca, Mg, K, Na)
  - Pie chart: Most common minerals found in Malaysian water sources
  - Heatmap: Brands vs Minerals (showing which brands have which minerals)

- [ ] **Geographic Visualization**
  - Enhanced map showing:
    - Water source locations with clustering
    - Mineral composition heatmap by region
    - Filter results by state/region with live map updates

- [ ] **Health Insights**
  - "Recommended Minerals by Goal" section:
    - What minerals to look for in water for bone health, cardiovascular health, hydration, etc.
    - Which brands match these criteria
  - "Top Rated Brands" per health goal category
  - User-friendly infographics about mineral importance

- [ ] **Comparison Tools on Analytics Page**
  - Multi-brand comparison table sortable by any metric
  - Ability to select multiple brands and generate comparative insights
  - "Download Report" functionality for selected comparisons

---

### 2.5 Mobile Optimization
**Current State**: Responsive but comparison features may be limited on mobile.
**Improvements Needed**:

- [ ] **Mobile Comparison View**
  - Stack comparison charts vertically instead of side-by-side
  - Use carousel/swipe interface for comparing multiple products
  - Single-tap to toggle between chart view and table view
  - Simplified mineral composition cards (show top 5 minerals only on mobile)

- [ ] **Mobile Filter Experience**
  - Bottom sheet filter panel (slide up from bottom)
  - One filter category per screen with "Next" navigation
  - Show active filter count as sticky header
  - Quick presets as prominent tap targets

- [ ] **Mobile Detail Pages**
  - Single-column layout optimized for thumb navigation
  - Card-based mineral composition (not table)
  - Sticky "Add to Comparison" button at bottom
  - Simplified health radar chart or simple success indicators

- [ ] **Touch Interactions**
  - Larger tap targets (min 44x44px for buttons)
  - Swipe gestures for carousel navigation on comparison page
  - Pull-to-refresh on sources page
  - Long-press to save/favorite a brand

---

## 3. Implementation Priority

### Phase 1 (High Priority)
1. Enhanced visual comparison charts (pH, TDS, minerals as bar/gauge charts)
2. Mineral composition detailed view on product detail pages
3. Mobile comparison carousel view

### Phase 2 (Medium Priority)
1. Advanced filtering system redesign with new categories
2. Health benefits section on detail pages
3. Analytics page with mineral distribution charts

### Phase 3 (Lower Priority)
1. Health insights and recommendations engine
2. Advanced geographic visualization
3. Data export/report features
4. Filter presets and favorites system

---

## 4. Technical Considerations

- **Chart Library**: Use existing Recharts for consistency
- **Data Structure**: Ensure all mineral composition data is complete in database
- **Performance**: Optimize chart rendering for large datasets
- **Accessibility**: Ensure all charts have text alternatives and ARIA labels
- **Mobile**: Test on devices 375px-430px width

---

## 5. Success Metrics

- User can compare 2-3 water brands in <2 minutes
- 80% of users find mineral information helpful in decision-making
- Mobile users spend as much time as desktop users
- Filter usage increases by 40% post-implementation
- Analytics page views indicate user interest in data insights
