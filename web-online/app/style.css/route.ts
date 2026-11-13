import { assets } from '../../lib/assets';
export async function GET(){return new Response(assets["style.css"],{headers:{'Content-Type':"text/css; charset=utf-8",'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}
