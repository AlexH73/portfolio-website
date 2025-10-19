// =====================================================
// THEME MANAGEMENT MODULE
// =====================================================

import { THEMES, STORAGE_KEYS } from '../config/constants.js';
import { Storage } from '../utils/storage.js';
import { getDOM, AppState } from '../core/app.js';

export const Theme = {
  current: THEMES.LIGHT,

  init() {
    const themeToggle = getDOM('themeToggle');
    if (!themeToggle) return;

    // Get user preference
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const savedTheme =
      Storage.getPreference(STORAGE_KEYS.THEME) ||
      (prefersDark ? THEMES.DARK : THEMES.LIGHT);

    this.apply(savedTheme);
    this.bindEvents();
  },

  apply(theme) {
    this.current = theme;

    if (theme === THEMES.DARK) {
      document.body.classList.add('dark-theme');
      getDOM('themeToggle').textContent = '☀️';
    } else {
      document.body.classList.remove('dark-theme');
      getDOM('themeToggle').textContent = '🌙';
    }

    // Update chart if exists
    if (AppState.skillsChart) {
      this.refreshChart();
    }
  },

  toggle() {
    const newTheme = this.current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.apply(newTheme);
    Storage.setPreference(STORAGE_KEYS.THEME, newTheme);
  },

  refreshChart() {
    // Import skills module dynamically to avoid circular dependency
    import('./skills.js').then((module) => {
      if (module.Skills.refreshChart) {
        module.Skills.refreshChart();
      }
    });
  },

  bindEvents() {
    const themeToggle = getDOM('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggle());
    }
  },
};
