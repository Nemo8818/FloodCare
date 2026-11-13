import { assets } from '../../lib/assets';
export async function GET(){return new Response(assets["staff.html"],{headers:{'Content-Type':"text/html; charset=utf-8",'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}
