// =====================================================
// LANGUAGE AND LOCALIZATION MODULE
// =====================================================

import { LANGUAGES, STORAGE_KEYS } from '../config/constants.js';
import { Storage } from '../utils/storage.js';
import { getDOM, AppState } from '../core/app.js';

export const Language = {
  current: 'de',

  init() {
    const langSelect = getDOM('langSelect');
    if (!langSelect) return;

    const savedLang = Storage.getPreference(STORAGE_KEYS.LANGUAGE) || 'de';
    this.current = savedLang;
    langSelect.value = savedLang;

    this.apply(savedLang);
    this.bindEvents();
  },

  apply(lang) {
    this.current = lang;
    this.updateContent(lang);
    this.updateMetaTags(lang);

    // Refresh dynamic content
    this.refreshDynamicContent(lang);
  },

  updateContent(lang) {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key, lang);

      if (!translation) return;

      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    document.documentElement.lang = lang;
  },

  updateMetaTags(lang) {
    if (!AppState.translations[lang]?.meta) return;

    const meta = AppState.translations[lang].meta;

    this.updateMetaTag('name', 'description', meta.description);
    this.updateMetaTag('name', 'keywords', meta.keywords);

    if (meta.title) {
      document.title = meta.title;
    }

    this.updateSocialMeta(
      'og:title',
      meta.title || 'Alexander Hermann - Full-Stack Developer'
    );
    this.updateSocialMeta('og:description', meta.description);
    this.updateSocialMeta('og:locale', this.getOgLocale(lang));

    this.updateSocialMeta(
      'twitter:title',
      meta.title || 'Alexander Hermann - Full-Stack Developer'
    );
    this.updateSocialMeta('twitter:description', meta.description);
  },

  updateMetaTag(attrName, attrValue, content) {
    let metaElement = document.querySelector(
      `meta[${attrName}="${attrValue}"]`
    );

    if (!metaElement) {
      metaElement = document.createElement('meta');
      metaElement.setAttribute(attrName, attrValue);
      document.head.appendChild(metaElement);
    }

    metaElement.content = content;
  },

  updateSocialMeta(property, content) {
    let metaElement =
      document.querySelector(`meta[property="${property}"]`) ||
      document.querySelector(`meta[name="${property}"]`);

    if (!metaElement) {
      metaElement = document.createElement('meta');
      if (property.startsWith('og:')) {
        metaElement.setAttribute('property', property);
      } else {
        metaElement.setAttribute('name', property);
      }
      document.head.appendChild(metaElement);
    }

    metaElement.content = content;
  },

  getOgLocale(lang) {
    return LANGUAGES[lang]?.ogLocale || 'en_US';
  },

  getTranslation(key, lang = this.current) {
    if (!AppState.translations[lang]) return null;
    return key
      .split('.')
      .reduce((obj, k) => obj && obj[k], AppState.translations[lang]);
  },

  refreshDynamicContent(lang) {
    // Refresh projects
    import('./projects.js').then((module) => {
      if (module.Projects.load) {
        module.Projects.load(lang);
      }
    });

    // Refresh skills
    import('./skills.js').then((module) => {
      if (module.Skills.refresh) {
        module.Skills.refresh(lang);
      }
    });
  },

  handleChange(event) {
    const lang = event.target.value;
    Storage.setPreference(STORAGE_KEYS.LANGUAGE, lang);
    this.apply(lang);
  },

  bindEvents() {
    const langSelect = getDOM('langSelect');
    if (langSelect) {
      langSelect.addEventListener('change', (event) =>
        this.handleChange(event)
      );
    }
  },
};
