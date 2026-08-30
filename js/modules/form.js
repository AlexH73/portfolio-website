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
    this.setupCallbackRequest(contactForm);
  },

  setupValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => FormDataUtils.clearError(input));
    });
  },

  bindEvents(form) {
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  setupCallbackRequest(form) {
    const subject = form.querySelector('#subject');
    const timezone = form.querySelector('#timezone');

    if (timezone) {
      timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    subject?.addEventListener('change', () => {
      this.toggleCallbackFields(form, subject.value === 'callback');
    });
  },

  toggleCallbackFields(form, show) {
    const callbackFields = form.querySelector('#callbackFields');
    const conditionalInputs = callbackFields?.querySelectorAll('input') || [];
    if (!callbackFields) return;

    callbackFields.hidden = !show;
    conditionalInputs.forEach((input) => {
      input.disabled = !show;
      input.required = show && input.type !== 'hidden';
      if (!show) {
        input.value = '';
        FormDataUtils.clearError(input);
      }
    });

    const timezone = form.querySelector('#timezone');
    if (show && timezone) {
      timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  },

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  },

  validateField(field) {
    FormDataUtils.clearError(field);

    if (field.disabled) return true;

    let isValid = true;
    let errorMessage = '';

    if (field.required && field.value.trim() === '') {
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
    } else if (
      field.type === 'tel' &&
      !FieldValidator.rules.phone(field.value).isValid
    ) {
      isValid = false;
      errorMessage =
        Language.getTranslation('form.invalidPhone') ||
        'Please enter a valid phone number';
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

      const formData = this.getFormData(form);
      await this.sendForm(formData);

      Notifications.show(
        'success',
        Language.getTranslation('form.successTitle') || 'Success',
        Language.getTranslation('form.success') ||
          'Message sent successfully'
      );

      form.reset();
      this.toggleCallbackFields(form, false);
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

  getFormData(form) {
    return FormDataUtils.serialize(form);
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
