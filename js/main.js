// =====================================================
// MAIN APPLICATION ENTRY POINT
// =====================================================

import { init, cleanup, AppState } from './core/app.js';
import { Debugger } from './utils/debug.js';
import { inject } from '@vercel/analytics';

Debugger.init();

// Initialize Vercel Analytics
inject();

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

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
