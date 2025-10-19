// =====================================================
// COOKIES MANAGEMENT AND BANNER MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { getDOM } from '../core/app.js';
import * as Storage from '../utils/storage.js';
import { Language } from './language.js';

const Cookies = Storage.Cookies || {
  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },
  set(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
  },
  remove(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};

export const CookiesManager = {
  init() {
    if (
      !getDOM('cookiesBanner') ||
      !getDOM('cookiesAccept') ||
      !getDOM('cookiesReject')
    ) {
      console.log('🍪 No cookie elements found, skipping initialization');
      return;
    }

    const decision = Cookies.get(CONFIG.cookies.decisionKey);

    if (!decision) {
      setTimeout(() => {
        const banner = getDOM('cookiesBanner');
        if (banner) banner.classList.add('active');
      }, 1000);
    }

    this.bindEvents();
    this.loadPreferences();
  },

  bindEvents() {
    const acceptBtn = getDOM('cookiesAccept');
    const rejectBtn = getDOM('cookiesReject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => this.accept());
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => this.reject());
    }

    if (getDOM('cookiesLearnMore')) {
      getDOM('cookiesLearnMore').addEventListener('click', (e) => {
        e.preventDefault();
        getDOM('cookiesBanner').classList.remove('active');
        const privacySection = document.getElementById('privacy');
        if (privacySection) {
          import('../core/dom.js').then((module) => {
            module.Animations.scrollTo(
              privacySection,
              document.querySelector('header').offsetHeight
            );
          });
        }
      });
    }

    if (getDOM('saveCookiesPrefs')) {
      getDOM('saveCookiesPrefs').addEventListener('click', () =>
        this.savePreferences()
      );
    }
  },

  accept() {
    Cookies.set(CONFIG.cookies.decisionKey, 'accepted');
    Cookies.set(CONFIG.cookies.prefsKey, 'true');
    Cookies.set(CONFIG.cookies.analyticsKey, 'true');
    const banner = getDOM('cookiesBanner');
    if (banner) banner.classList.remove('active');
  },

  reject() {
    Cookies.set(CONFIG.cookies.decisionKey, 'rejected');
    Cookies.set(CONFIG.cookies.prefsKey, 'false');
    Cookies.set(CONFIG.cookies.analyticsKey, 'false');
    const banner = getDOM('cookiesBanner');
    if (banner) banner.classList.remove('active');

    // Clear stored preferences
    Storage.LocalStorage.remove('theme');
    Storage.LocalStorage.remove('language');

    setTimeout(() => window.location.reload(), 500);
  },

  savePreferences() {
    const prefsChecked =
      document.getElementById('cookies-preferences')?.checked || false;
    const analyticsChecked =
      document.getElementById('cookies-analytics')?.checked || false;

    Cookies.set(CONFIG.cookies.prefsKey, prefsChecked.toString());
    Cookies.set(CONFIG.cookies.analyticsKey, analyticsChecked.toString());

    this.showSaveConfirmation();
  },

  showSaveConfirmation() {
    const saveBtn = getDOM('saveCookiesPrefs');
    let msg = document.getElementById('cookies-save-message');

    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'cookies-save-message';
      msg.style.cssText = `
        position: relative;
        float: right;
        right: 0;
        top: 0;
        background: #4caf4fff;
        color: #ffffffff;
        padding: 6px 16px;
        border-radius: 4px;
        border: 1px solid #047208ff;
        font-size: 14px;
        z-index: 1000;
        transition: opacity 0.3s;
        opacity: 0;
      `;

      if (saveBtn && saveBtn.parentNode) {
        saveBtn.parentNode.appendChild(msg);
      }
    }

    const savedText =
      Language && Language.getTranslation
        ? Language.getTranslation('privacy.saved')
        : 'Settings saved';

    msg.textContent = savedText;
    msg.style.opacity = '1';

    setTimeout(() => {
      msg.style.opacity = '0';
      setTimeout(() => {
        if (msg && msg.parentNode) {
          msg.remove();
        }
        // Close modal
        const modal = getDOM('privacyModal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      }, 300);
    }, 2000);
  },

  loadPreferences() {
    const prefs = Cookies.get(CONFIG.cookies.prefsKey);
    const analytics = Cookies.get(CONFIG.cookies.analyticsKey);

    if (prefs === 'false') {
      Storage.LocalStorage.remove('theme');
      Storage.LocalStorage.remove('language');
    }

    if (analytics === 'false') {
      window['ga-disable-UA-XXXXX-Y'] = true;
    }

    const prefsCheckbox = document.getElementById('cookies-preferences');
    const analyticsCheckbox = document.getElementById('cookies-analytics');

    if (prefsCheckbox) prefsCheckbox.checked = prefs !== 'false';
    if (analyticsCheckbox) analyticsCheckbox.checked = analytics !== 'false';
  },
};
