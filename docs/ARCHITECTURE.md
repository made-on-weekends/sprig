# ARCHITECTURE.md

> Technical structure. How the pieces fit together. Not how to use the project (see AGENTS.md).

## High-level diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Electron App                        │
│                                                         │
│  ┌──────────────────────┐   ┌────────────────────────┐  │
│  │     Main Process     │   │    Renderer Process     │  │
│  │                      │   │                         │  │
│  │  main.js             │   │  index.html             │  │
│  │  ├── accounts.js     │◄──┤  ├── renderer.js        │  │
│  │  ├── tray.js         │IPC│  ├── styles.css         │  │
│  │  └── protocol.js     │──►│  └── preload.js         │  │
│  │                      │   │       (contextBridge)    │  │
│  └──────────────────────┘   └────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          BrowserView / WebContents               │   │
│  │  (one per account, partitioned sessions)         │   │
│  │                                                  │   │
│  │  Account 1 → web.whatsapp.com (partition:wa-1)   │   │
│  │  Account 2 → web.whatsapp.com (partition:wa-2)   │   │
│  │  Account 3 → messages.google.com (partition:gm-1)│   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ System Tray  │  │ Protocol     │                     │
│  │ (tray.js)    │  │ Handler      │                     │
│  │              │  │ (protocol.js)│                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   Linux Desktop        whatsapp://
   (notifications,       sms: links
    tray, .desktop)
```

## Layers

### Main process (`src/main/`)

The Node.js process that controls the Electron lifecycle, window management, and native OS integrations.

- **`main.js`** — App entry point. Creates the BrowserWindow, manages account webviews with isolated session partitions, handles IPC communication with the renderer, and coordinates all modules.
- **`accounts.js`** — Account management logic. Persists account configurations (service type, avatar, display name) to the local filesystem. Each account gets a unique Electron session partition for full cookie/storage isolation.
- **`tray.js`** — System tray icon and context menu. Displays a dynamic unread message counter badge on the tray icon.
- **`protocol.js`** — Registers and handles `whatsapp://` and `sms:` protocol URLs, routing them to the appropriate active account webview.

### Renderer process (`src/renderer/`)

A single renderer process that provides the application UI shell (sidebar, account tabs, settings).

- **`index.html`** — The main application window markup, including sidebar navigation, account management UI, and modals.
- **`renderer.js`** — UI logic. Manages account tab switching, avatar display, notifications settings, theme toggling, keyboard shortcuts, and all user-facing interactions.
- **`styles.css`** — Botanical dark/light themes inspired by GNOME/libadwaita. All styling lives in this single file.
- **`preload.js`** — Context bridge between main and renderer. Exposes a safe API surface via `contextBridge.exposeInMainWorld()`.

### Assets (`src/assets/`)

Application icons in multiple sizes (PNG: 64, 128, 256, full), SVG logo variants, and tray icon variants (standard, green, white, unread). Brand assets and design specifications live under `src/assets/brand/`.

## Cross-cutting concerns

- **Session isolation:** Each account uses a unique Electron session `partition` string, ensuring cookies, localStorage, and IndexedDB are fully separated between accounts.
- **IPC communication:** All main ↔ renderer communication goes through `ipcMain`/`ipcRenderer` handlers with `contextBridge` in `preload.js`. Node.js APIs are never exposed to the renderer.
- **Notifications:** Intercepted from the webview's `new-notification` events and re-dispatched as native OS notifications via Electron's Notification API.
- **Persistence:** Account configurations stored as JSON in the user's config directory (`~/.config/sprig/`). No database — flat files only.

## Deployment

- **Target:** Linux desktop only
- **Packaging:** electron-builder produces `.deb` (x64, arm64) and `.AppImage` (x64)
- **Distribution:** GitHub Releases
- **No CI/CD detected** — builds are run locally via `npm run build`
