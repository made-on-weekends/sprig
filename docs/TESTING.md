# TESTING.md

> Test strategy, verification checklists, and packaging commands for Sprig.

## Stack

- **Runtime Execution:** Electron v33.2 (`electron . --no-sandbox`)
- **Package & Distribution Verification:** electron-builder v25.1 (`.deb`, `.AppImage`)
- **Automated Test Runner:** None configured — verification is manual smoke testing and build validation

## Commands

```bash
# Run in development mode (DevTools enabled)
npm run dev

# Run in standard production mode
npm start

# Test package unpack without packaging
npm run pack

# Build all Linux distribution packages (.deb & .AppImage)
npm run build

# Build .deb package only
npm run build:deb

# Build AppImage package only
npm run build:appimage

# Install / update app native dependencies
npm run postinstall
```

*(Note: Commands are also documented in `AGENTS.md`. `AGENTS.md` owns the canonical command list; `TESTING.md` owns the strategy.)*

## Verification Strategy

Sprig wraps external web services (`web.whatsapp.com` and `messages.google.com`) inside isolated Electron browser views. Because upstream web interfaces evolve independently and require QR/SMS device pairing, verification focuses on:

1. **Client Infrastructure & IPC Integrity:** Validating that the Electron shell, protocol handlers, system tray, and renderer UI function correctly.
2. **Session Partition Isolation:** Verifying that cookies, local storage, and caches do not leak across account boundaries.
3. **Packaging Integrity:** Ensuring that generated `.deb` and `.AppImage` distribution bundles install and launch cleanly on Linux desktop environments.

## What to Test

**Do test:**
- **Session Isolation:** Ensure cookies and cache are strictly isolated between WhatsApp accounts (`persist:wa-<id>`) and Google Messages accounts (`persist:gm-<id>`).
- **Protocol Scheme Routing:** Verify that `whatsapp://` and `sms:` deep links correctly route to the active session without crashing.
- **System Tray Lifecycle:** Verify minimize-to-tray, window restore, unread badge counters, and context menu actions across desktop environments (GNOME, KDE, XFCE).
- **Account Management UI:** Test adding, editing, reordering, and deleting accounts, including service selection and custom avatar assignment.
- **Keyboard Navigation:** Validate shortcut handling (`Ctrl + 1..9`, `Ctrl + Tab`, `Ctrl + Shift + Tab`, `Ctrl + N`, zoom controls).
- **Device & Media Permissions:** Validate microphone and camera permission prompts for voice and video calls.
- **Linux Packaging:** Verify installation of `.deb` packages via `dpkg -i` and execution of `.AppImage` binaries.

**Don't test:**
- Upstream WhatsApp Web or Google Messages internal JavaScript, UI elements, or encryption protocols.
- Third-party Electron or Chromium runtime internals.

## Manual Smoke Test Checklist (Pre-Release)

1. **Clean Launch:** Start via `npm start` on a clean profile. Verify the welcome screen / empty state appears with no console errors.
2. **Add WhatsApp Account:** Create a WhatsApp profile. Verify QR code renders inside an isolated view.
3. **Add Google Messages Account:** Create a Google Messages profile. Verify Google Messages Web loads in its own view.
4. **Session Persistence:** Pair accounts, restart the application, and verify login state is preserved without re-authenticating.
5. **Protocol Handler Invocation:**
   - Execute `xdg-open "whatsapp://send?phone=1234567890"` and verify Sprig focuses and navigates.
   - Execute `xdg-open "sms:+1234567890?body=Hello"` and verify message dispatch.
6. **Tray Interaction:** Close window via `X` button; verify app minimizes to tray and restores on tray click.
7. **Packaging Build:** Run `npm run build` and ensure both `.deb` and `.AppImage` artifacts are created under `dist/` without errors.
