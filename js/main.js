// =====================================================
// MAIN APPLICATION ENTRY POINT
// =====================================================

import { init, cleanup, AppState } from './core/app.js';
import { ErrorHandler } from './utils/error-handler.js';
import { Debugger } from './utils/debug.js';

ErrorHandler.init();
Debugger.init();

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

console.log('🎯 Optimized JavaScript application loaded');
