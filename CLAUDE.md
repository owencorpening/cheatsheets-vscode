# CLAUDE.md — cheatsheets-vscode

## Status
- **State:** Shipped
- **Next action:** Publish to the VS Code Marketplace (package is built: cheatsheets-0.1.0.vsix).
- **Last updated:** 2026-04-30

## What this is

VS Code extension that renders local markdown and HTML cheatsheets in the secondary sidebar. List panel on the left, content on the right. One keypress to show/hide.

- Supports `.md` and `.html` files from a user-configured folder
- Retains state when hidden — no re-loading on toggle
- Fully local, no internet required

## Install (dev)

```bash
# Build .vsix
vsce package

# Install locally
code --install-extension cheatsheets-0.1.0.vsix
```

## Deploy

```bash
bash deploy.sh
```

## Repo
- owencorpening/cheatsheets-vscode
- Shipped April 2025
