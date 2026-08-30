import { defineConfig } from 'vite';
import { cp, mkdir } from 'node:fs/promises';

function copyRuntimeMedia() {
  return {
    name: 'copy-runtime-media',
    apply: 'build',
    async closeBundle() {
      await mkdir('dist/images', { recursive: true });
      await Promise.all([
        cp('images/icons', 'dist/images/icons', { recursive: true }),
        cp('images/projects', 'dist/images/projects', { recursive: true }),
        cp('images/weather.png', 'dist/images/weather.png'),
      ]);
    },
  };
}

export default defineConfig(({ command }) => ({
  // Mirror the GitHub Pages project path during local development.
  // Production assets stay relative so the build also works on a custom domain.
  base: command === 'serve' ? '/portfolio-website/' : './',
  build: {
    target: 'es2020',
  },
  plugins: [copyRuntimeMedia()],
}));
