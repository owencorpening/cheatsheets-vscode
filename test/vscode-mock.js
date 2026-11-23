// Minimal stand-in for the `vscode` module so the extension can be tested with plain Node.
const Module = require('module');

const state = {
  config: { folder: '' },
  workspaceFolders: null,
  commands: {},
  executed: [],
  watchers: [],
  configListeners: [],
  provider: null
};

function emitter() {
  const fns = [];
  const ev = fn => { fns.push(fn); return { dispose() {} }; };
  ev.fire = (...a) => fns.forEach(f => f(...a));
  return ev;
}

const vscode = {
  Uri: { file: p => ({ fsPath: p, scheme: 'file' }) },
  RelativePattern: class { constructor(base, pattern) { this.base = base; this.pattern = pattern; } },
  window: {
    registerWebviewViewProvider(id, provider) { state.provider = provider; return { dispose() {} }; }
  },
  commands: {
    registerCommand(id, fn) { state.commands[id] = fn; return { dispose() {} }; },
    executeCommand(id, ...args) { state.executed.push([id, ...args]); return Promise.resolve(); }
  },
  workspace: {
    get workspaceFolders() { return state.workspaceFolders; },
    getConfiguration() { return { get: (k, d) => (k in state.config ? state.config[k] : d) }; },
    onDidChangeConfiguration(fn) { state.configListeners.push(fn); return { dispose() {} }; },
    createFileSystemWatcher(pattern) {
      const w = {
        pattern, disposed: false,
        onDidCreate: emitter(), onDidChange: emitter(), onDidDelete: emitter(),
        dispose() { this.disposed = true; }
      };
      state.watchers.push(w);
      return w;
    }
  }
};

const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'vscode') return vscode;
  return origLoad.call(this, request, ...rest);
};

// A fake webview view, as VS Code would pass to resolveWebviewView.
function fakeView() {
  const listeners = [];
  const view = {
    visible: true,
    posted: [],
    webview: {
      options: {},
      html: '',
      onDidReceiveMessage(fn) { listeners.push(fn); return { dispose() {} }; },
      postMessage(m) { view.posted.push(m); return Promise.resolve(true); }
    },
    send(msg) { listeners.forEach(fn => fn(msg)); }
  };
  return view;
}

module.exports = { vscode, state, fakeView };
