# ARCHITECTURE.md

> Technical structure. How the pieces fit together. Not how to use the project (see AGENTS.md).

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Linux Desktop                         │
│   (System Tray, App Menu, Protocols: whatsapp://, sms:)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Electron Main Process                    │
│                     (src/main/main.js)                      │
│                                                             │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ Account Manager │  │ Protocol Handler │  │ Tray & Badges││
│  │  (accounts.js)  │  │  (protocol.js)   │  │ (tray.js)  │  │
│  └────────┬────────┘  └──────────────────┘  └────────────┘  │
│           │                                                 │
│           ▼                                                 │
│  ~/.config/sprig/accounts.json                              │
└──────────────┬──────────────────────────────────────────────┘
               │ IPC (contextBridge in preload.js)
               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Electron Renderer Window                   │
│             (src/renderer/index.html & styles.css)          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Navigation Sidebar & Account Switcher                 │  │
│  │ (renderer.js + brand tokens / theme.css)              │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│    ┌─────────────────────────┴─────────────────────────┐    │
│    │ Isolated WebViews / BrowserViews                  │    │
│    │ Partition: persist:account-whatsapp-<id>          │    │
│    │ Partition: persist:account-google-<id>            │    │
│    └─────────────┬─────────────────────────┬───────────┘    │
└──────────────────┼─────────────────────────┼────────────────┘
                   │ HTTPS                   │ HTTPS
                   ▼                         ▼
         web.whatsapp.com          messages.google.com
```

## Layers

### Client / Desktop Runtime
- **Runtime:** Electron v33.2 on Linux (x64 / arm64). Packaged via `electron-builder` as Debian package (`.deb`) and `AppImage`.
- **System Tray:** Managed via `src/main/tray.js` with tray icon rendering and unread badge count updates.
- **Protocol Handlers:** Registered in `src/main/protocol.js` for `whatsapp://` and `sms:` URI schemes.

### Main Process (`src/main/`)
- **`main.js`:** App lifecycle, command-line arguments (`--no-sandbox`), audio flags, window lifecycle, User-Agent spoofing, and IPC dispatch.
- **`accounts.js`:** Manages multi-account profiles (`AccountManager`), persistence (`JsonStore`), partition naming, and account CRUD operations.
- **`protocol.js`:** URI scheme registration, parsing, and dispatching protocol URLs to target account sessions.
- **`tray.js`:** System tray lifecycle, context menu, unread count badge overlay.

### Renderer Process (`src/renderer/`)
- **`preload.js`:** Secure `contextBridge` exposure of IPC methods (`sprigApi`). Enforces process boundary isolation.
- **`index.html`:** Shell UI with account sidebar, account modal, and container for messaging sessions.
- **`renderer.js`:** Client-side account switching, tab rendering, theme switching, keyboard shortcut handling.
- **`styles.css`:** Native Linux styling adhering to GNOME/libadwaita aesthetics, consuming `src/assets/brand/theme.css`.

### Data & Partition Isolation Layer
- **Account Metadata:** Stored locally in JSON format at `~/.config/sprig/accounts.json` (or platform equivalent).
- **Session Data:** Each account runs in an isolated partition (`persist:account-<id>`), ensuring complete isolation of cookies, cache, IndexedDB, and local storage between WhatsApp Web and Google Messages accounts.

### External Services
- Direct TLS/HTTPS connections to official web messaging endpoints:
  - WhatsApp Web: `https://web.whatsapp.com`
  - Google Messages: `https://messages.google.com/web`
- No telemetry, analytics, or intermediate relay servers.

## Request & URL Routing Lifecycle

```
1. Protocol link clicked (whatsapp://send?phone=... or sms:...)
2. OS invokes Sprig executable with URI argument
3. main.js intercepts URL via second-instance or open-url event
4. protocol.js validates and parses scheme & target payload
5. IPC transmits event to renderer window
6. Target account tab is focused and URL dispatched to its webview session
```

## Cross-cutting concerns

- **Security & Sandboxing:** Handled in `docs/SECURITY.md`. Disables remote module, enables context isolation.
- **Session Isolation:** Electron partitions (`persist:account-<id>`) isolate sessions completely.
- **Brand Identity:** Defined by upstream brand repository `/home/asif/Documents/brands/sprig/`.

## Patterns we use

- **Context Isolation:** Strictly enforce `contextIsolation: true` and `nodeIntegration: false`.
- **Explicit IPC Bridge:** Expose only minimum necessary methods via `contextBridge` in `preload.js`.
- **Partition Isolation:** Every messaging account receives a dedicated partition.

## Patterns we avoid

- **No Remote Module:** `remote` is deprecated and disabled.
- **No Third-Party Relay:** Never route messaging traffic through proxy or intermediary servers.
- **No Direct Node in Renderer:** Never enable `nodeIntegration` in renderer views.

## Deployment & Packaging

- **Targets:** Linux `.deb` and `AppImage` for `x64` and `arm64`.
- **Build tool:** `electron-builder` (`npm run build`, `npm run build:deb`, `npm run build:appimage`).
