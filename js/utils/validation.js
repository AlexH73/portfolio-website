// =====================================================
// VALIDATION UTILITIES
// =====================================================

import { isValidEmail } from './helpers.js';

// Validation rules
export const ValidationRules = {
  required: (value) => ({
    isValid:
      value !== null && value !== undefined && value.toString().trim() !== '',
    message: 'This field is required',
  }),

  email: (value) => ({
    isValid: isValidEmail(value),
    message: 'Please enter a valid email address',
  }),

  minLength: (min) => (value) => ({
    isValid: value && value.length >= min,
    message: `Must be at least ${min} characters long`,
  }),

  maxLength: (max) => (value) => ({
    isValid: value && value.length <= max,
    message: `Must be no more than ${max} characters long`,
  }),

  pattern: (regex, message) => (value) => ({
    isValid: regex.test(value),
    message: message || 'Invalid format',
  }),

  url: (value) => ({
    isValid: !value || /^https?:\/\/.+\..+/.test(value),
    message: 'Please enter a valid URL',
  }),
};

// Form validator class
export class FormValidator {
  constructor(rules = {}) {
    this.rules = rules;
    this.errors = {};
  }

  // Validate single field
  validateField(name, value) {
    const fieldRules = this.rules[name];

    if (!fieldRules) {
      return { isValid: true, errors: [] };
    }

    const errors = [];

    for (const rule of fieldRules) {
      const result = typeof rule === 'function' ? rule(value) : rule;

      if (!result.isValid) {
        errors.push(result.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate entire form
  validateForm(formData) {
    this.errors = {};
    let isValid = true;

    for (const [name, value] of Object.entries(formData)) {
      const result = this.validateField(name, value);

      if (!result.isValid) {
        this.errors[name] = result.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors: this.errors,
    };
  }

  // Add validation rule
  addRule(fieldName, rule) {
    if (!this.rules[fieldName]) {
      this.rules[fieldName] = [];
    }
    this.rules[fieldName].push(rule);
  }

  // Remove validation rule
  removeRule(fieldName, ruleIndex) {
    if (this.rules[fieldName]) {
      this.rules[fieldName].splice(ruleIndex, 1);
    }
  }

  // Get errors for specific field
  getFieldErrors(fieldName) {
    return this.errors[fieldName] || [];
  }

  // Check if field has errors
  hasErrors(fieldName) {
    return this.errors[fieldName] && this.errors[fieldName].length > 0;
  }

  // Clear all errors
  clearErrors() {
    this.errors = {};
  }
}

// Field validation utility
export const FieldValidator = {
  // Validate field with rules
  validate(value, rules = []) {
    const errors = [];

    for (const rule of rules) {
      const result = typeof rule === 'function' ? rule(value) : rule;

      if (!result.isValid) {
        errors.push(result.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Create validation rule
  createRule(validator, message) {
    return (value) => ({
      isValid: validator(value),
      message,
    });
  },

  // Common validation rules
  rules: {
    ...ValidationRules,

    // Custom rules
    phone: (value) => ({
      isValid: !value || /^[\+]?[0-9\s\-\(\)]{10,}$/.test(value),
      message: 'Please enter a valid phone number',
    }),

    password: (value) => ({
      isValid: !value || value.length >= 8,
      message: 'Password must be at least 8 characters long',
    }),

    match: (fieldName, fieldValue) => (value) => ({
      isValid: value === fieldValue,
      message: `Must match ${fieldName}`,
    }),

    number: (value) => ({
      isValid: !value || !isNaN(value),
      message: 'Must be a number',
    }),

    integer: (value) => ({
      isValid: !value || Number.isInteger(Number(value)),
      message: 'Must be an integer',
    }),
  },
};

// Form data utilities
export const FormDataUtils = {
  // Serialize form to object
  serialize(form) {
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  },

  // Deserialize object to form
  deserialize(form, data) {
    Object.entries(data).forEach(([key, value]) => {
      const element = form.querySelector(`[name="${key}"]`);
      if (element) {
        element.value = value;
      }
    });
  },

  // Reset form
  reset(form) {
    form.reset();

    // Clear validation errors
    const errorElements = form.querySelectorAll('.error, .error-message');
    errorElements.forEach((element) => element.remove());
  },

  // Show field error
  showError(field, message) {
    field.classList.add('error');

    let errorElement = field.parentNode.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = message;
  },

  // Clear field error
  clearError(field) {
    field.classList.remove('error');

    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  },
};

export default {
  ValidationRules,
  FormValidator,
  FieldValidator,
  FormDataUtils,
};
