# BRAND.md

> Identity layer: voice, naming, logo, positioning, and trademark safety. Token values live in `docs/DESIGN.md`.

## Positioning

Sprig is the native desktop client for Linux users who want multi-account WhatsApp Web and Google Messages in isolated partitions, without relying on browser tabs or third-party servers.

## Voice

Calm, direct, technical, unobtrusive, privacy-conscious.

### Voice rules

**Do:**
- State functionality clearly and concisely (e.g., "Run multiple isolated sessions on Linux").
- Emphasize user privacy, local execution, and zero intermediary tracking.
- Adhere to Linux desktop platform terminology (e.g. system tray, libadwaita, .desktop integration).

**Don't:**
- Do not use sensationalized marketing superlatives ("revolutionary", "magical").
- Do not use WhatsApp or Google Messages official logos or trade dress in place of Sprig marks.
- Do not imply official affiliation with WhatsApp, Meta Platforms, Inc., or Google LLC.

### Trademark & Legal Safety

- Sprig is an independent third-party client.
- The name "Sprig" evokes a botanical shoot, justifying a fresh green palette on its own terms rather than mimicking WhatsApp's branding.
- The leaf motif provides a distinctive mark, avoiding any phone-in-speech-bubble trademark conflicts.
- Always include the standard trademark disclaimer in external communications and documentation:
  > *Disclaimer: Sprig is an independent open-source project. WhatsApp is a trademark of Meta Platforms, Inc. Google Messages is a trademark of Google LLC. Sprig is not affiliated with or endorsed by Meta Platforms, Inc. or Google LLC.*

## Brand-defining color choices

All color values and semantic tokens are defined in [docs/DESIGN.md](docs/DESIGN.md).

- **Primary Brand Color:** Sprig Green (`--accent-fill`, `#16B364`)
- **Dark Accent / Headers:** Fern (`--accent`, `#0C6B4E`)
- **Primary Ink:** Deep Charcoal Ink (`--text`, `#10201A`)
- **Surfaces:** Clean Light / Dark Slate (`--surface`, `--dark-surface`)

## Brand-defining typography choices

Typeface rules and scales are specified in [docs/DESIGN.md](docs/DESIGN.md).

- **Desktop UI font stack:** System-native Linux typography (`Ubuntu`, `Cantarell`, `Inter`, `system-ui`).
- **Code / Mono font stack:** Standard monospace (`Ubuntu Mono`, `monospace`).

## Logo and marks

Canonical brand assets are sourced from `/home/asif/Documents/brands/sprig/` and mirrored in the project under `src/assets/brand/`:

- `src/assets/brand/svg/icon.svg` — Primary botanical leaf mark
- `src/assets/brand/svg/logo-dark.svg` / `logo-light.svg` — Horizontal brand mark
- `src/assets/brand/svg/logo-wordmark-dark.svg` / `logo-wordmark-light.svg` — Wordmark cuts
- `src/assets/brand/svg/sprig-symbolic.svg` — Monochromatic symbolic icon for system tray and GNOME status areas
- `src/assets/brand/hicolor/` — Standard FreeDesktop icon theme sizes (16x16 through 512x512)

## Naming

- **Product name:** Sprig
- **App ID:** `com.adommo.sprig`
- **Binary / command:** `sprig`
- **Tagline:** A native WhatsApp & Google Messages client for Linux

## Domain vocabulary

- We say **"isolated partition"** or **"session partition"** for account data separation.
- We say **"service"** for WhatsApp Web vs. Google Messages.
- We say **"tray badge"** for the unread message counter.
