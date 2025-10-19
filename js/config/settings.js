// =====================================================
// APPLICATION SETTINGS AND DEFAULTS
// =====================================================

import { THEMES, LANGUAGES } from './constants.js';

export const DEFAULT_SETTINGS = {
  theme: THEMES.LIGHT,
  language: 'de',
  cookiesAccepted: false,
  preferencesEnabled: true,
  analyticsEnabled: false,
};

export const DOM_SELECTORS = {
  // Navigation
  menuToggle: '#menuToggle',
  navigation: 'nav ul',
  backToTop: '#backToTop',
  progressBar: '#progressBar',

  // Forms
  contactForm: '#contactForm',
  nameInput: '#name',
  emailInput: '#email',
  messageInput: '#message',

  // Controls
  langSelect: '.lang-select',
  themeToggle: '.theme-toggle',

  // Sections
  projectsGrid: '.projects-grid',
  skillsChart: '#skills-chart',
  chartLegend: '#chartLegend',
  categoryList: '#categoryList',
  skillsCloud: '#skillsCloud',

  // Modals
  cookiesBanner: '#cookies-banner',
  privacyModal: '#privacy-modal',
  privacyFab: '#privacy-fab',
  modalClose: '.modal-close',

  // Cookies
  cookiesAccept: '#cookies-accept',
  cookiesReject: '#cookies-reject',
  cookiesLearnMore: '#cookies-learn-more',
  saveCookiesPrefs: '#save-cookies-preferences',
};

// Animation timing functions
export const EASING = {
  easeOutQuart: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
