// =====================================================
// STORAGE UTILITIES - LOCALSTORAGE AND COOKIES
// =====================================================

import { CONFIG, STORAGE_KEYS } from '../config/constants.js';

// LocalStorage utilities
export const LocalStorage = {
  // Set item in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('LocalStorage set failed:', error);
      return false;
    }
  },

  // Get item from localStorage
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('LocalStorage get failed:', error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('LocalStorage remove failed:', error);
      return false;
    }
  },

  // Clear all items from localStorage
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
      return false;
    }
  },

  // Check if key exists in localStorage
  has(key) {
    return localStorage.getItem(key) !== null;
  },

  // Get all keys from localStorage
  keys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  },
};

// Cookies utilities
export const Cookies = {
  // Set cookie
  set(name, value, days = CONFIG.cookies.expirationDays, path = '/') {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    const cookieValue = encodeURIComponent(value);

    document.cookie = `${name}=${cookieValue};${expires};path=${path};SameSite=Lax`;
    return true;
  },

  // Get cookie
  get(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(
          cookie.substring(nameEQ.length, cookie.length)
        );
      }
    }
    return null;
  },

  // Delete cookie
  delete(name, path = '/') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    return true;
  },

  // Check if cookie exists
  has(name) {
    return this.get(name) !== null;
  },

  // Get all cookies as object
  getAll() {
    const cookies = {};
    document.cookie.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  },
};

// Combined storage with cookies fallback
export const Storage = {
  // Get preference with cookies fallback
  getPreference(key) {
    const cookiesPrefs = Cookies.get(CONFIG.cookies.prefsKey);

    if (cookiesPrefs === 'false') {
      return Cookies.get(key);
    } else {
      return LocalStorage.get(key) || Cookies.get(key);
    }
  },

  // Set preference with cookies fallback
  setPreference(key, value) {
    const cookiesPrefs = Cookies.get(CONFIG.cookies.prefsKey);

    if (cookiesPrefs !== 'false') {
      LocalStorage.set(key, value);
    }
    Cookies.set(key, value);
  },

  // Remove preference from both storages
  removePreference(key) {
    LocalStorage.remove(key);
    Cookies.delete(key);
  },

  // Clear all user preferences
  clearPreferences() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.removePreference(key);
    });

    // Clear cookies preferences
    Cookies.delete(CONFIG.cookies.prefsKey);
    Cookies.delete(CONFIG.cookies.analyticsKey);
  },

  // Get user settings
  getSettings() {
    return {
      theme: this.getPreference(STORAGE_KEYS.THEME),
      language: this.getPreference(STORAGE_KEYS.LANGUAGE),
      cookiesAccepted: Cookies.get(CONFIG.cookies.decisionKey) === 'accepted',
      preferencesEnabled: Cookies.get(CONFIG.cookies.prefsKey) !== 'false',
      analyticsEnabled: Cookies.get(CONFIG.cookies.analyticsKey) === 'true',
    };
  },

  // Save user settings
  saveSettings(settings) {
    if (settings.theme) {
      this.setPreference(STORAGE_KEYS.THEME, settings.theme);
    }

    if (settings.language) {
      this.setPreference(STORAGE_KEYS.LANGUAGE, settings.language);
    }

    if (settings.cookiesAccepted !== undefined) {
      Cookies.set(
        CONFIG.cookies.decisionKey,
        settings.cookiesAccepted ? 'accepted' : 'rejected'
      );
    }

    if (settings.preferencesEnabled !== undefined) {
      Cookies.set(
        CONFIG.cookies.prefsKey,
        settings.preferencesEnabled.toString()
      );
    }

    if (settings.analyticsEnabled !== undefined) {
      Cookies.set(
        CONFIG.cookies.analyticsKey,
        settings.analyticsEnabled.toString()
      );
    }
  },
};

// Export default storage
export default Storage;
