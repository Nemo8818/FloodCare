import { assets } from '../../lib/assets';
export async function GET(){return new Response(assets["i18n.js"],{headers:{'Content-Type':"text/javascript; charset=utf-8",'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}
