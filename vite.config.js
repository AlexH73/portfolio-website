import { defineConfig, loadEnv } from 'vite';
import { cp, mkdir, writeFile } from 'node:fs/promises';

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

function generateSearchIndexFiles(siteUrl) {
  return {
    name: 'generate-search-index-files',
    apply: 'build',
    async closeBundle() {
      const canonicalUrl = `${siteUrl.replace(/\/$/, '')}/`;
      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${canonicalUrl}sitemap.xml\n`;
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${canonicalUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

      await Promise.all([
        writeFile('dist/robots.txt', robots),
        writeFile('dist/sitemap.xml', sitemap),
      ]);
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = env.VITE_SITE_URL || 'http://localhost:5173';

  return {
    // Mirror the GitHub Pages project path during local development.
    // Production assets stay relative so the build also works on a custom domain.
    base: command === 'serve' ? '/portfolio-website/' : './',
    build: {
      target: 'es2020',
      // Keep runtime-fetched JSON as same-origin files. Inlining schema.json as
      // a data: URL is correctly blocked by the site's strict connect-src CSP.
      assetsInlineLimit: 0,
    },
    plugins: [copyRuntimeMedia(), generateSearchIndexFiles(siteUrl)],
  };
});
