import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// The one place the site's public address lives. The canonical link, the social preview
// tags, robots.txt and the sitemap are all built from it, so moving to a custom domain is
// this line and nothing else. No trailing slash.
const SITE_URL = 'https://applyw.app'

// index.html can't read a constant on its own, and files in public/ are copied verbatim,
// so anything needing an absolute URL is filled in here instead. The placeholder is
// __SITE_URL__ rather than Vite's own %VAR% form, which is reserved for env variables and
// warns when one isn't defined.
function siteUrl(): Plugin {
  return {
    name: 'applyw-site-url',

    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', SITE_URL)
    },

    // Both files have to name the site absolutely, which is exactly what a static file in
    // public/ cannot do.
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
      })

      // One page. The metrics view is a hash route, and a fragment is not a separate URL
      // to a crawler, so listing it would claim a page that doesn't exist.
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          '  <url>',
          `    <loc>${SITE_URL}/</loc>`,
          '  </url>',
          '</urlset>',
          ''
        ].join('\n')
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), siteUrl()],
  // '/' is right for a custom domain or a <user>.github.io site. If this ends up served
  // from a project page (<user>.github.io/website/), change this to '/website/' or asset
  // URLs will 404.
  base: '/'
})
