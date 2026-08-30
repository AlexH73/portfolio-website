// =====================================================
// MAIN APPLICATION ENTRY POINT
// =====================================================

import { init, cleanup, AppState } from './core/app.js';
import { Debugger } from './utils/debug.js';

Debugger.init();

if (import.meta.env?.PROD) {
  import('./modules/analytics.js').then(({ Analytics }) => Analytics.init());
}

function updateCurrentYear() {
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCurrentYear();
  init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Expose app state for debugging in development
if (import.meta.env?.MODE === 'development') {
  window.AppState = AppState;
}
