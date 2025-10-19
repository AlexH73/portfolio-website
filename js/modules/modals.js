// =====================================================
// MODAL WINDOWS MANAGEMENT MODULE
// =====================================================

import { getDOM } from '../core/app.js';

export const Modals = {
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
    });
  },

  open(modalType) {
    const modal = getDOM(`${modalType}Modal`);
    if (modal) {
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  },

  close(modalType) {
    const modal = getDOM(`${modalType}Modal`);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },
};
