// =====================================================
// PERFORMANCE MONITORING AND OPTIMIZATION
// =====================================================

import { isDevelopment } from './app.js';

// Performance metrics
const Metrics = {
  fps: 0,
  memory: {
    used: 0,
    total: 0,
  },
  loadTime: 0,
};

// Monitor FPS
export function monitorFPS() {
  if (!isDevelopment()) return;

  let frameCount = 0;
  let lastTime = performance.now();

  const checkFPS = () => {
    frameCount++;
    const currentTime = performance.now();

    if (currentTime - lastTime >= 1000) {
      Metrics.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;

      if (Metrics.fps < 50) {
        console.warn(
          `⚠️ Low FPS detected: ${Metrics.fps}. Consider optimizing animations.`
        );
      }
    }

    requestAnimationFrame(checkFPS);
  };

  checkFPS();
}

// Monitor memory usage (if supported)
export function monitorMemory() {
  if (!isDevelopment() || !performance.memory) return;

  setInterval(() => {
    const memory = performance.memory;
    Metrics.memory.used = Math.round(memory.usedJSHeapSize / 1048576); // MB
    Metrics.memory.total = Math.round(memory.totalJSHeapSize / 1048576); // MB

    if (Metrics.memory.used > 100) {
      console.warn(`⚠️ High memory usage: ${Metrics.memory.used}MB`);
    }
  }, 10000);
}

// Measure load time
export function measureLoadTime() {
  window.addEventListener('load', () => {
    Metrics.loadTime = Math.round(performance.now());

    if (Metrics.loadTime > 3000) {
      console.warn(`⚠️ Slow load time: ${Metrics.loadTime}ms`);
    }
  });
}

// Debounced resize handler for performance
export function createOptimizedResizeHandler(handler, delay = 250) {
  let timeout;

  const optimizedHandler = () => {
    clearTimeout(timeout);
    timeout = setTimeout(handler, delay);
  };

  window.addEventListener('resize', optimizedHandler);

  return () => {
    window.removeEventListener('resize', optimizedHandler);
  };
}

// Throttled scroll handler for performance
export function createOptimizedScrollHandler(handler, limit = 16) {
  let inThrottle;

  const optimizedHandler = () => {
    if (!inThrottle) {
      handler();
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };

  window.addEventListener('scroll', optimizedHandler);

  return () => {
    window.removeEventListener('scroll', optimizedHandler);
  };
}

// Lazy load images
export function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// Get performance metrics
export function getMetrics() {
  return { ...Metrics };
}

// Log performance metrics
export function logMetrics() {
  if (!isDevelopment()) return;

  console.group('🎯 Performance Metrics');
  console.log(`FPS: ${Metrics.fps}`);
  console.log(`Memory: ${Metrics.memory.used}MB / ${Metrics.memory.total}MB`);
  console.log(`Load Time: ${Metrics.loadTime}ms`);
  console.groupEnd();
}
