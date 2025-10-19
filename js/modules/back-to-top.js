// =====================================================
// BACK TO TOP BUTTON MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { getDOM } from '../core/app.js';
import { throttle } from '../utils/debounce.js';

export const BackToTop = {
  init() {
    if (!getDOM('backToTop')) return;

    const throttledScroll = throttle(() => {
      getDOM('backToTop').classList.toggle(
        'visible',
        window.pageYOffset > CONFIG.ui.backToTopThreshold
      );
    }, 10);

    window.addEventListener('scroll', throttledScroll);

    getDOM('backToTop').addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  },
};
