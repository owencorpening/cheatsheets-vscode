const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { state, fakeView } = require('./vscode-mock');
const ext = require('../src/extension');

function setup(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cheatsheets-'));
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  state.config = { folder: dir };
  state.workspaceFolders = null;
  state.executed = [];
  state.watchers = [];
  state.configListeners = [];
  const context = { extensionUri: { fsPath: path.join(__dirname, '..') }, subscriptions: [] };
  ext.activate(context);
  const view = fakeView();
  state.provider.resolveWebviewView(view);
  return { dir, view, context };
}

test('lists .md and .html files in order and shows the first one', () => {
  const { view } = setup({ 'b.md': '# Bee', 'a.html': '<p>hi</p>', 'notes.txt': 'x' });
  assert.match(view.webview.html, /data-file="a\.html"/);
  assert.match(view.webview.html, /data-file="b\.md"/);
  assert.doesNotMatch(view.webview.html, /notes/);
  assert.ok(view.webview.html.indexOf('a.html') < view.webview.html.indexOf('b.md'));
  assert.match(view.webview.html, /<iframe srcdoc="<p>hi<\/p>"/);
});

test('renders markdown checkboxes', () => {
  const { view } = setup({ 'a.md': '- [ ] todo\n- [x] done\n' });
  assert.match(view.webview.html, /<input disabled="" type="checkbox"> todo/);
  assert.match(view.webview.html, /<input checked="" disabled="" type="checkbox"> done/);
});

test('renders markdown tables', () => {
  const { view } = setup({ 'a.md': '| Cmd | Does |\n|---|---|\n| `ls` | list |\n' });
  assert.match(view.webview.html, /<table>/);
  assert.match(view.webview.html, /<td><code>ls<\/code><\/td>/);
});

test('escapes file names and folder paths in the panel HTML', () => {
  const { view } = setup({ '<b>x.md': '# hi' });
  assert.match(view.webview.html, /&lt;b&gt;x/);
  assert.doesNotMatch(view.webview.html, /<b>x/);
});

test('loads a clicked file and keeps it open after a refresh', () => {
  const { view } = setup({ 'a.md': '# A', 'b.md': '# B' });
  view.send({ command: 'load', file: 'b.md' });
  assert.equal(view.posted.at(-1).file, 'b.md');
  assert.match(view.posted.at(-1).html, /<h1>B<\/h1>/);
  state.commands['cheatsheets.refresh']();
  assert.match(view.webview.html, /class="file-item active" data-file="b\.md"/);
});

test('ignores load requests for files outside the list', () => {
  const { view } = setup({ 'a.md': '# A' });
  view.send({ command: 'load', file: '../../etc/passwd' });
  assert.equal(view.posted.length, 0);
});

test('watches the folder and refreshes when a file is added', async () => {
  const { dir, view } = setup({ 'a.md': '# A' });
  assert.equal(state.watchers.length, 1);
  assert.equal(state.watchers[0].pattern.base.fsPath, dir);
  fs.writeFileSync(path.join(dir, 'c.md'), '# C');
  state.watchers[0].onDidCreate.fire();
  await new Promise(r => setTimeout(r, 400));
  assert.match(view.webview.html, /data-file="c\.md"/);
});

test('moves the watcher when the folder setting changes', () => {
  const { context } = setup({ 'a.md': '# A' });
  const other = fs.mkdtempSync(path.join(os.tmpdir(), 'cheatsheets-'));
  state.config = { folder: other };
  state.configListeners.forEach(fn => fn({ affectsConfiguration: k => k === 'cheatsheets.folder' }));
  assert.equal(state.watchers.length, 2);
  assert.ok(state.watchers[0].disposed);
  context.subscriptions.forEach(s => s.dispose && s.dispose());
});

test('falls back to the workspace folder when no folder is set', () => {
  const { dir } = setup({ 'a.md': '# A' });
  state.config = { folder: '' };
  state.workspaceFolders = [{ uri: { fsPath: dir } }];
  const view = fakeView();
  state.provider.resolveWebviewView(view);
  assert.match(view.webview.html, /data-file="a\.md"/);
});

test('shows a set-folder prompt when there is no folder at all', () => {
  setup({});
  state.config = { folder: '' };
  state.workspaceFolders = null;
  const view = fakeView();
  state.provider.resolveWebviewView(view);
  assert.match(view.webview.html, /No cheatsheets folder set/);
});

test('toggle shows the panel when hidden and closes the sidebar when shown', () => {
  const { view } = setup({ 'a.md': '# A' });
  view.visible = false;
  state.commands['cheatsheets.toggle']();
  assert.deepEqual(state.executed.at(-1), ['cheatsheets.panel.focus']);
  view.visible = true;
  state.commands['cheatsheets.toggle']();
  assert.deepEqual(state.executed.at(-1), ['workbench.action.closeAuxiliaryBar']);
});
