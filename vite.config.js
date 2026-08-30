import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // Mirror the GitHub Pages project path during local development.
  // Production assets stay relative so the build also works on a custom domain.
  base: command === 'serve' ? '/portfolio-website/' : './',
  build: {
    target: 'es2020',
  },
}));
