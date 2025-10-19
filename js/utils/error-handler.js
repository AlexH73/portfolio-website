// js/utils/error-handler.js
export class ErrorHandler {
  static init() {
    // Перехватываем ошибки MutationObserver
    this.wrapMutationObserver();

    // Игнорируем ошибки от сторонних скриптов
    this.ignoreThirdPartyErrors();
  }

  static wrapMutationObserver() {
    const originalMO = window.MutationObserver;

    if (originalMO) {
      window.MutationObserver = class SafeMutationObserver extends originalMO {
        observe(target, options) {
          if (!target || !(target instanceof Node)) {
            console.warn('Blocked invalid MutationObserver target:', target);
            return;
          }
          try {
            super.observe(target, options);
          } catch (error) {
            console.warn('MutationObserver blocked:', error.message);
          }
        }
      };
    }
  }

  static ignoreThirdPartyErrors() {
    const originalError = console.error;

    console.error = function (...args) {
      // Игнорируем ошибки от конкретных сторонних скриптов
      const errorString = args.join(' ');
      if (
        errorString.includes('web-client-content-script') ||
        errorString.includes('sovetnik-inject-content')
      ) {
        return; // Игнорируем
      }

      originalError.apply(console, args);
    };
  }

  // Можно добавить в error-handler.js
  static ignoreSourceMapErrors() {
    window.addEventListener('error', (e) => {
      if (e.filename && e.filename.includes('.map')) {
        e.preventDefault();
        return false;
      }
    });
  }
}
