# Sprig

Sprig is an unofficial, native WhatsApp and Google Messages desktop client for Linux. Run multiple WhatsApp and Google Messages accounts simultaneously in isolated sessions, handle `whatsapp://` and `sms:` protocol links natively, and integrate seamlessly with your desktop tray and notifications.

## Features

- **Multi-Account Support**: Manage multiple WhatsApp and Google Messages accounts simultaneously, each running in an isolated session partition.
- **Protocol Handler Integration**: Natively handles `whatsapp://` and `sms:` links.
- **Linux Desktop Integration**: System tray indicator with unread counters, desktop notifications, autostart support, and libadwaita-inspired styling.
- **Botanical Dark & Light Themes**: Carefully crafted visual design system tailored for modern Linux desktops (including GNOME/libadwaita aesthetics).
- **Keyboard Shortcuts**: Rapid switching between active messaging sessions (`Ctrl+1` through `Ctrl+9`, `Ctrl+Tab`), zoom controls (`Ctrl+=`, `Ctrl+-`, `Ctrl+0`), and account management.
- **Privacy & Security**: Zero telemetry. Session partitions keep cookies and local cache separate and secure.

## Development

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/made-on-weekends/sprig.git
cd sprig

# Install dependencies
npm ci
```

### Running Locally

```bash
# Start in development mode
npm run dev

# Start standard application
npm start
```

## Packaging & Building

Build Linux packages using `electron-builder`:

```bash
# Package directory without installer
npm run pack

# Build Linux targets
npm run build

# Build standalone Debian package (.deb)
npm run build:deb

# Build standalone AppImage (.AppImage)
npm run build:appimage
```

## 📚 Documentation

For technical details, project guidelines, and development context:

- 🤖 **For AI Coding Agents:** Refer to [AGENTS.md](AGENTS.md) for development commands, project conventions, and agent instructions.
- 🏗️ **Architecture:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system structure, major components, and data flows.
- ⚖️ **Decision Log:** See [docs/DECISIONS.md](docs/DECISIONS.md) for architectural decisions, rationale, and established conventions.
- 🎯 **Product Scope:** See [docs/PRODUCT.md](docs/PRODUCT.md) for product goals, supported features, and planned work.
- 🛡️ **Security Architecture:** See [docs/SECURITY.md](docs/SECURITY.md) for technical threat models and hard security rules.
- 🧪 **Testing Strategy:** See [docs/TESTING.md](docs/TESTING.md) for test coverage, commands, and verification procedures.
- 🎨 **Design System:** See [docs/DESIGN.md](docs/DESIGN.md) for design tokens and interface specifications.
- 🌿 **Brand Identity:** See [docs/BRAND.md](docs/BRAND.md) for voice, naming, and brand safety guidelines.
- 🧭 **UX Guidelines:** See [docs/UX.md](docs/UX.md) for interaction flows and keyboard shortcuts.

## 🐛 Issues & Troubleshooting

Found a bug or have a feature request?
- Read the [Issue Reporting Guide](REPORTING.md) before submitting an issue.
- Report issues or feature requests on the [GitHub Issues](https://github.com/made-on-weekends/sprig/issues) tracker.
- For security vulnerabilities, follow the responsible disclosure process in [SECURITY.md](SECURITY.md).

## 🤝 Contributing

Contributions are welcome! Read the [Contribution Guide](CONTRIBUTING.md) for development setup, contribution conventions, and the pull request process.

## ⭐ Support Us

If Sprig is useful to you:
- ⭐ **Star this repository** to help others discover the project.
- 📣 **Spread the word** by sharing it with your network.
- ☕ **Support Our Work** — [Donate](https://asifiqbal.rocks/donation?utm_source=sprig&utm_medium=github_readme&utm_campaign=readme&ref=sprig-readme) to help us maintain and grow our open-source projects.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Disclaimer: Sprig is an independent open-source project and is not affiliated with, authorized, maintained, sponsored, or endorsed by WhatsApp, Meta Platforms, Inc., or Google LLC.*
