# AGENTS.md

> Briefing packet for AI coding agents (Claude Code, Antigravity, Codex, Cursor, Gemini CLI, etc.).
> Humans should read README.md instead.

## Rules of engagement

These rules are the agent's first read every session. Keep this list short — 5–10 rules, each one absolute.

1. **Do** follow conventions documented in this file and the relevant `docs/` file. **Don't** invent new conventions silently.
2. **Do** check `docs/DECISIONS.md` before contradicting any documented pattern.
3. **Do** read `docs/SECURITY.md` Hard Rules before touching auth, data handling, or any input-validation code.
4. **Do** ask before expanding scope beyond `docs/PRODUCT.md`.
5. **Don't** edit files in the do-not-touch zones below.
6. **Don't** introduce a new third-party dependency without a `docs/DECISIONS.md` entry.
7. **Do** enforce and conform to `.editorconfig` formatting rules (2-space indentation, LF line endings, UTF-8 charset, trailing whitespace trimming) across all code and documentation.
8. **Do** test in both `npm start` and `npm run dev` modes before declaring work complete.
9. **Don't** modify Electron's security model (sandbox settings, protocol handlers, context isolation) without explicit approval and a `docs/DECISIONS.md` entry.

## Stack

- **One-Line Summary:** Electron 33 + Vanilla JS desktop app for Linux packaging WhatsApp Web & Google Messages with multi-account session partitioning, system tray, and native protocol handling.
- **Language:** JavaScript (Node.js, CommonJS)
- **Framework:** Electron v33.2
- **Backend:** None — desktop client connecting directly to official web messaging endpoints
- **Database:** None — account profiles persisted to `~/.config/sprig/accounts.json`, session data in isolated Electron partitions
- **Hosting / runtime:** Linux desktop (deb, AppImage)
- **Package manager:** npm — use `npm ci` for clean installs
- **Node version:** v18+ (Node 18/20 LTS recommended)
- **Build tool:** electron-builder v25.1

## Commands

```bash
# Run (standard mode)
npm start

# Run (development mode with DevTools)
npm run dev

# Build all Linux packages (.deb & .AppImage)
npm run build

# Build .deb only
npm run build:deb

# Build AppImage only
npm run build:appimage

# Unpack without packaging (test build)
npm run pack

# Clean dependency installation
npm ci
```

## Conventions

- **Code Style & Formatting (.editorconfig):** Strict adherence to `.editorconfig`. All files use 2-space indentation, LF line endings, UTF-8 charset, trimmed trailing whitespace, and final newlines.
- **Linters / Formatters:** No external linter or formatter (ESLint, Prettier, Biome) is currently configured. Parity is maintained through `.editorconfig` and existing codebase patterns.
- **Design Specifications:** All design files (including `docs/DESIGN.md` and its derived/override mirror files) must strictly adhere to the Google Labs `design.md` format specification (combining machine-readable YAML frontmatter with standard markdown sections).
- **File naming:** lowercase with hyphens for assets, camelCase not used in filenames.
- **Module style:** CommonJS (`require`/`module.exports`).
- **Process separation:** Main process code in `src/main/`, renderer process code in `src/renderer/`, shared brand assets in `src/assets/brand/`.
- **IPC pattern:** Main ↔ renderer communication strictly via `ipcMain`/`ipcRenderer` using `contextBridge` in `src/renderer/preload.js`.
- **No external APIs:** Sprig connects directly to `web.whatsapp.com` and `messages.google.com`. There is no backend server, telemetry, or third-party tracking.

## Project-specific rules

- All account session data is isolated via Electron's `partition` feature (`persist:account-<id>`). Never share partitions across different accounts.
- Protocol handlers (`whatsapp://`, `sms:`) are registered in `src/main/protocol.js` — always route through the protocol module, never handle URLs directly in `main.js`.
- Tray icon management lives in `src/main/tray.js` — never manipulate the system tray directly from the renderer process.
- The renderer's `preload.js` is the only bridge between main and renderer. Never expose Node.js APIs directly to the renderer.

## Do-not-touch zones

- `node_modules/` — managed by npm
- `dist/` — electron-builder output, never edit by hand
- `package-lock.json` — regenerate via `npm install`, never edit manually
- `build/icons/` — build resources for electron-builder, do not reorganize
- `src/assets/brand/` — canonical brand assets sourced from upstream `/home/asif/Documents/brands/sprig/`

## Where to look

- Architecture overview: `docs/ARCHITECTURE.md`
- Settled decisions: `docs/DECISIONS.md` (read before contradicting any pattern)
- Product scope: `docs/PRODUCT.md` (read before adding features)
- Security policy & hard rules: `SECURITY.md` (root) and `docs/SECURITY.md`
- Test strategy & checklists: `docs/TESTING.md`
- Design system & tokens: `docs/DESIGN.md`
- Brand identity & voice: `docs/BRAND.md`
- User experience & interaction flows: `docs/UX.md`
