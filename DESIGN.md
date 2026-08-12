---
name: CariAir
description: A scientific, restrained Malaysian water atlas with an approachable editorial character.
colors:
  atlas-paper: "hsl(45 25% 98%)"
  atlas-ink: "hsl(75 8% 14%)"
  record-card: "hsl(42 25% 99%)"
  bone-field: "#f4f2ec"
  specimen-field: "#eeece5"
  footer-parchment: "#ece9e1"
  quiet-surface: "hsl(45 14% 94%)"
  quiet-ink: "hsl(48 6% 43%)"
  hairline: "hsl(45 10% 86%)"
  input-line: "hsl(45 10% 82%)"
  survey-moss: "#66765a"
  survey-moss-pale: "#dfe8d9"
  survey-moss-ink: "#405039"
  source-aqua-pale: "#e1f3ee"
  source-aqua-ink: "#346558"
  destructive: "hsl(2 53% 44%)"
typography:
  display:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "clamp(3.25rem, 8vw, 7.75rem)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Aptos, SF Pro Text, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Aptos, SF Pro Text, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.atlas-ink}"
    textColor: "{colors.atlas-paper}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.atlas-paper}"
    textColor: "{colors.atlas-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  input-search:
    backgroundColor: "{colors.atlas-paper}"
    textColor: "{colors.atlas-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 40px"
    height: "44px"
  water-type-badge:
    backgroundColor: "{colors.source-aqua-pale}"
    textColor: "{colors.source-aqua-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  product-card:
    backgroundColor: "{colors.record-card}"
    textColor: "{colors.atlas-ink}"
    rounded: "{rounded.xl}"
    padding: "0"
---

# Design System: CariAir

## Overview

**Creative North Star: "The Malaysian Water Atlas"**

CariAir feels like a contemporary public atlas: measured enough to make regulatory and composition data credible, yet warm enough to invite ordinary shoppers into the material. Large serif headings establish editorial authority; compact monospaced indices, specimen numbers, and measurements add a scientific register without turning the interface into laboratory software.

The system is scientific, precise, and restrained. Its warm paper fields, fine rules, quiet Survey Moss signals, and generous reading space keep dense records approachable. Decoration is sparse and functional: map grids, source glyphs, numeric indices, and product photography all reinforce the act of locating, cataloguing, and comparing water.

**Key Characteristics:**

- Warm paper surfaces with dark olive-black type and fine neutral rules.
- Editorial serif display type paired with a practical sans-serif body and monospaced data labels.
- Border-led hierarchy, restrained Survey Moss accents, and almost no ambient shadow.
- Wide atlas-like compositions that collapse into orderly single-column reading on small screens.
- Rounded but not soft: compact controls use modest corners; record panels use a larger, consistent radius.

## Colors

The palette resembles field paper, printed ink, survey markings, and clean source water; color identifies structure and status rather than decorating empty space.

### Primary

- **Atlas Ink:** The near-black olive used for primary text, solid actions, and the strongest structural contrast.
- **Survey Moss:** The controlled geographic accent used for source marks, selected details, and small moments of emphasis.

### Secondary

- **Survey Moss Pale:** A quiet green field behind brand marks, counts, and compact registry labels.
- **Survey Moss Ink:** The matching foreground for moss-tinted surfaces and line icons.

### Tertiary

- **Source Aqua Pale:** A clean mineral-water tint reserved for water-type and composition status treatments.
- **Source Aqua Ink:** The legible data-label foreground paired with Source Aqua Pale.

### Neutral

- **Atlas Paper:** The principal page and control background.
- **Record Card:** The slightly cleaner surface for cards, panels, popovers, and documents.
- **Bone Field:** The alternate registry and reading field used to divide major page regions.
- **Specimen Field:** The image-well background that separates product photography from record content.
- **Footer Parchment:** The deeper closing surface used only at the page boundary.
- **Quiet Surface:** The subdued fill for inactive controls, skeletons, and low-emphasis regions.
- **Quiet Ink:** Supporting copy, captions, metadata, and inactive navigation.
- **Hairline:** The default rule, divider, and card border.
- **Input Line:** The slightly stronger control boundary.
- **Destructive:** Reserved for errors and genuinely destructive actions.

### Named Rules

**The Survey Mark Rule.** Survey Moss is a locator, not a wash: use it on small marks, icons, counters, or selected states rather than broad decorative sections.

**The Paper Stack Rule.** Separate major regions with the established paper neutrals and hairline rules; do not introduce arbitrary white cards on unrelated gray canvases.

## Typography

**Display Font:** Georgia (with Times New Roman and serif fallbacks)

**Body Font:** Aptos (with SF Pro Text, Helvetica Neue, Arial, and sans-serif fallbacks)

**Label/Mono Font:** The platform monospaced stack used by Tailwind's `font-mono` utility

**Character:** The serif supplies civic-editorial authority while the sans-serif keeps filters, explanations, and navigation direct. Monospaced labels turn measurements and indices into compact catalogue notation.

### Hierarchy

- **Display** (regular, fluid 3.25–7.75rem, 0.88 line-height): Reserved for the home hero and similarly dominant atlas titles; use tight negative tracking and text wrapping deliberately.
- **Headline** (regular, fluid 2.25–3.75rem, 1 line-height): Major section and page headings, normally introduced by a registry index.
- **Title** (semibold, 1.125rem, 1.375 line-height): Product names, card headings, dialog titles, and compact content hierarchy.
- **Body** (regular, 1rem, 1.6 line-height): Explanations and reading copy; most long text stays within roughly 48rem or another visibly bounded measure.
- **Label** (medium, 0.625rem, 0.18em tracking, uppercase): Section indices, metrics, statuses, and record notation. Reduce tracking slightly for dense badges.

### Named Rules

**The Three Registers Rule.** Serif explains where the reader is, sans-serif explains what to do, and monospace identifies the record or measurement; do not swap these roles casually.

**The Quiet Data Rule.** Labels stay small and spaced, but measured values remain legible and tabular; never shrink the value to match its caption.

## Layout

Pages use a centered maximum width of 88rem with responsive horizontal padding: 20px by default, 32px from the small breakpoint, and 48px from the large breakpoint. Major sections typically use 64–96px vertical space on smaller screens and extend toward 128px on large screens. Hairline borders and alternating paper surfaces divide the long page into atlas plates.

Layouts begin as a single readable column and introduce grid relationships at medium or large widths. Desktop compositions use purposeful asymmetry—such as a broad title beside a narrow explanation, or a featured first record spanning two grid columns—rather than equal card mosaics everywhere. The home registry controls become sticky beneath the 72px navigation bar, while maps and product wells use fixed responsive heights to preserve their visual weight.

The standard responsive breakpoints follow the Tailwind defaults used by the project: small at 640px, medium at 768px, large at 1024px, extra-large at 1280px, and 2XL at 1536px. Mobile navigation becomes a bordered vertical index; side-by-side groups stack; controls preserve touch-friendly heights of roughly 40–44px.

**The Atlas Plate Rule.** Each major region needs one clear spatial idea—title plate, map plate, registry plate, or reading plate—rather than a collection of interchangeable containers.

## Elevation & Depth

The system is flat and border-led. Tonal paper changes, image wells, fine rules, and sticky translucent surfaces create depth before shadows do. Shadows are reserved for overlays, dropdowns, and a nearly imperceptible hover lift on actionable cards; they remain neutral, diffuse, and low-opacity. Dialog and sheet overlays use a dark translucent veil with a slight 2px backdrop blur.

### Shadow Vocabulary

- **Record Lift** (`0 4px 18px rgba(52, 50, 42, 0.04)`): Only for hoverable record cards and floating select content.
- **Overlay Lift** (`0 12px 40px rgba(52, 50, 42, 0.045)`): Dialogs and other centered overlays.
- **Edge Lift** (`0 0 40px rgba(52, 50, 42, 0.045)`): Side sheets where a subtle edge separation is needed.
- **Map Popup** (`0 4px 20px rgba(52, 50, 42, 0.06)`): Leaflet popups only.

### Named Rules

**The Flat-by-Default Rule.** A resting surface is separated by tone or a one-pixel rule, never by a generic card shadow.

## Shapes

The shape language is gently technical. Controls use modest 4–8px corners, while major record cards, image wells, maps, and reading panels use 12px corners. Pills are reserved for statuses, types, and compact counts. Borders are thin and continuous; icons favor square line caps and simple geometric construction. Image and map content is clipped cleanly inside its containing panel.

**The Radius Hierarchy Rule.** Use small corners for controls, medium corners for compact surfaces, and 12px corners for major records; do not make every element a pill.

## Components

Components are refined and approachable: exact enough for data work, but never aggressively dense or mechanical.

### Buttons

- **Shape:** Gently squared controls with 6px corners and 40–44px heights.
- **Primary:** Atlas Ink fill with Atlas Paper text; compact semibold copy and 16–20px horizontal padding.
- **Hover / Focus:** Hover reduces fill intensity slightly; active state may compress to 98%. Keyboard focus uses a visible two-pixel Survey Moss-family ring with offset.
- **Outline:** Atlas Paper background, Input Line or Hairline border, Atlas Ink text; hover moves toward the quiet green accent surface.
- **Text link:** Semibold inline copy with a low-contrast underline that strengthens on hover, often paired with a simple arrow.

### Chips

- **Style:** Full pills with monospaced uppercase labels. Water categories use Source Aqua; registry counters and compact marks use Survey Moss Pale.
- **State:** Color conveys category or selection only when the label remains explicit; never rely on hue alone.

### Cards / Containers

- **Corner Style:** Major records use 12px corners; nested metric and explanatory panels use 8px corners.
- **Background:** Record Card for content and Specimen Field for product imagery.
- **Shadow Strategy:** Flat at rest; Record Lift only on interactive hover.
- **Border:** One-pixel Hairline around the perimeter and between meaningful card regions.
- **Internal Padding:** Usually 20–24px, increasing to 32px for larger information panels.

### Inputs / Fields

- **Style:** Atlas Paper fill, Input Line border, 6px corners, 40–44px height, and 12px side padding; icon-bearing search fields reserve 40px on the relevant edge.
- **Focus:** A clear Survey Moss-family ring with offset; page-specific search controls may use a restrained one-pixel ring.
- **Error / Disabled:** Destructive color is reserved for errors. Disabled controls reduce opacity to 50% and stop pointer interaction.

### Navigation

The 72px sticky navigation uses translucent Atlas Paper, a bottom hairline, and moderate backdrop blur. The active desktop link has a one-pixel underline that grows from the left; inactive links use Quiet Ink and reveal the same line on hover. Mobile navigation becomes a bordered vertical list with monospaced numeric indices. The language switcher is a compact segmented control whose active locale returns to Atlas Paper with a one-pixel ring.

### Product Record Card

The product card is the signature atlas specimen: a large quiet image well, small category and sequence labels, a clear product title, source location, and a ruled two-column metric footer. On hover, the card lifts by only two pixels, its border strengthens, the bottle scales gently, and the arrow control inverts.

### Motion

State transitions generally last 200ms. Page sections enter with a restrained 600ms upward fade using `cubic-bezier(0.16, 1, 0.3, 1)`; product images may ease over 500ms. Sheets use 300ms ease-out movement. All nonessential animation and smooth scrolling collapse under `prefers-reduced-motion: reduce`.

## Do's and Don'ts

### Do:

- **Do** use alternating paper tones and hairline rules to organize dense catalogue information.
- **Do** preserve the serif, sans-serif, and monospace role separation.
- **Do** keep Survey Moss rare and functional, especially for source, selection, and registry cues.
- **Do** make unknown, pending, and missing values explicit with labels or dashes instead of implying completeness.
- **Do** keep touch controls near the established 40–44px height and retain visible keyboard focus.
- **Do** let product photography, maps, data, and real source records carry the visual interest.

### Don't:

- **Don't** add gradients, glossy effects, or saturated decorative color fields.
- **Don't** use heavy ambient shadows or floating cards where a paper shift and border already establish hierarchy.
- **Don't** turn every label, control, or container into a pill.
- **Don't** replace the restrained atlas geometry with generic equal-weight bento grids.
- **Don't** introduce a new display font, color family, or icon style without intentionally revising this system.
- **Don't** use motion that competes with reading, comparison, or map interaction.
