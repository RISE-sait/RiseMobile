// Polyfill for web platform only
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // This is the web platform
  if (typeof global !== 'undefined' && !global.tslib) {
    try {
      const tslib = require('tslib');
      // Ensure tslib is properly exposed for web environments
      if (tslib && typeof tslib.__extends === 'function') {
        global.tslib = tslib;
      }
    } catch (e) {
      // Silent fail on mobile platforms
    }
  }
}
