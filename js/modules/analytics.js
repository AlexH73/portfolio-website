import { inject } from '@vercel/analytics';

export const Analytics = {
  init() {
    inject({ mode: 'production' });
  },
};
