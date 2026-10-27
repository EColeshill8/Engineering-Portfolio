import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL || 'https://eliascoleshill.ca';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: ['localhost', '127.0.0.1'] } }
});
