// js/utils/debug.js
export class Debugger {
  static init() {
    // Логируем все ошибки
    window.addEventListener('error', (e) => {
      console.error('Global Error:', e.error);
      this.logToService('error', e.error?.message, e.error?.stack);
    });

    // Логируем необработанные промисы
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled Promise Rejection:', e.reason);
      this.logToService('promise_error', e.reason?.message || String(e.reason));
    });

    // Проверяем наличие необходимых элементов (информационно)
    this.validateRequiredElements();
  }

  static validateRequiredElements() {
    const requiredSelectors = [
      '#theme-toggle',
      '#mobile-menu-toggle',
      '#language-switcher',
    ];

    requiredSelectors.forEach((selector) => {
      if (!document.querySelector(selector)) {
        console.log(
          `ℹ️ Optional element not found: ${selector} - this is OK if not used`
        );
      }
    });
  }

  static logToService(level, message, stack = null) {
    // В продакшене можно отправлять логи на сервер
    if (this.isProduction()) {
      // fetch('/api/logs', { method: 'POST', ... })
    }
  }

  static isProduction() {
    return (
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    );
  }
}
