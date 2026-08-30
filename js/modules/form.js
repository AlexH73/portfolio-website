// =====================================================
// FORM HANDLING AND VALIDATION MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { getDOM } from '../core/app.js';
import { Language } from './language.js';
import { FieldValidator, FormDataUtils } from '../utils/validation.js';
import { Notifications } from './notifications.js';

export const FormHandler = {
  init() {
    const contactForm = getDOM('contactForm');
    if (!contactForm) return;

    this.setupValidation(contactForm);
    this.bindEvents(contactForm);
  },

  setupValidation(form) {
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => FormDataUtils.clearError(input));
    });
  },

  bindEvents(form) {
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  },

  validateField(field) {
    FormDataUtils.clearError(field);

    let isValid = true;
    let errorMessage = '';

    if (field.value.trim() === '') {
      isValid = false;
      errorMessage =
        Language.getTranslation('form.required') || 'This field is required';
    } else if (
      field.type === 'email' &&
      !FieldValidator.rules.email(field.value).isValid
    ) {
      isValid = false;
      errorMessage =
        Language.getTranslation('form.invalidEmail') ||
        'Please enter a valid email address';
    }

    if (!isValid) {
      FormDataUtils.showError(field, errorMessage);
    }

    return isValid;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    if (!this.validateForm(form)) {
      Notifications.show(
        'error',
        Language.getTranslation('form.validationTitle') || 'Validation Error',
        Language.getTranslation('form.validationError') ||
          'Please check all fields'
      );
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
      this.setButtonState(
        submitBtn,
        true,
        Language.getTranslation('form.sending') || 'Sending...'
      );

      const formData = this.getFormData();
      await this.sendForm(formData);

      Notifications.show(
        'success',
        Language.getTranslation('form.successTitle') || 'Success',
        Language.getTranslation('form.success') ||
          'Message sent successfully'
      );

      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      Notifications.show(
        'error',
        Language.getTranslation('form.errorTitle') || 'Error',
        Language.getTranslation('form.error') || 'Message sending failed'
      );
    } finally {
      this.setButtonState(submitBtn, false, originalText);
    }
  },

  getFormData() {
    return {
      name: getDOM('nameInput').value,
      email: getDOM('emailInput').value,
      message: getDOM('messageInput').value,
    };
  },

  async sendForm(formData) {
    const recaptchaToken = await this.getRecaptchaToken();

    const dataToSend = {
      ...formData,
      'g-recaptcha-response': recaptchaToken,
    };

    const response = await fetch(CONFIG.endpoints.formspree, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    return response.json();
  },

  getRecaptchaToken() {
    return this.loadRecaptcha().then(
      () =>
        new Promise((resolve, reject) => {
          globalThis.grecaptcha.ready(async () => {
            try {
              const token = await globalThis.grecaptcha.execute(
                CONFIG.recaptcha.siteKey,
                { action: CONFIG.recaptcha.action }
              );
              resolve(token);
            } catch (error) {
              reject(error);
            }
          });
        })
    );
  },

  loadRecaptcha() {
    if (globalThis.grecaptcha) return Promise.resolve();
    if (this.recaptchaPromise) return this.recaptchaPromise;

    this.recaptchaPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
        CONFIG.recaptcha.siteKey
      )}`;
      script.async = true;
      const timeout = window.setTimeout(
        () => reject(new Error('reCAPTCHA loading timed out')),
        10000
      );
      script.onload = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        window.clearTimeout(timeout);
        this.recaptchaPromise = null;
        reject(new Error('reCAPTCHA failed to load'));
      };
      document.head.appendChild(script);
    });

    return this.recaptchaPromise;
  },

  setButtonState(button, disabled, text) {
    button.disabled = disabled;
    button.textContent = text;
  },
};
