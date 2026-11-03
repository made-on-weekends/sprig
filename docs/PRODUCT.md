# PRODUCT.md

> What we're building, for whom, and what is explicitly NOT in scope.
> This is the canonical scope document. Agents must check here before adding features.

## Product

Sprig — a fast, lightweight, native WhatsApp & Google Messages desktop client for Linux with multi-account support, system tray integration, and privacy-first direct connections.

## Target user

Linux desktop users (GNOME, KDE, etc.) who need WhatsApp and/or Google Messages on their desktop without a browser tab. Power users who manage multiple accounts (personal, work) simultaneously.

## Anti-persona

- Mobile-only users — Sprig is a desktop companion, not a mobile app replacement.
- Users who need Windows or macOS clients — Sprig targets Linux only.
- Users who want a custom messaging protocol or server relay — Sprig is a web wrapper, not a full messaging client.

## Core value

Native multi-account WhatsApp & Google Messages on Linux with proper session isolation, system tray support, and desktop integration — without running a browser.

## In scope (current phase)

- Multi-account WhatsApp Web sessions with isolated partitions
- Multi-account Google Messages sessions with isolated partitions
- Desktop notifications with per-account sound controls
- System tray with unread counter badge
- Custom profile avatars (image or initials)
- Keyboard shortcuts for account switching, zoom, navigation
- Protocol URL handling (`whatsapp://`, `sms:`)
- Botanical dark/light themes (GNOME/libadwaita inspired)
- Linux packaging: .deb (x64, arm64) and AppImage (x64)

## Explicitly out of scope

- Windows or macOS support — reason: focuses on Linux desktop integration (libadwaita, system tray, .deb packaging)
- Mobile apps — reason: Sprig is a desktop client
- Custom messaging protocol / end-to-end encryption implementation — reason: relies on official web endpoints
- Backend server / API layer — reason: Sprig connects directly to `web.whatsapp.com` and `messages.google.com`
- Telegram, Signal, or other messaging services — reason: scope is limited to WhatsApp and Google Messages
- User-to-user messaging relay — reason: no intermediary server
- Bot automation or scraping — reason: compliance and security

## Non-goals

- Not a replacement for the official WhatsApp or Google Messages mobile apps
- Not optimized for low-bandwidth or offline messaging
- Not a platform for third-party messaging integrations or bots

## Success criteria

- Native Linux desktop integration with system tray and libadwaita styling
- Zero data leakage between isolated multi-account sessions
- Reliable protocol handler routing for `whatsapp://` and `sms:` URIs
