// =====================================================
// APPLICATION CORE - MAIN INITIALIZATION AND STATE MANAGEMENT
// =====================================================

import { CONFIG, STORAGE_KEYS } from '../config/constants.js';
import { DOM_SELECTORS } from '../config/settings.js';
import * as Storage from '../utils/storage.js';
import * as Performance from './performance.js';

// Global application state
export const AppState = {
  currentLanguage: 'de',
  translations: {},
  skillsChart: null,
  skillsData: null,
  isInitialized: false,
  dom: {},
};

// Initialize the application
export async function init() {
  try {
    await loadResources();
    cacheDOMElements();
    await initializeModules();
    setupPerformanceMonitoring();

    AppState.isInitialized = true;
    console.log('🚀 Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    initializeFallback();
  }
}

// Load external resources
async function loadResources() {
  const requests = [
    fetchJSON(CONFIG.endpoints.translations),
    fetchJSON(CONFIG.endpoints.schema),
  ];

  const [translations, schema] = await Promise.all(requests);
  AppState.translations = translations;

  // Set structured data
  const script = document.getElementById('structured-data');
  if (script && schema) {
    script.textContent = JSON.stringify(schema);
  }
}

// Cache DOM elements for performance
export function cacheDOMElements() {
  Object.entries(DOM_SELECTORS).forEach(([key, selector]) => {
    AppState.dom[key] = document.querySelector(selector);
  });
}

// Initialize all application modules
async function initializeModules() {
  const modules = [
    () => import('../modules/theme.js').then((m) => m.Theme.init()),
    () => import('../modules/language.js').then((m) => m.Language.init()),
    () => import('../modules/skills.js').then((m) => m.Skills.loadData()),
    () => import('../modules/projects.js').then((m) => m.Projects.load()),
    () => import('../modules/form.js').then((m) => m.FormHandler.init()),
    () =>
      import('../modules/animations.js').then((m) => m.ScrollAnimations.init()),
    () => import('../modules/cookies.js').then((m) => m.CookiesManager.init()),
    () => import('../modules/modals.js').then((m) => m.Modals.init()),
  ];

  // Initialize core modules immediately
  await import('../modules/scroll-progress.js').then((m) =>
    m.ScrollProgress.init()
  );
  await import('../modules/back-to-top.js').then((m) => m.BackToTop.init());
  await import('../modules/mobile-menu.js').then((m) => m.MobileMenu.init());

  // Initialize feature modules with delay for better performance
  for (const moduleInit of modules) {
    try {
      await moduleInit();
    } catch (error) {
      console.error('Module initialization error:', error);
    }
  }
}

// Fallback initialization for critical functionality
function initializeFallback() {
  import('../modules/theme.js').then((m) => m.Theme.init());
  import('../modules/mobile-menu.js').then((m) => m.MobileMenu.init());
  import('../modules/scroll-progress.js').then((m) => m.ScrollProgress.init());
  import('../modules/back-to-top.js').then((m) => m.BackToTop.init());
}

// Performance monitoring
function setupPerformanceMonitoring() {
  if (isDevelopment()) {
    Performance.monitorFPS();
    Performance.monitorMemory();
  }
}

// Development environment check
export function isDevelopment() {
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

// Generic fetch helper
export async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Get DOM element from cache
export function getDOM(key) {
  return AppState.dom[key];
}

// Update application state
export function updateState(updates) {
  Object.assign(AppState, updates);
}

// Cleanup resources
export function cleanup() {
  if (AppState.skillsChart) {
    AppState.skillsChart.destroy();
    AppState.skillsChart = null;
  }
}
