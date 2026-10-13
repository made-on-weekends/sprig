# Sprig

A native desktop WhatsApp & Google Messages client for Linux desktops built with Electron.

## Features

- **Multi-Account Support**: Run multiple isolated WhatsApp and Google Messages sessions simultaneously.
- **Protocol Handlers**: Native integration for handling `whatsapp://` and `sms:` URI schemes.
- **Desktop Integration**: System tray support, unread badge counters, and background execution.
- **Botanical Dark & Light Themes**: Carefully crafted visual design system tailored for modern Linux desktops (including GNOME/libadwaita aesthetics).
- **Keyboard Shortcuts**: Rapid switching between active messaging sessions (`Ctrl+1` through `Ctrl+9`, `Ctrl+Tab`), zoom controls (`Ctrl+=`, `Ctrl+-`, `Ctrl+0`), and account management.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Development

Install dependencies:

```bash
npm install
```

Start the application in development mode:

```bash
npm run dev
```

Run in production preview mode:

```bash
npm start
```

## Packaging

Package for Linux distributions using `electron-builder`:

```bash
# Build Debian (.deb) package
npm run build:deb

# Build AppImage
npm run build:appimage

# Build all Linux targets
npm run build
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
