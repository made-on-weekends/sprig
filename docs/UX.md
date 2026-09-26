# UX.md

> User flows and behavior rules for Sprig (Native Multi-Messenger Desktop for Linux).
> Visual styling rules in `docs/DESIGN.md`. System architecture in `docs/ARCHITECTURE.md`.

## Core Flows

### Account Management
- **Add Account (`Ctrl+N`):** Opens modal with service selection (WhatsApp Web or Google Messages Web), profile naming, and optional avatar image upload. Creates an isolated Electron partition (`persist:wa-<id>` or `persist:gm-<id>`).
- **Switch Account (`Ctrl+1..9` / `Ctrl+Tab`):** Instantly switches focus to the corresponding account tab/view. Preserves unread state badges and service indicators on inactive account tabs.
- **Session Persistence:** Automatically reloads saved session partition state on application launch, maintaining login state across app restarts without re-pairing.
- **Custom Avatars & Badges:** Users can upload custom images or generate initials for profiles. Service badges (green for WhatsApp, blue for Google Messages) indicate service type at avatar bottom-right.

### Protocol Handler Flow (`whatsapp://` and `sms:`)
- Clicking a `whatsapp://...` or `sms:...` deep link from a browser or terminal triggers the Sprig Main process URL handler.
- If the application is minimized or hidden in the system tray, the window un-minimizes, restores focus to the active or relevant account, and routes to the target phone number / chat.

### System Tray & Minimization Flow
- Closing the window via the titlebar close button (`X`) or `Ctrl+W` hides the window to the Linux system tray (GNOME, KDE, XFCE).
- Clicking or selecting "Show Sprig" from the tray context menu restores window visibility and restores previous window dimensions and position.
- Unread badge counters update dynamically on the tray icon when unread messages arrive.

## Always / Never (Behavior Rules)

**Always:**
- Always maintain distinct, isolated session partitions per account and service to prevent cross-account credential or data mixing.
- Always handle system device access requests (Microphone/Camera) with clear native OS prompts before video/audio calls.
- Always preserve window position, dimensions, and active account tab index across app restarts.
- Always cleanly minimize to the system tray on window close unless explicitly quit via the Tray Menu or `Ctrl+Q`.
- Always show a confirmation dialog before deleting an account session.

**Never:**
- Never block application startup if an individual session partition encounters a network disconnect.
- Never wipe session cookies or cache unless explicitly requested via Account Settings -> Remove Account / Clear Cache.
- Never expose raw webview browser chrome or external navigation controls to the user.
- Never silently fail an account addition or configuration save.

## Irreversible Action Policy

- **Account Removal:** Deleting an account profile permanently unlinks the partition and erases associated local session credentials (`~/.config/sprig/Partitions/`). Requires explicit confirmation modal stating that re-pairing via QR/SMS will be required.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + 1` .. `Ctrl + 9` | Switch directly to account 1 through 9 |
| `Ctrl + Tab` | Cycle to next account |
| `Ctrl + Shift + Tab` | Cycle to previous account |
| `Ctrl + N` | Open modal to add a new account |
| `Ctrl + +` / `Ctrl + =` | Zoom in active view |
| `Ctrl + -` | Zoom out active view |
| `Ctrl + 0` | Reset zoom to default |
| `Ctrl + Shift + I` / `F12` | Toggle Developer Tools |
| `Ctrl + Q` | Quit application completely |
| `Esc` | Close open modal or dialog |

## Accessibility & System Integration

- Native Linux desktop notifications (`libnotify`) with unread counters and account sender indicators.
- High-contrast tray icon supporting both light and dark panel themes.
- Clear keyboard focus indicators across sidebar tabs and modal controls.
