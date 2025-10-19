// =====================================================
// NOTIFICATION SYSTEM MODULE
// =====================================================

import { Language } from './language.js';

export const Notifications = {
  show(type, title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-left: 4px solid;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 16px;
      min-width: 300px;
      max-width: 500px;
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;

    // Set border color based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    };
    notification.style.borderLeftColor = colors[type] || colors.info;

    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header" style="display: flex; align-items: center; margin-bottom: 8px;">
          <span class="notification-icon" style="font-size: 20px; margin-right: 8px;">
            ${this.getIcon(type)}
          </span>
          <h4 style="margin: 0; font-size: 16px; color: #1f2937;">${title}</h4>
        </div>
        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.4;">${message}</p>
        <button class="notification-close" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af;">
          &times;
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.close(notification);
    });

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
      if (notification.parentElement) {
        this.close(notification);
      }
    }, 5000);

    // Pause auto-remove on hover
    notification.addEventListener('mouseenter', () => {
      clearTimeout(autoRemove);
    });

    notification.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (notification.parentElement) {
          this.close(notification);
        }
      }, 5000);
    });
  },

  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[type] || icons.info;
  },

  close(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
    }, 300);
  },
};
