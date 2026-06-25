if (typeof require.resolveWeak !== 'function') {
  require.resolveWeak = () => '';
}

if (typeof globalThis.require === 'undefined') {
  globalThis.require = require;
}

if (typeof globalThis.require.resolveWeak !== 'function') {
  globalThis.require.resolveWeak = require.resolveWeak;
}
