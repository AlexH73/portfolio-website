// =====================================================
// APPLICATION CONSTANTS AND CONFIGURATION
// =====================================================

export const CONFIG = {
  // API endpoints
  endpoints: {
    formspree: 'https://formspree.io/f/xyzdlrvd',
    translations: 'js/data/translations.json',
    projects: 'js/data/projects.json',
    skills: 'js/data/skills.json',
    schema: 'js/data/schema.json',
  },

  // reCAPTCHA
  recaptcha: {
    siteKey: '6LeKX8grAAAAAFr3OMmNKYUKl-br5q9HlWq2eJG1',
    action: 'submit',
  },

  // Chart configurations
  charts: {
    skills: {
      type: 'radar',
      colors: {
        primary: 'rgba(99, 102, 241, 0.2)',
        border: 'rgba(99, 102, 241, 0.8)',
        point: 'rgba(99, 102, 241, 1)',
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart',
      },
    },
  },

  // Animation delays
  animations: {
    scrollThreshold: 0.1,
    staggerDelay: 100,
    initialDelay: 100,
  },

  // Cookies
  cookies: {
    expirationDays: 1,
    decisionKey: 'cookies_decision',
    prefsKey: 'cookies_preferences',
    analyticsKey: 'cookies_analytics',
  },

  // UI constants
  ui: {
    headerHeight: 80,
    scrollOffset: 20,
    backToTopThreshold: 300,
  },
};

// Supported languages
export const LANGUAGES = {
  de: { name: 'Deutsch', ogLocale: 'de_DE' },
  en: { name: 'English', ogLocale: 'en_US' },
  ru: { name: 'Русский', ogLocale: 'ru_RU' },
};

// Theme modes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
};
