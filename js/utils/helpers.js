// =====================================================
// GENERAL PURPOSE HELPER FUNCTIONS
// =====================================================

// Email validation
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Hex to RGBA conversion
export function hexToRgba(hex, alpha = 1) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  let r, g, b;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error('Invalid hex color format');
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Generate random ID
export function generateId(length = 8) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

// Deep clone object
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (obj instanceof Object) {
    const cloned = {};
    Object.keys(obj).forEach((key) => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
}

// Merge objects deeply
export function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

// Check if value is an object
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Capitalize first letter
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Wait for specified time
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retry(fn, retries = 3, delayMs = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    await delay(delayMs);
    return retry(fn, retries - 1, delayMs * 2);
  }
}

// Check if browser supports feature
export function supportsFeature(feature) {
  const features = {
    intersectionObserver: 'IntersectionObserver' in window,
    smoothScroll: 'scrollBehavior' in document.documentElement.style,
    cssVariables: CSS.supports('color', 'var(--test)'),
    webP: (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
  };

  return features[feature] || false;
}
