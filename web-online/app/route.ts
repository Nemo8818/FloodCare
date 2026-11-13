import { assets } from '../lib/assets';
export async function GET(){return new Response(assets['index.html'],{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});}
