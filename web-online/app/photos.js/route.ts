import { assets } from '../../lib/assets';
export async function GET(){return new Response(assets['photos.js'],{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-cache'}});}
