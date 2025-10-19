// =====================================================
// DOM MANIPULATION UTILITIES
// =====================================================

import { debounce, throttle } from '../utils/debounce.js';

// DOM query utilities
export const DOM = {
  // Get element by selector
  get(selector) {
    return document.querySelector(selector);
  },

  // Get all elements by selector
  getAll(selector) {
    return document.querySelectorAll(selector);
  },

  // Create element with attributes
  create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  },

  // Add event listener with options
  on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  // Remove event listener
  off(element, event, handler, options = {}) {
    element.removeEventListener(event, handler, options);
  },

  // Debounced event listener
  onDebounced(element, event, handler, delay, immediate = false) {
    const debouncedHandler = debounce(handler, delay, immediate);
    return this.on(element, event, debouncedHandler);
  },

  // Throttled event listener
  onThrottled(element, event, handler, limit) {
    const throttledHandler = throttle(handler, limit);
    return this.on(element, event, throttledHandler);
  },
};

// Element visibility utilities
export const Visibility = {
  // Check if element is in viewport
  isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= windowHeight + threshold &&
      rect.right <= windowWidth + threshold
    );
  },

  // Check if element is partially in viewport
  isPartiallyInViewport(element, percentage = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    const visibleHeight =
      Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visibleWidth =
      Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    const elementArea = rect.width * rect.height;
    const visibleArea = visibleWidth * visibleHeight;

    return visibleArea / elementArea >= percentage;
  },

  // Create intersection observer
  createObserver(callback, options = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    return new IntersectionObserver(callback, {
      ...defaultOptions,
      ...options,
    });
  },
};

// Animation utilities
export const Animations = {
  // Add CSS animation class
  animate(element, animationClass, removeAfter = true) {
    element.classList.add(animationClass);

    if (removeAfter) {
      const onAnimationEnd = () => {
        element.classList.remove(animationClass);
        element.removeEventListener('animationend', onAnimationEnd);
      };
      element.addEventListener('animationend', onAnimationEnd);
    }
  },

  // Stagger animations for multiple elements
  stagger(elements, animationClass, delay = 100) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.animate(element, animationClass);
      }, index * delay);
    });
  },

  // Smooth scroll to element
  scrollTo(element, offset = 0, behavior = 'smooth') {
    const targetPosition = element.offsetTop - offset;

    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: targetPosition,
        behavior: behavior,
      });
    } else {
      this.smoothScrollFallback(targetPosition);
    }
  },

  // Smooth scroll fallback for older browsers
  smoothScrollFallback(targetPosition) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      window.scrollTo(0, startPosition + distance * easeProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  },
};
