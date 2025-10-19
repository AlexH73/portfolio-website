// =====================================================
// SCROLL ANIMATIONS AND INTERSECTION OBSERVER MODULE
// =====================================================

import { CONFIG } from '../config/constants.js';
import { Visibility, Animations as DOMAnimations } from '../core/dom.js';
import { Skills } from './skills.js';

export const ScrollAnimations = {
  init() {
    this.setupIntersectionObserver();
    this.setupSmoothScrolling();
  },

  setupIntersectionObserver() {
    const observer = Visibility.createObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Special handling for skills chart
          if (entry.target.classList.contains('skills-chart-container')) {
            Skills.handleChartAnimation(entry.target);
          }
        }
      });
    });

    const elements = document.querySelectorAll(
      'section, .fade-in, .skills-chart-container, .chart-legend, .skills-details'
    );
    elements.forEach((element) => observer.observe(element));
  },

  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const headerHeight = document.querySelector('header').offsetHeight;
          DOMAnimations.scrollTo(
            targetElement,
            headerHeight + CONFIG.ui.scrollOffset
          );
        }
      });
    });
  },
};
