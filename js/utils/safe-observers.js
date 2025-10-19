// js/utils/safe-observers.js
export class SafeMutationObserver {
  static observe(target, callback, options = {}) {
    if (!target || !(target instanceof Node)) {
      console.warn('MutationObserver: Invalid target element', target);
      return null;
    }

    try {
      const observer = new MutationObserver(callback);
      observer.observe(target, options);
      return observer;
    } catch (error) {
      console.error('MutationObserver failed:', error);
      return null;
    }
  }
}

export class SafeIntersectionObserver {
  static observe(target, callback, options = {}) {
    if (!target || !(target instanceof Element)) {
      console.warn('IntersectionObserver: Invalid target element', target);
      return null;
    }

    try {
      const observer = new IntersectionObserver(callback, options);
      observer.observe(target);
      return observer;
    } catch (error) {
      console.error('IntersectionObserver failed:', error);
      return null;
    }
  }
}
