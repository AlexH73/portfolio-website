// =====================================================
// APPLICATION CONSTANTS AND CONFIGURATION
// =====================================================

export const CONFIG = {
  site: {
    url:
      import.meta.env?.VITE_SITE_URL?.replace(/\/$/, '') ||
      globalThis.location?.origin ||
      '',
  },

  // API endpoints
  endpoints: {
    formspree: 'https://formspree.io/f/xyzdlrvd',
    // Module-relative URLs work from the source tree on GitHub Pages and let
    // Vite discover, fingerprint and publish the JSON files for Vercel.
    translations: new URL('../data/translations.json', import.meta.url).href,
    projects: new URL('../data/projects.json', import.meta.url).href,
    skills: new URL('../data/skills.json', import.meta.url).href,
    schema: new URL('../data/schema.json', import.meta.url).href,
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
    expirationDays: 365,
    decisionKey: 'cookies_decision',
    prefsKey: 'cookies_preferences',
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
  de: {
    name: 'Deutsch',
    ogLocale: 'de_DE',
    resumeUrl:
      'https://docs.google.com/document/d/1-Efl8M1ISj_uN26r-S0XirIe5XR7FAXGnyk4y6BYw6w/edit?tab=t.0',
  },
  en: {
    name: 'English',
    ogLocale: 'en_US',
    resumeUrl:
      'https://docs.google.com/document/d/1FyihabADRkwHqwJhvDPDL__LWzB7R6SwtRgGc_YFbjc/edit?tab=t.0',
  },
  ru: {
    name: 'Русский',
    ogLocale: 'ru_RU',
    resumeUrl:
      'https://docs.google.com/document/d/1NjeljZy1L2f5NMbwwDG8C_DDIPXV2ikmRNttAMdzWGc/edit?tab=t.0',
  },
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
