export type Bindings={DB:any;BUCKET:any;STAFF_PASSWORD?:string};
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers});
const stages=['รับเรื่องแล้ว','ขอข้อมูลเพิ่ม','นัดตรวจพื้นที่','กำลังดำเนินการ','ปิดงาน'];
const encode=(buf:ArrayBuffer)=>{const bytes=new Uint8Array(buf);let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s);};
const digest=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),v=>v.toString(16).padStart(2,'0')).join('');
async function equal(a:string,b:string){const [x,y]=await Promise.all([digest(a),digest(b)]);let diff=0;for(let i=0;i<x.length;i++)diff|=x.charCodeAt(i)^y.charCodeAt(i);return diff===0;}
async function staff(request:Request,env:Bindings){const token=request.headers.get('X-Staff-Session')||'';if(!token)return false;const result=await env.DB.prepare('SELECT expires FROM sessions WHERE hash=?').bind(await digest(token)).first();return result&&result.expires>Date.now();}
function ownerKey(request:Request){const key=request.headers.get('X-Owner')||'';return /^[a-zA-Z0-9-]{32,100}$/.test(key)?key:'';}
function validate(data:any){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Invalid request');const r:any={};
 for(const [key,limit] of Object.entries({id:80,type:10,name:80,phone:30,address:1000,reason:1500})){
  if(typeof data[key]!=='string'||!data[key].trim()||data[key].length>limit)throw Error('Invalid field: '+key);r[key]=data[key].trim();
 }
 if(!/^[A-Za-z0-9-]+$/.test(r.id)||!['SOS','CLAIM'].includes(r.type))throw Error('Invalid request type or ID');
 if(r.type==='SOS'){r.people=Number(data.people);if(!Number.isInteger(r.people)||r.people<1||r.people>999)throw Error('Invalid people count');}
 else{if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||isNaN(Date.parse(data.date)))throw Error('Invalid incident date');r.date=data.date;}
 for(const key of ['vulnerable','identity','home','photos'])r[key]=Boolean(data[key]);
 if(data.location){const loc=data.location;if(!Number.isFinite(loc.lat)||!Number.isFinite(loc.lng)||!Number.isFinite(loc.accuracy)||loc.lat< -90||loc.lat>90||loc.lng< -180||loc.lng>180||loc.accuracy<0||loc.accuracy>100000||isNaN(Date.parse(loc.at)))throw Error('Invalid location');r.location={lat:loc.lat,lng:loc.lng,accuracy:loc.accuracy,at:loc.at};}
 const photos=data.attachments??[];if(!Array.isArray(photos)||photos.length>2)throw Error('Maximum two images');
 const images=photos.map((item:any)=>{const match=/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(item?.data||'');if(!match)throw Error('Invalid photo format');let text;try{text=atob(match[2]);}catch{throw Error('Invalid photo');}if(text.length>1048576||!text.length)throw Error('Photo limit: 1 MB each');const bytes=Uint8Array.from(text,(c:string)=>c.charCodeAt(0));const ok=match[1]==='image/png'?text.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='image/jpeg'?text.startsWith('\xff\xd8\xff'):text.startsWith('RIFF')&&text.slice(8,12)==='WEBP';if(!ok)throw Error('Invalid photo signature');return {bytes,mime:match[1]};});
 return {r,images};
}
async function present(row:any){const data=JSON.parse(row.payload);data.attachments=(data.imageKeys||[]).map((_:unknown,i:number)=>({url:'/api/photo/'+encodeURIComponent(data.id)+'/'+i}));delete data.imageKeys;return data;}
export async function handle(request:Request,env:Bindings):Promise<Response>{
 const url=new URL(request.url),path=url.pathname,method=request.method;
 if(!env.DB||!env.BUCKET)return reply(503,{error:'Storage unavailable'});
 const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return reply(403,{error:'Origin not allowed'});
 try{
  if(method==='GET'&&path.startsWith('/api/photo/')){
   const [, , ,id,index]=path.split('/');const row=await env.DB.prepare('SELECT owner,payload FROM requests WHERE id=?').bind(id).first();
   if(!row)return reply(404,{error:'Photo not found'});if(row.owner!==ownerKey(request)&&!await staff(request,env))return reply(401,{error:'Authentication required'});
   const data=JSON.parse(row.payload),key=data.imageKeys?.[Number(index)];if(!/^\d+$/.test(index||'')||!key)return reply(404,{error:'Photo not found'});
   const image=await env.BUCKET.get(key);if(!image)return reply(404,{error:'Photo not found'});
   return new Response(image.body,{headers:{'Content-Type':image.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(method==='GET'&&path==='/api/requests'){
   const isStaff=await staff(request,env),owner=ownerKey(request);if(!isStaff&&!owner)return reply(401,{error:'Authentication required'});
   const statement=isStaff?env.DB.prepare('SELECT owner,payload FROM requests ORDER BY created DESC LIMIT 200'):env.DB.prepare('SELECT owner,payload FROM requests WHERE owner=? ORDER BY created DESC LIMIT 200').bind(owner);
   const result=await statement.all();return reply(200,{records:await Promise.all(result.results.map(present))});
  }
  if(method!=='POST')return reply(404,{error:'Not found'});
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,{error:'JSON required'});
  const stated=Number(request.headers.get('Content-Length')||0);if(stated>3145728)return reply(413,{error:'Request too large'});
  const bytes=await request.arrayBuffer();if(bytes.byteLength>3145728)return reply(413,{error:'Request too large'});
  let data:any;try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply(400,{error:'Invalid JSON'});}if(!data||typeof data!=='object'||Array.isArray(data))return reply(400,{error:'Invalid request'});
  if(path==='/api/login'){
   if(!env.STAFF_PASSWORD)return reply(503,{error:'Staff access is not configured'});
   const ip=await digest(request.headers.get('cf-connecting-ip')||'private-site');const time=Date.now();
   await env.DB.prepare('INSERT INTO attempts (ip,started,count) VALUES (?,?,1) ON CONFLICT(ip) DO UPDATE SET count=CASE WHEN started<? THEN 1 ELSE count+1 END, started=CASE WHEN started<? THEN ? ELSE started END').bind(ip,time,time-60000,time-60000,time).run();
   const attempt=await env.DB.prepare('SELECT count FROM attempts WHERE ip=?').bind(ip).first();if(attempt.count>10)return reply(429,{error:'Too many attempts. Wait one minute.'});
   if(!await equal(String(data.password||'').trim(),env.STAFF_PASSWORD.trim()))return reply(401,{error:'Incorrect staff password'});
   const token=crypto.randomUUID()+crypto.randomUUID();await env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(time).run();await env.DB.prepare('INSERT INTO sessions (hash,expires) VALUES (?,?)').bind(await digest(token),time+8*3600000).run();return reply(200,{session:token});
  }
  if(path==='/api/logout'){await env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(await digest(request.headers.get('X-Staff-Session')||'')).run();return reply(200,{ok:true});}
  if(path==='/api/requests'){
   const owner=ownerKey(request);if(!owner)return reply(401,{error:'Owner token required'});
   const {r,images}=validate(data);let old=await env.DB.prepare('SELECT owner,payload FROM requests WHERE id=?').bind(r.id).first();
   if(old)return old.owner===owner?reply(200,{record:await present(old)}):reply(409,{error:'Request ID conflict'});
   r.created=new Date().toISOString();r.status='ถึงเซิร์ฟเวอร์แล้ว — รอเจ้าหน้าที่รับเรื่อง';r.history=[];r.imageKeys=[];
   try{
    for(const image of images){const key='photos/'+crypto.randomUUID();await env.BUCKET.put(key,image.bytes,{httpMetadata:{contentType:image.mime}});r.imageKeys.push(key);}
    const saved=await env.DB.prepare('INSERT OR IGNORE INTO requests (id,owner,payload,created) VALUES (?,?,?,?)').bind(r.id,owner,JSON.stringify(r),r.created).run();
    if(saved.meta.changes===0){await Promise.all(r.imageKeys.map((k:string)=>env.BUCKET.delete(k)));old=await env.DB.prepare('SELECT owner,payload FROM requests WHERE id=?').bind(r.id).first();return old.owner===owner?reply(200,{record:await present(old)}):reply(409,{error:'Request ID conflict'});}
   }catch(error){await Promise.all(r.imageKeys.map((k:string)=>env.BUCKET.delete(k)));throw error;}
   return reply(201,{record:await present({payload:JSON.stringify(r)})});
  }
  if(path==='/api/status'){
   if(!await staff(request,env))return reply(401,{error:'Staff authentication required'});if(!stages.includes(data.status))return reply(400,{error:'Invalid status'});
   const row=await env.DB.prepare('SELECT payload FROM requests WHERE id=?').bind(String(data.id||'')).first();if(!row)return reply(404,{error:'Request not found'});
   const record=JSON.parse(row.payload);record.status=data.status;record.history.push({status:data.status,at:new Date().toISOString()});await env.DB.prepare('UPDATE requests SET payload=? WHERE id=?').bind(JSON.stringify(record),record.id).run();return reply(200,{record:await present({payload:JSON.stringify(record)})});
  }
  return reply(404,{error:'Not found'});
 }catch(error){if(error instanceof Error&&/Invalid|Maximum|Photo limit/.test(error.message))return reply(400,{error:error.message});console.error('FloodCare API failure',error instanceof Error?error.message:'unknown');return reply(503,{error:'Service temporarily unavailable. Retry later.'});}
}
