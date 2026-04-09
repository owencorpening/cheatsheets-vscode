# Cheatsheets — VS Code Extension

Keep your reference docs visible while you code. Renders markdown and HTML cheatsheets in the secondary sidebar — list on the left, content on the right. One keypress to show/hide.

![Cheatsheets panel screenshot](images/screenshot.png)

## Features

- **Markdown** — write cheatsheets fast, like notes
- **HTML** — fully styled reference docs with custom layouts, colors, and scripts
- **Auto-loads** all `.md` and `.html` files from a folder you point it at
- **Retains state** when hidden — no re-loading when you toggle
- **Fully local** — no internet connection needed

## Install

1. Copy this folder to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\cheatsheets`
   - **Mac/Linux**: `~/.vscode/extensions/cheatsheets`

2. Restart VS Code.

## Setup

1. Open Settings (`Ctrl+,`) and search for **cheatsheets**
2. Set **Cheatsheets: Folder** to the absolute path of your cheatsheets folder
   - Example: `C:\Users\you\cheatsheets` or `/home/you/cheatsheets`
3. All `.md` and `.html` files in that folder appear automatically in the list

## Usage

- **Toggle panel**: `Ctrl+Shift+C` (Mac: `Cmd+Shift+C`)
- Click any file in the left list to view it rendered
- Add new files to the folder and run **Cheatsheets: Refresh** from the Command Palette
- Right-click any `.md` file in the editor for quick access to the built-in preview

## Cheatsheet formats

**Markdown** is the fastest way to write a cheatsheet — plain text, renders cleanly, easy to maintain.

**HTML** gives you full control: multi-column layouts, color-coded sections, collapsible blocks, custom fonts, embedded CSS and scripts. If you want your cheatsheet to look like a real reference document, write it in HTML.

Both formats live in the same folder and appear side by side in the list.

## Tips

- Files are sorted alphabetically — prefix with numbers to control order: `01-git.md`, `02-docker.md`
- HTML files have full script and style support — treat them as self-contained web pages
- The panel remembers its position across sessions once docked in the secondary sidebar
