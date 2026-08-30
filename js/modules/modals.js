// =====================================================
// MODAL WINDOWS MANAGEMENT MODULE
// =====================================================

import { getDOM } from '../core/app.js';

export const Modals = {
  previouslyFocused: null,

  init() {
    this.setupPrivacyModal();
  },

  setupPrivacyModal() {
    if (!getDOM('privacyModal')) return;

    this.bindEvents();
  },

  bindEvents() {
    if (getDOM('privacyFab')) {
      getDOM('privacyFab').addEventListener('click', () =>
        this.open('privacy')
      );
    }

    if (getDOM('modalClose')) {
      getDOM('modalClose').addEventListener('click', () =>
        this.close('privacy')
      );
    }

    // Close on background click
    window.addEventListener('click', (e) => {
      if (e.target === getDOM('privacyModal')) {
        this.close('privacy');
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        getDOM('privacyModal').style.display === 'block'
      ) {
        this.close('privacy');
      }

      if (e.key === 'Tab' && getDOM('privacyModal').style.display === 'block') {
        this.keepFocusInside(e, getDOM('privacyModal'));
      }
    });
  },

  open(modalType) {
    const modal = getDOM(`${modalType}Modal`);
    if (modal) {
      this.previouslyFocused = document.activeElement;
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close')?.focus();
    }
  },

  close(modalType) {
    const modal = getDOM(`${modalType}Modal`);
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.previouslyFocused?.focus();
      this.previouslyFocused = null;
    }
  },

  keepFocusInside(event, modal) {
    const focusable = [
      ...modal.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((element) => element.offsetParent !== null);

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },
};
