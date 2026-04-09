const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { marked } = require('../media/marked.min.js');

let panel = null;

function activate(context) {
  const provider = new CheatsheetViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('cheatsheets.panel', provider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cheatsheets.refresh', () => provider.refresh())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('cheatsheets.toggle', () => {
      vscode.commands.executeCommand('workbench.action.toggleAuxiliaryBar');
    })
  );

  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('cheatsheets.folder')) provider.refresh();
  });
}

class CheatsheetViewProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    this._render();

    webviewView.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'load') this._renderFile(msg.file);
      if (msg.command === 'openSettings') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'cheatsheets.folder');
      }
    });
  }

  refresh() {
    if (this._view) this._render();
  }

  _getFolder() {
    const config = vscode.workspace.getConfiguration('cheatsheets');
    const folder = config.get('folder', '').trim();
    if (folder) return folder;
    const ws = vscode.workspace.workspaceFolders;
    return ws && ws.length > 0 ? ws[0].uri.fsPath : null;
  }

  _getFiles(folder) {
    try {
      return fs.readdirSync(folder)
        .filter(f => f.endsWith('.md') || f.endsWith('.html'))
        .sort();
    } catch {
      return [];
    }
  }

  _render() {
    const folder = this._getFolder();
    const files = folder ? this._getFiles(folder) : [];
    const firstFile = files.length > 0 ? path.join(folder, files[0]) : null;
    const firstContent = firstFile ? this._parseFile(firstFile) : '';

    this._view.webview.html = this._getHtml(folder, files, files[0] || '', firstContent);
  }

  _renderFile(filename) {
    const folder = this._getFolder();
    if (!folder || !filename) return;
    const filepath = path.join(folder, filename);
    const content = this._parseFile(filepath);
    this._view.webview.postMessage({ command: 'content', html: content, file: filename });
  }

  _parseFile(filepath) {
    try {
      const raw = fs.readFileSync(filepath, 'utf8');
      if (filepath.endsWith('.html')) return raw;
      return marked.parse(raw);
    } catch {
      return '<p style="color:var(--vscode-errorForeground)">Could not read file.</p>';
    }
  }

  _getHtml(folder, files, activeFile, initialContent) {
    const fileListItems = files.map(f => `
      <li class="file-item ${f === activeFile ? 'active' : ''}" data-file="${f}" title="${f}">
        ${f.replace(/\.(md|html)$/, '')}
      </li>`).join('');

    const noFolderMsg = !folder
      ? `<div class="empty"><p>No folder set.</p><button onclick="openSettings()">Set cheatsheets folder</button></div>`
      : files.length === 0
      ? `<div class="empty"><p>No .md or .html files found in:<br><code>${folder}</code></p><button onclick="openSettings()">Change folder</button></div>`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-sideBar-background);
    height: 100vh;
    display: flex;
    overflow: hidden;
  }
  #sidebar {
    width: 160px;
    min-width: 120px;
    max-width: 200px;
    background: var(--vscode-sideBar-background);
    border-right: 1px solid var(--vscode-sideBarSectionHeader-border, #444);
    overflow-y: auto;
    flex-shrink: 0;
  }
  #sidebar ul { list-style: none; padding: 4px 0; }
  .file-item {
    padding: 6px 10px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-left: 2px solid transparent;
    color: var(--vscode-foreground);
    opacity: 0.75;
  }
  .file-item:hover { background: var(--vscode-list-hoverBackground); opacity: 1; }
  .file-item.active {
    background: var(--vscode-list-activeSelectionBackground);
    color: var(--vscode-list-activeSelectionForeground);
    border-left-color: var(--vscode-focusBorder);
    opacity: 1;
  }
  #content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    line-height: 1.6;
  }
  #content h1 { font-size: 1.3em; margin: 0.8em 0 0.4em; }
  #content h2 { font-size: 1.1em; margin: 0.8em 0 0.4em; border-bottom: 1px solid var(--vscode-widget-border); padding-bottom: 2px; }
  #content h3 { font-size: 1em; margin: 0.6em 0 0.3em; }
  #content p { margin: 0.4em 0; }
  #content ul, #content ol { padding-left: 1.4em; margin: 0.4em 0; }
  #content li { margin: 0.2em 0; }
  #content code {
    font-family: var(--vscode-editor-font-family);
    font-size: 0.88em;
    background: var(--vscode-textCodeBlock-background);
    padding: 1px 5px;
    border-radius: 3px;
  }
  #content pre {
    background: var(--vscode-textCodeBlock-background);
    padding: 10px 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 0.6em 0;
  }
  #content pre code { background: none; padding: 0; }
  #content table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9em;
    margin: 0.6em 0;
  }
  #content th, #content td {
    border: 1px solid var(--vscode-widget-border);
    padding: 4px 8px;
    text-align: left;
  }
  #content th { background: var(--vscode-textCodeBlock-background); font-weight: 600; }
  #content a { color: var(--vscode-textLink-foreground); }
  #content blockquote {
    border-left: 3px solid var(--vscode-focusBorder);
    padding-left: 10px;
    margin: 0.5em 0;
    opacity: 0.85;
  }
  #content hr { border: none; border-top: 1px solid var(--vscode-widget-border); margin: 0.8em 0; }
  .empty {
    padding: 20px;
    text-align: center;
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    line-height: 1.8;
  }
  .empty button {
    margin-top: 10px;
    padding: 4px 10px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
  }
  .empty code { font-size: 11px; word-break: break-all; }
</style>
</head>
<body>
  ${files.length > 0 ? `<div id="sidebar"><ul>${fileListItems}</ul></div>` : ''}
  <div id="content">${noFolderMsg || initialContent}</div>
<script>
  const vscode = acquireVsCodeApi();
  let active = ${JSON.stringify(activeFile)};

  document.querySelectorAll('.file-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.file-item').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      active = el.dataset.file;
      vscode.postMessage({ command: 'load', file: active });
    });
  });

  window.addEventListener('message', e => {
    const msg = e.data;
    if (msg.command === 'content') {
      document.getElementById('content').innerHTML = msg.html;
    }
  });

  function openSettings() {
    vscode.postMessage({ command: 'openSettings' });
  }
</script>
</body>
</html>`;
  }
}

function deactivate() {}
module.exports = { activate, deactivate };
