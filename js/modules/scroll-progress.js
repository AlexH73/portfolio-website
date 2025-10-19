// =====================================================
// SCROLL PROGRESS INDICATOR MODULE
// =====================================================

import { getDOM } from '../core/app.js';
import { throttle } from '../utils/debounce.js';

export const ScrollProgress = {
  init() {
    if (!getDOM('progressBar')) return;

    const throttledScroll = throttle(() => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const progress = (scrollTop / documentHeight) * 100;

      getDOM('progressBar').style.width = `${progress}%`;
    }, 10);

    window.addEventListener('scroll', throttledScroll);
  },
};
