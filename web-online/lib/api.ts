import { env } from 'cloudflare:workers';
import { handle } from './api-core';
export async function handleAPI(request:Request){return handle(request,env as any);}
