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
        Language.getTranslation('form.validationError') || 'Validation Error',
        Language.getTranslation('form.checkFields') || 'Please check all fields'
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
        Language.getTranslation('form.success') || 'Success',
        Language.getTranslation('form.messageSent') ||
          'Message sent successfully'
      );

      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      Notifications.show(
        'error',
        Language.getTranslation('form.error') || 'Error',
        `${Language.getTranslation('form.sendFailed') || 'Send failed'}: ${
          error.message
        }`
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
    let recaptchaToken = '';
    try {
      recaptchaToken = await this.getRecaptchaToken();
    } catch (error) {
      console.warn('reCAPTCHA error:', error);
    }

    const dataToSend = { ...formData };
    if (recaptchaToken) {
      dataToSend['g-recaptcha-response'] = recaptchaToken;
    }

    const response = await fetch(CONFIG.endpoints.formspree, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      throw new Error('Form submission failed');
    }

    return response.json();
  },

  getRecaptchaToken() {
    return new Promise((resolve, reject) => {
      if (typeof grecaptcha === 'undefined') {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      grecaptcha.ready(async () => {
        try {
          const token = await grecaptcha.execute(CONFIG.recaptcha.siteKey, {
            action: CONFIG.recaptcha.action,
          });
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  },

  setButtonState(button, disabled, text) {
    button.disabled = disabled;
    button.textContent = text;
  },
};
