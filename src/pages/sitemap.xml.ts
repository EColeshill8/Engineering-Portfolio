import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
import { href } from '../data/site';
export const GET: APIRoute = ({site}) => {
  const paths = ['', 'projects/', 'about/', ...projects.map(p => `projects/${p.slug}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${new URL(href(path),site).href}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
};
