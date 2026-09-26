# SECURITY.md

> Technical security architecture, threat model, and engineering hard rules for Sprig (Electron desktop client for WhatsApp Web and Google Messages on Linux). For public vulnerability disclosure policy and supported versions, see [SECURITY.md](../SECURITY.md).

## Hard Rules

These rules are **absolute**. Violating any of them requires a `DECISIONS.md` entry that explicitly supersedes the rule, with security review. The rules listed here are not the project's complete security posture — they are the floor below which behavior is considered a defect.

1. **Never** enable `nodeIntegration` or disable `contextIsolation` in WebContents or BrowserView instances loading external web content (`web.whatsapp.com` or `messages.google.com`).
2. **Never** share or leak Electron session partitions (`persist:wa-<id>` or `persist:gm-<id>`) between different user accounts or services.
3. **Never** execute un-sanitized commands or open un-validated URLs passed via `whatsapp://` or `sms:` scheme handlers.
4. **Never** log sensitive user data, QR codes, auth session tokens, or personal message payload contents to stdout/stderr or log files.
5. **Always** scope WebRTC camera/microphone device access requests using explicit Electron `session.setPermissionRequestHandler` callbacks.
6. **Never** disable Chromium security flags (`webSecurity`, sandbox) for convenience when handling external web content.
7. **Never** expose Node.js runtime APIs or arbitrary filesystem access directly to the renderer process.

Hard rule violations stop the agent in CONSULT mode. They cannot be "worked around" without a formal decision.

## Session Partition Isolation

- **Partition Naming:** `persist:wa-<id>` per configured WhatsApp account and `persist:gm-<id>` per configured Google Messages account.
- **Data Isolation:** Cookies, IndexedDB, LocalStorage, and web cache are strictly isolated within each Electron partition on the local filesystem (`~/.config/sprig/Partitions/`).
- **Account Boundaries:** Each account runs in its own BrowserView / WebContents with partition-specific storage. Partitions must never be shared across accounts.

## Protocol Handler Security (`whatsapp://`, `sms:`)

- All `whatsapp://` and `sms:` deep links are passed to the Electron Main process protocol handler (`src/main/protocol.js`).
- URL parsing validates query parameters and target phone numbers/chat IDs before navigating or dispatching events.
- Path traversal and arbitrary shell execution attempts via custom scheme payloads are rejected.
- Navigation is strictly confined to official WhatsApp Web and Google Messages origin URLs.

## Device Permissions & WebRTC

- **Supported Permissions:** `media` (microphone, camera for voice/video calls), `notifications` (desktop alerts), `audioCapture`, `clipboard-read`, `clipboard-sanitized-write`, `persistent-storage`.
- **Enforcement:** Electron permission handler checks origins explicitly against `https://web.whatsapp.com` and `https://messages.google.com`. Unrecognized origins or unauthorized permission requests are denied by default.

## IPC Boundary Security

- Communication between Main and Renderer processes occurs strictly via `ipcMain` and `ipcRenderer` using `contextBridge` in `src/renderer/preload.js`.
- Renderer scripts never have direct access to Node.js built-ins (`fs`, `child_process`, `os`, `net`).
- All incoming IPC message payloads are validated for schema and type before processing in the Main process.

## Threat Model — Top Concerns

1. **Cross-Session Leakage:** Prevent Account A's credentials, cookies, or chat sessions from leaking into Account B's partition.
   - *Mitigation:* Explicit partition keys (`persist:<service>-<id>`) and independent WebContents instances.
2. **Malicious Protocol Handling:** Malformed or hostile `whatsapp://` or `sms:` URLs injected from external applications or web browsers.
   - *Mitigation:* Strict URL sanitization and regex validation in `src/main/protocol.js` before dispatching.
3. **Over-privileged IPC Exposure:** Remote code execution via exposed Node APIs in renderer or loaded webviews.
   - *Mitigation:* `contextIsolation: true`, `nodeIntegration: false`, sandboxed execution, and explicit white-listed `contextBridge` methods.

## Incident Response

1. **Detect** — Identify issue via vulnerability report, automated alert, or user report.
2. **Contain** — Revoke affected release build or patch Main process IPC/protocol handler immediately.
3. **Notify** — Announce security advisory and recommend updating to patched version.
4. **Investigate** — Perform root cause analysis and audit affected session handling code.
5. **Postmortem** — Document remediation details and decisions in `docs/DECISIONS.md`.

## Reporting Vulnerabilities

Public vulnerability disclosure instructions, contact email, and supported versions table are maintained in root [SECURITY.md](../SECURITY.md). Never direct security vulnerability reports to public issue trackers.
