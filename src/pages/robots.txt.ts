import type { APIRoute } from 'astro';
import { href } from '../data/site';
export const GET: APIRoute = ({site}) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(href('sitemap.xml'),site).href}\n`,{headers:{'Content-Type':'text/plain'}});
