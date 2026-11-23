# CLAUDE.md — cheatsheets-vscode

## Status
- **State:** 0.2.0 is Marketplace-ready (icon, license, README, metadata, fixes).
- **Next action:** Owen creates the Marketplace publisher `owencorpening`, then publishes cheatsheets-0.2.0.vsix.
- **Last updated:** 2026-11-23

## What this is

VS Code extension that renders local markdown and HTML cheatsheets in the secondary sidebar. List panel on the left, content on the right. One keypress to show/hide.

- Supports `.md` and `.html` files from a user-configured folder
- Retains state when hidden — no re-loading on toggle
- Fully local, no internet required

## Install (dev)

```bash
npm test                  # node --test with a small vscode mock (test/vscode-mock.js)
npx @vscode/vsce package  # builds cheatsheets-<version>.vsix
code --install-extension cheatsheets-0.2.0.vsix
```

- Markdown is rendered by vendored marked (media/marked.cjs, MIT). Update it by copying lib/marked.cjs from the marked npm package.
- The icon is drawn in images/icon-source.svg (granite #4a4f54, brass #b8860b to #e9c46a) and exported to images/icon.png at 128px.
- README images must use absolute raw.githubusercontent.com URLs so they show on the Marketplace.

## Deploy

```bash
bash deploy.sh
```

## Repo
- owencorpening/cheatsheets-vscode
- First version April 2026
