// =====================================================
// MOBILE MENU MANAGEMENT MODULE
// =====================================================

import { getDOM } from '../core/app.js';

export const MobileMenu = {
  init() {
    if (!getDOM('menuToggle') || !getDOM('navigation')) {
      console.log('📱 No mobile menu elements found');
      return;
    }

    this.bindEvents();
  },

  bindEvents() {
    const menuToggle = getDOM('menuToggle');
    const navigation = getDOM('navigation');

    if (!menuToggle || !navigation) return;

    menuToggle.addEventListener('click', () => this.toggle());

    // Close menu when clicking on links
    document.querySelectorAll('nav a').forEach((link) => {
      link.addEventListener('click', () => {
        if (navigation.classList.contains('active')) {
          this.toggle();
        }
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navigation.classList.contains('active')) {
        this.toggle();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        navigation.classList.contains('active') &&
        !navigation.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        this.toggle();
      }
    });
  },

  toggle() {
    const navigation = getDOM('navigation');
    const menuToggle = getDOM('menuToggle');

    if (!navigation || !menuToggle) return;

    navigation.classList.toggle('active');
    menuToggle.classList.toggle('active');
    document.body.style.overflow = navigation.classList.contains('active')
      ? 'hidden'
      : '';
  },
};
