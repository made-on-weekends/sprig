# AGENTS.md

> Briefing packet for AI coding agents (Claude Code, Antigravity, Codex, Cursor, Gemini CLI, etc.).
> Humans should read README.md instead.

## Rules of engagement

These rules are the agent's first read every session. Keep this list short — each one absolute.

1. **Do** follow conventions documented in this file and the relevant `docs/` file. **Don't** invent new conventions silently.
2. **Do** check `docs/DECISIONS.md` before contradicting any documented pattern.
3. **Do** ask before expanding scope beyond `docs/PRODUCT.md`.
4. **Don't** edit files in the do-not-touch zones below.
5. **Don't** introduce a new third-party dependency without a `docs/DECISIONS.md` entry.
6. **Do** enforce and conform to `.editorconfig` formatting rules (2-space indentation, LF line endings, UTF-8 charset, trailing whitespace trimming) across all code and documentation.
7. **Do** test in both `npm start` and `npm run dev` modes before declaring work complete.
8. **Don't** modify Electron's security model (sandbox settings, protocol handlers) without explicit approval and a `docs/DECISIONS.md` entry.

## Stack

- **One-Line Summary:** Linux desktop client built with Electron and vanilla JavaScript, running WhatsApp Web and Google Messages in isolated partitions.
- **Language:** JavaScript (Node.js, CommonJS, no TypeScript)
- **Framework:** Electron v33.2
- **Backend:** None — desktop-only client wrapping official web endpoints
- **Database:** None — account data stored via Electron's session partitions and local filesystem (`~/.config/sprig/`)
- **Hosting / runtime:** Linux desktop (deb, AppImage)
- **Package manager:** npm — use `npm ci` for clean installs
- **Node version:** v18+ (as documented in README)
- **Build tool:** electron-builder v25.1

## Commands

```bash
# Run (standard mode)
npm start

# Run (development mode — DevTools enabled)
npm run dev

# Build all Linux packages (.deb & .AppImage)
npm run build

# Build .deb only
npm run build:deb

# Build AppImage only
npm run build:appimage

# Unpack without packaging (test build)
npm run pack

# Install dependencies (clean)
npm ci
```

## Conventions

- **Code Style & Formatting (.editorconfig):** Strict adherence to `.editorconfig`. All files use 2-space indentation, LF line endings, UTF-8 charset, trimmed trailing whitespace, and final newlines.
- **No linter/formatter configured:** There is no ESLint, Prettier, or Biome in this project. Code style is enforced by `.editorconfig` and convention only.
- **Design Specifications:** All design files (including `docs/DESIGN.md` and its derived/override mirror files) must strictly adhere to the Google Labs `design.md` format specification (combining machine-readable YAML frontmatter with standard markdown sections).
- **File naming:** lowercase with hyphens for assets, camelCase not used in filenames.
- **Module style:** CommonJS (`require`/`module.exports`). No ES modules.
- **Process separation:** Main process code in `src/main/`, renderer process code in `src/renderer/`, shared assets in `src/assets/`.
- **IPC pattern:** Main ↔ renderer communication via `ipcMain`/`ipcRenderer` with `contextBridge` in `preload.js`.
- **No external APIs:** Sprig connects directly to `web.whatsapp.com` and `messages.google.com`. There is no backend, no intermediary server, no telemetry or third-party tracking.

## Project-specific rules

- All account session data is isolated via Electron's `partition` feature. Never share partitions between accounts.
- Protocol handlers (`whatsapp://`, `sms:`) are registered in `src/main/protocol.js` — always route through the protocol module, never handle URLs directly in main.js.
- Tray icon management lives in `src/main/tray.js` — never manipulate the system tray from the renderer process.
- The renderer's `preload.js` is the only bridge between main and renderer. Never expose Node.js APIs directly to the renderer.

## Do-not-touch zones

- `node_modules/` — managed by npm
- `dist/` — electron-builder output, never edit by hand
- `package-lock.json` — regenerate via `npm install`, never edit manually
- `build/icons/` — build resources for electron-builder, do not reorganize
- `src/assets/*.png` and `src/assets/*.svg` — icon assets, do not regenerate without explicit approval

## Where to look

- Architecture overview: `docs/ARCHITECTURE.md`
- Settled decisions: `docs/DECISIONS.md` (read before contradicting any pattern)
- Product scope: `docs/PRODUCT.md` (read before adding features)
- Security policy & hard rules: `SECURITY.md` (root) and `docs/SECURITY.md`
- Test strategy & checklists: `docs/TESTING.md`
- Design system & tokens: `docs/DESIGN.md`
- Brand identity & voice: `docs/BRAND.md`
- User experience & interaction flows: `docs/UX.md`
