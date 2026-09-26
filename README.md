# Sprig

A fast, lightweight, native WhatsApp & Google Messages desktop client for Linux with isolated multi-account support.

<p align="center">
  <img src="src/assets/brand/hicolor/128.png" alt="Sprig Logo" width="96" height="96">
</p>

Sprig brings WhatsApp Web and Google Messages to Linux desktops with seamless desktop integration, system tray support, and isolated sessions for personal and work accounts.

---

## Features

- **Multi-Account Support**: Run multiple WhatsApp and Google Messages accounts simultaneously in isolated session partitions.
- **System Tray Integration**: Native tray icon with unread message badges and quick minimize/restore.
- **Protocol Handler**: Opens `whatsapp://` and `sms:` URI scheme links directly in the application.
- **Privacy First**: Direct connection to official web services (`web.whatsapp.com` and `messages.google.com`); no intermediary servers and zero telemetry.
- **Modern Linux UX**: Dark, light, and system (libadwaita) themes, zoom controls, spell check, and keyboard shortcuts.
- **Packaging Options**: Ready to build as `.deb` and `.AppImage` packages.

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Setup

```bash
# Clone the repository
git clone https://github.com/made-on-weekends/sprig.git
cd sprig

# Install dependencies
npm ci
```

---

## Running the Application

```bash
# Start the application
npm start

# Run in development mode
npm run dev
```

---

## Building Packages

Sprig uses `electron-builder` to produce Linux packages:

```bash
# Build both deb and AppImage packages
npm run build

# Build standalone Debian package (.deb)
npm run build:deb

# Build standalone AppImage package (.AppImage)
npm run build:appimage
```

Artifacts will be output to the `dist/` directory.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + 1` .. `9` | Switch to account 1 through 9 |
| `Ctrl + Tab` | Cycle to next account |
| `Ctrl + Shift + Tab` | Cycle to previous account |
| `Ctrl + N` | Add new account |
| `Ctrl + +` / `Ctrl + =` | Zoom in |
| `Ctrl + -` | Zoom out |
| `Ctrl + 0` | Reset zoom |
| `Ctrl + Shift + I` / `F12` | Toggle Developer Tools |
| `Ctrl + Q` | Quit application |
| `Esc` | Close open modal or dialog |

---

## 📚 Documentation

For technical details, project guidelines, and development context:

- 🤖 **For AI Coding Agents:** Refer to [AGENTS.md](AGENTS.md) for development commands, project conventions, and agent instructions.
- 🏗️ **Architecture:** See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the system structure, Electron process model, and data flows.
- ⚖️ **Decision Log:** See [docs/DECISIONS.md](docs/DECISIONS.md) for architectural decisions, rationale, and established conventions.
- 🎯 **Product Scope:** See [docs/PRODUCT.md](docs/PRODUCT.md) for product goals, supported features, and what's out of scope.
- 🛡️ **Security Guidelines:** See [SECURITY.md](SECURITY.md) for vulnerability disclosure and [docs/SECURITY.md](docs/SECURITY.md) for technical security rules and threat model.
- 🧪 **Testing Strategy:** See [docs/TESTING.md](docs/TESTING.md) for verification checklists and build verification commands.
- 🎨 **Design System:** See [docs/DESIGN.md](docs/DESIGN.md) for design tokens, typography, and color palette.
- 🏷️ **Brand Identity:** See [docs/BRAND.md](docs/BRAND.md) for identity rules, trademark safety, and brand assets.
- 📱 **User Experience & Flows:** See [docs/UX.md](docs/UX.md) for user flows, behavior rules, and keyboard navigation.

---

## 🐛 Issues & Troubleshooting

Found a bug or have a feature request? Read the [Issue Reporting Guide](REPORTING.md) before submitting an issue on our [GitHub Issues](https://github.com/made-on-weekends/sprig/issues) page.

---

## 🤝 Contributing

Contributions are welcome! Read the [Contribution Guide](CONTRIBUTING.md) for development setup, contribution conventions, and the pull request process.

---

## ⭐ Support Us

If Sprig is useful to you:
- ⭐ **Star this repository** to help others discover the project.
- 📣 **Spread the word** by sharing it with your network.
- ☕ **Support Our Work** — [Donate](https://asifiqbal.rocks/donation?utm_source=sprig&utm_medium=github_readme&utm_campaign=readme&ref=sprig-readme) to help us maintain and grow our open-source projects.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

*Disclaimer: Sprig is an independent open-source project. WhatsApp is a trademark of Meta Platforms, Inc. Google Messages is a trademark of Google LLC. Sprig is not affiliated with or endorsed by Meta Platforms, Inc. or Google LLC.*
