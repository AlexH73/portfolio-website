export class Debugger {
  static init() {
    // Только в development режиме
    if (this.isDevelopment()) {
      this.validateRequiredElements();
    }
  }

  static validateRequiredElements() {
    const requiredSelectors = [
      '#theme-toggle',
      '#mobile-menu-toggle',
      '#language-switcher',
    ];

    requiredSelectors.forEach((selector) => {
      if (!document.querySelector(selector)) {
        console.warn(`Optional element not found: ${selector}`);
      }
    });
  }

  static isDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }
}
