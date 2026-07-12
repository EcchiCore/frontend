# Design

## Register

brand

## Theme

Dark-first. The default theme is dark (set in ThemeProvider). The primary audience browses in low ambient light (late evening). Light mode is a secondary toggle.

## Color Strategy

Committed. A single saturated brand hue (magenta/fuchsia, oklch ~`0.65 0.24 350`) carries emphasis across interactive elements, accents, and active states on a deep dark neutral background tinted very slightly toward the hue. Light mode remains a near-neutral grayscale.

## Palette

### Dark (primary)
| Token | Value | Usage |
|---|---|---|
| background | `oklch(0.115 0.005 290)` | Page background |
| foreground | `oklch(0.965 0.005 290)` | Body text |
| card | `oklch(0.175 0.008 290)` | Card surfaces |
| primary | `oklch(0.650 0.240 350)` | Brand accent — buttons, active tabs, links, highlights |
| primary-foreground | `oklch(0.985 0.005 350)` | Text on primary |
| muted | `oklch(0.220 0.008 290)` | Muted backgrounds |
| muted-foreground | `oklch(0.620 0.020 290)` | Secondary text |
| border | `oklch(0.250 0.010 290)` | Borders |

### Light
Standard shadcn grayscale defaults.

## Typography

System sans-serif stack. Headings use bold weight contrast. Body text line-length capped at ~65ch. No eyebrow/kicker scaffolding above section headings.

## Layout

- Container: `max-w-5xl` for focused content, `max-w-6xl` for game grids, `max-w-7xl` for catalog
- Hero carousel: full-width, `clamp(280px, 50vh, 480px)`
- Section spacing: `py-10` to `mb-16` for breathing room between sections
- Game grid: `repeat(auto-fit, minmax(240px, 1fr))` equivalent via explicit breakpoints

## Components

- Hero carousel: full-bleed, auto-rotate 6s, pause on hover/focus, prev/next arrows, dot navigation, swipe support, reduced-motion fallback
- Tag pills: horizontal wrap, single brand color on hover, navigate to catalog with tag filter
- Tabbed game lists: tab switching with accent highlight, 4-column responsive grid
- Sponsored strip: minimal horizontal scroll with thumbnail + title
- Cards: subtle hover scale (1.03), no border+shadow pairing (single border only)

## Motion

- Carousel: slide keyframes (`slideInRight`/`slideInLeft`), scale on hover
- Cards: subtle scale on hover, no shadow animation
- All motion disabled via `prefers-reduced-motion: reduce` media query

## Event Themes

Halloween and Christmas event themes override all tokens via `data-event-theme` attribute. These take precedence over dark/light base themes.
