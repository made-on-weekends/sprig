# DECISIONS.md

> Settled architectural decisions. **Append-only.** Never edit or delete past entries (one exception: `Status` field of a superseded entry).
> If a decision is reversed, append a new entry with `Supersedes: #NNNN`.

## How to use this file

- Read before contradicting any documented pattern.
- New decisions are added with the next sequential number.
- Each entry has: number, title, date, status, context, decision, consequences, optional `Supersedes`.

## Status values

- `Proposed` — under discussion
- `Accepted` — current
- `Superseded by #NNNN` — replaced by a later decision (only the Status field can be edited on a superseded entry)
- `Deprecated` — no longer applies but no replacement

---

## 0001 — Project initialized

**Date:** 2026-09-25
**Status:** Accepted
**Context:** Project scaffolded with the project-ninja skill. Sprig is a native Electron desktop client for WhatsApp Web and Google Messages on Linux.
**Decision:** Establish AGENTS.md and docs/ as the source of truth for AI agent context. Cross-references owned per `references/cross-references.md` in the project-ninja skill.
**Consequences:** All AI tools (Claude Code, Antigravity, Codex, Cursor, Gemini CLI) read AGENTS.md. Decisions affecting the codebase land here.

---

## 0002 — Electron with vanilla JavaScript, no framework

**Date:** 2026-09-25
**Status:** Accepted
**Context:** Sprig wraps official web messaging endpoints in BrowserViews. The UI shell is a sidebar + tabbed account switcher. No complex state management, no routing, no SSR.
**Decision:** Use vanilla JavaScript with CommonJS modules. No React, Vue, Angular, or TypeScript. The app is small enough that a framework would add build complexity without proportional value.
**Consequences:** No build step for renderer code. No transpilation. Lower dependency count. Agents should not introduce a framework without a new DECISIONS entry.

---

## 0003 — Session partitioning for multi-account isolation

**Date:** 2026-09-25
**Status:** Accepted
**Context:** Users need to run multiple WhatsApp and Google Messages accounts simultaneously without session crosstalk.
**Decision:** Each account gets a unique Electron session `partition` string. This isolates cookies, localStorage, IndexedDB, and service workers per account.
**Consequences:** Adding a new account = creating a new partition. Deleting an account should clean up the partition data. Account data lives under `~/.config/sprig/`.

---

<!-- Add new decisions below. Use the next sequential number. -->
