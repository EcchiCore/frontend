# Product

## Register

brand

## Users

Adult gamers (18+) browsing on desktop and mobile for free and paid adult games to download. They arrive on the home page in a discovery mood, scanning for something worth their time, and decide within seconds whether to click into a game or leave. Secondary users are returning members checking what's new or trending. Context: late-evening, low-ambient-light, leisure browsing; often one-handed on mobile. Speed of "is there something interesting here" is the dominant read.

## Product Purpose

ChanomHub is an adult gaming hub / storefront. It curates and distributes adult games (free and paid, in "CC" currency), with a community of members, sponsored placements, and donation support. The home page's job is brand first: make a strong first impression, communicate what ChanomHub is, and move people into the catalog. Success on home = the visitor feels "this place has taste and I want to explore it," then clicks through to a game.

## Brand Personality

Minimal, clean, confident. Let the games and imagery do the talking; the UI stays out of the way. Cinematic and premium without being loud. The platform has identity (it is the place for adult games), not a generic storefront. Three words: clean, confident, curated.

## Anti-references

- Generic SaaS / dashboard templates with dense stat cards, identical card grids, and gradient accents. The current home (4-up stats, dense tag buttons, many stacked sections) reads this way.
- Cluttered ad-heavy portals where it's unclear what's content vs. promotion. Sponsored and donation content must be clearly delineated, not competing with editorial picks.
- Warm beige / "paper" AI-default backgrounds (cream, sand, parchment). Not appropriate here.
- Flat grayscale-only identity (the current tokens are pure black/white with no brand hue), which reads as a shadcn template, not a brand.

## Design Principles

1. **Brand leads, catalog follows.** The first screen should establish what ChanomHub is through one strong cinematic moment, not through stats and search controls. Discovery and search come after the visitor is hooked.
2. **Let the games be the art.** Imagery and cover art carry the visual weight; chrome, borders, and decoration stay quiet. When in doubt, remove a border, a badge, a divider before adding one.
3. **One clear hierarchy.** A visitor should always know where to look next. Fewer sections, stronger spacing between them, and a deliberate top-to-bottom narrative beat the current many-equal-sections stack.
4. **Curated, not exhaustive.** Show fewer, better-chosen items per row (a curated shelf) instead of dense grids of everything. Curation signals taste.
5. **Confident restraint with one brand hue.** Clean neutrals anchored by a single committed brand color used sparingly for emphasis, replacing the current flat grayscale so the page reads as a brand, not a template.

## Accessibility & Inclusion

- WCAG 2.1 AA: body text ≥4.5:1 contrast (current muted-foreground on background is borderline and must be verified, especially over imagery and tinted surfaces).
- Dark mode is the primary theme for this audience (late-evening, low-light browsing); design dark-first, then light.
- All hover/transform interactions must have a `prefers-reduced-motion` fallback (the current carousel and card hover scales need one).
- Image-heavy layout: meaningful alt text on covers; text-on-image must keep contrast over gradient overlays.
