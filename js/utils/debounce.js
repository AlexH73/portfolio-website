// =====================================================
// DEBOUNCE AND THROTTLE FUNCTIONS
// =====================================================

/**
 * Debounce function - delays execution until after wait milliseconds
 * have elapsed since the last time the function was invoked
 */
export function debounce(func, wait, immediate = false) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function - limits execution to once every limit milliseconds
 */
export function throttle(func, limit) {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Debounce with leading and trailing options
 */
export function advancedDebounce(func, wait, options = {}) {
  const { leading = false, trailing = true, maxWait } = options;

  let timeout;
  let lastCallTime;
  let lastInvokeTime = 0;
  let lastArgs;
  let lastThis;

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    return func.apply(thisArg, args);
  }

  function startTimer(pendingFunc, wait) {
    clearTimeout(timeout);
    timeout = setTimeout(pendingFunc, wait);
  }

  function trailingEdge(time) {
    timeout = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = lastThis = undefined;
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    startTimer(timerExpired, wait);
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === undefined) {
        lastInvokeTime = time;
        startTimer(timerExpired, wait);
        if (leading) {
          return invokeFunc(time);
        }
      }

      if (maxWait !== undefined) {
        startTimer(timerExpired, wait);
        return invokeFunc(time);
      }
    }

    if (timeout === undefined) {
      startTimer(timerExpired, wait);
    }
  }

  debounced.cancel = function () {
    clearTimeout(timeout);
    lastCallTime = lastInvokeTime = 0;
    lastArgs = lastThis = timeout = undefined;
  };

  return debounced;
}

/**
 * Throttle with leading and trailing options
 */
export function advancedThrottle(func, wait, options = {}) {
  const { leading = true, trailing = true } = options;

  let timeout;
  let lastArgs;
  let lastThis;
  let result;
  let lastCallTime;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastCallTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function trailingEdge(time) {
    timeout = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = lastThis = undefined;
    return result;
  }

  function timerExpired() {
    const time = Date.now();
    trailingEdge(time);
  }

  function throttled(...args) {
    const time = Date.now();

    if (lastCallTime === undefined && !leading) {
      lastCallTime = time;
    }

    const remaining = wait - (time - lastCallTime);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }

      lastCallTime = time;
      result = invokeFunc(time);
    } else if (!timeout && trailing) {
      timeout = setTimeout(timerExpired, remaining);
    }

    return result;
  }

  throttled.cancel = function () {
    clearTimeout(timeout);
    lastCallTime = 0;
    lastArgs = lastThis = timeout = undefined;
  };

  return throttled;
}

// Export default debounce and throttle
export default {
  debounce,
  throttle,
  advancedDebounce,
  advancedThrottle,
};
