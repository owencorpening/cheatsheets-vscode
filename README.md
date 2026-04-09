# Cheatsheets — VS Code Extension

View rendered markdown cheatsheets in the secondary sidebar (right side). List on the left, content on the right. One keypress to show/hide.

## Install

1. Copy this folder to your VS Code extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\cheatsheets`
   - **Mac/Linux**: `~/.vscode/extensions/cheatsheets`

2. Restart VS Code.

## Setup

1. Open Settings (`Ctrl+,`) and search for **cheatsheets**
2. Set **Cheatsheets: Folder** to the absolute path of your folder of `.md` files
   - Example: `C:\Users\you\notes\cheatsheets` or `/Users/you/notes/cheatsheets`
3. All `.md` files in that folder will appear automatically in the sidebar list

## Usage

- **Toggle panel**: `Ctrl+Shift+C` (Mac: `Cmd+Shift+C`)
- Click any file in the left list to view it rendered
- Add new `.md` files to the folder and run **Cheatsheets: Refresh** from the Command Palette

## Tips

- The panel retains its state when hidden — no re-loading when you toggle
- Files are sorted alphabetically — prefix with numbers to control order: `01-git.md`, `02-docker.md`
- No internet connection needed — everything runs locally
