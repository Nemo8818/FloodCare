'use strict';
const KEY='floodcare-v1';
function newId(){return crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');}
let rows=[]; let locationData=null;
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(data))throw Error();rows=data;}catch{alert(t('อ่านข้อมูลเดิมไม่ได้ โปรดสำรองข้อมูลเว็บไซต์ก่อนเริ่มใหม่'));}
function announce(s){$('message').textContent=s;}
function persist(next){try{localStorage.setItem(KEY,JSON.stringify(next));rows=next;render();return true;}catch{announce(t('บันทึกไม่สำเร็จ พื้นที่จัดเก็บอาจเต็มหรือถูกปิด อย่าปิดหน้านี้ก่อนคัดลอกข้อมูล'));return false;}}
function showTab(id){for(const name of ['sos','claim','track']){$(name).hidden=name!==id;document.querySelector(`[data-tab="${name}"]`).classList.toggle('active',name===id);}render();}
function status(){ $('connection').textContent=navigator.onLine?t('● เบราว์เซอร์ออนไลน์*'):t('○ ออฟไลน์: บันทึกในเครื่องได้');$('connection').title=t('สถานะเครือข่ายของเบราว์เซอร์ ไม่ใช่การเชื่อมต่อศูนย์ช่วยเหลือ'); }
window.addEventListener('online',status);window.addEventListener('offline',status);
async function saveForm(form,type){
 const submit=form.querySelector('[type="submit"]');submit.disabled=true;
 try{
  const files=[...form.elements.images.files];
  if(files.length>2||files.some(f=>f.size>1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type)))throw Error(t('รูปภาพต้องเป็น JPG PNG หรือ WebP สูงสุด 2 รูป รูปละ 1 MB'));
  const attachments=await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({data:reader.result});reader.onerror=()=>reject(Error(t('อ่านรูปภาพไม่ได้')));reader.readAsDataURL(file);}))); 
  const d=Object.fromEntries(new FormData(form));delete d.images;
  const row={...d,attachments,type,id:type+'-'+newId(),created:new Date().toISOString(),status:'บันทึกในเครื่อง — ยังไม่ส่ง',location:type==='SOS'?locationData:null};
  if(!persist([...rows,row]))return;
  form.reset();document.getElementById(type==='SOS'?'sosPreview':'claimPreview').replaceChildren();
  locationData=null;$('coords').textContent=t('ยังไม่มีพิกัด — กรอกจุดสังเกตให้ชัดเจนได้');showTab('track');
  await sendRecord(row.id);
 }catch(error){announce(error.message);}finally{submit.disabled=false;}
}
$('sosForm').addEventListener('submit',e=>{e.preventDefault();saveForm(e.target,'SOS');});
$('claimForm').addEventListener('submit',e=>{e.preventDefault();saveForm(e.target,'CLAIM');});
$('locate').onclick=()=>{if(!navigator.geolocation){announce(t('อุปกรณ์นี้ไม่รองรับตำแหน่ง โปรดระบุที่อยู่'));return;}$('coords').textContent=t('กำลังหาตำแหน่ง…');navigator.geolocation.getCurrentPosition(p=>{locationData={lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,at:new Date(p.timestamp).toISOString()};$('coords').textContent=`${locationData.lat.toFixed(5)}, ${locationData.lng.toFixed(5)} • ${t('คลาดเคลื่อนประมาณ')} ${Math.round(locationData.accuracy)} ${t('เมตร')}`;},()=>{$('coords').textContent=t('หาตำแหน่งไม่ได้ โปรดกรอกที่อยู่และจุดสังเกต');locationData=null;},{timeout:15000,maximumAge:0,enableHighAccuracy:true});};

function card(r){
 const at=new Date(r.created).toLocaleString(locale());
 const loc=r.location?`${r.location.lat}, ${r.location.lng} (±${Math.round(r.location.accuracy)} m) ${t('เวลา')} ${new Date(r.location.at).toLocaleString(locale())}`:t('ไม่มีพิกัด');
 const detail=r.type==='SOS'?`${t('จำนวน')}: ${escapeHTML(r.people)} • ${r.vulnerable?t('มีผู้ต้องการความช่วยเหลือพิเศษ'):t('ไม่ระบุผู้ต้องการความช่วยเหลือพิเศษ')}<br>${t('พิกัด')}: ${escapeHTML(loc)}`:`${t('วันที่เกิดเหตุ')}: ${escapeHTML(r.date)}<br>${t('เตรียมแล้ว')} ${[r.identity,r.home,r.photos].filter(Boolean).length}/3 ${t('รายการตัวอย่าง')}`;
 return `<article class="record ${r.type==='SOS'?'sos':''}"><span class="badge">${r.type==='SOS'?'SOS':t('เยียวยา')}</span><h3>${escapeHTML(r.id)}</h3><p><b>${escapeHTML(r.name)}</b> • ${escapeHTML(r.phone)}<br>${escapeHTML(r.address)}<br>${escapeHTML(r.type==='SOS'?t(r.reason):r.reason)}</p><p>${detail}</p><div class="photos">${(r.attachments||[]).filter(a=>/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(a.data)).map(a=>`<img src="${a.data}" alt="${t('รูปภาพแนบ')}" loading="lazy">`).join('')}</div><p class="badge">${escapeHTML(t(r.status))}</p>${!r.sent?`<button data-send="${escapeHTML(r.id)}">${t('ลองส่งอีกครั้ง')}</button>`:''}<p class="muted">${t('บันทึก')} ${escapeHTML(at)}</p>${r.type==='SOS'?`<button data-sms="${escapeHTML(r.id)}">${t('เตรียม SMS')}</button>`:''}</article>`;
}
function render(){const sorted=[...rows].reverse();$('records').innerHTML=sorted.map(r=>card(r)).join('')||'<p class="record">'+t('ยังไม่มีคำขอ เริ่มบันทึก SOS หรือข้อมูลเยียวยาได้จากเมนูด้านบน')+'</p>';}
$('records').addEventListener('click',e=>{const r=rows.find(x=>x.id===e.target.dataset.sms);if(!r)return;const recipient=prompt(t('ใส่หมายเลขผู้รับที่ตรวจสอบแล้ว (ต้นแบบไม่มีหมายเลขศูนย์รับ SOS)'));if(!recipient)return;if(!/^\+?[0-9]{5,15}$/.test(recipient)){announce(t('หมายเลขผู้รับไม่ถูกต้อง'));return;}const body=`SOS ${r.id}\n${t(r.reason)}\n${r.name} ${t('โทร')} ${r.phone}\n${r.people} ${t('คน')} ${r.vulnerable?t('มีผู้เปราะบาง'):''}\n${r.address}\n${r.location?`${r.location.lat},${r.location.lng} ${t('พิกัดเมื่อ')} ${r.location.at}`:t('ไม่มีพิกัด')}\n${t('บันทึกเมื่อ')} ${r.created}`;announce(t('กำลังเปิดแอปข้อความ คุณต้องกดส่งเอง • แอปนี้ไม่ทราบผลการส่ง SMS'));window.location.href=`sms:${recipient}?body=${encodeURIComponent(body)}`;});

$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({exported:new Date().toISOString(),prototype:true,records:rows},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='floodcare-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('clear').onclick=()=>{if(confirm(t('ลบเฉพาะข้อมูลในเครื่อง? ข้อมูลบนเซิร์ฟเวอร์ยังอยู่ และอาจโหลดกลับมาเมื่อเชื่อมต่อ'))){persist([]);announce(t('ลบข้อมูลในเครื่องแล้ว'));}};
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>announce(t('เตรียมเปิดหน้าแบบออฟไลน์ไม่สำเร็จ แต่ยังใช้หน้าที่เปิดอยู่ได้')));
$('language').onchange=e=>{lang=e.target.value==='en'?'en':'th';try{localStorage.setItem('floodcare-language',lang);}catch{}translateStatic();status();render();$('message').textContent='';if(locationData){$('coords').textContent=`${locationData.lat.toFixed(5)}, ${locationData.lng.toFixed(5)} • ±${Math.round(locationData.accuracy)} m`;}else{$('coords').textContent=t('ยังไม่มีพิกัด — กรอกจุดสังเกตให้ชัดเจนได้');}};
status();showTab('sos');

let owner='';
try{owner=localStorage.getItem('floodcare-owner')||newId();localStorage.setItem('floodcare-owner',owner);}catch{announce(t('จัดเก็บรหัสติดตามไม่ได้ กรุณาเปิดการจัดเก็บข้อมูลเว็บไซต์'));}
async function api(path,body){const response=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Owner':owner},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Server error');return data;}
async function sendRecord(id){const row=rows.find(r=>r.id===id);if(!row||row.sent)return;
 try{announce(t('กำลังส่งข้อมูล…'));const data=await api('/api/requests',row);if(persist(rows.map(r=>r.id===id?{...data.record,sent:true}:r)))announce(t('ถึงเซิร์ฟเวอร์แล้ว รอเจ้าหน้าที่เปิดดูและรับเรื่อง — ยังไม่ใช่การยืนยันว่ามีทีมออกช่วยเหลือ'));else announce(t('เซิร์ฟเวอร์รับคำขอแล้ว แต่บันทึกสำเนาในเครื่องไม่สำเร็จ')); }
 catch{announce(t('ส่งไม่สำเร็จ ข้อมูลยังอยู่ในเครื่อง กดลองส่งอีกครั้งเมื่อเชื่อมต่อได้'));}}
let refreshing=false;
async function refreshMine(){if(refreshing||!owner)return;refreshing=true;try{const data=await api('/api/requests');const map=new Map(rows.map(r=>[r.id,r]));for(const r of data.records)map.set(r.id,{...r,sent:true});const next=[...map.values()];if(JSON.stringify(next)!==JSON.stringify(rows))persist(next);}catch{}finally{refreshing=false;}}
$('records').addEventListener('click',e=>{if(e.target.dataset.send)sendRecord(e.target.dataset.send);});
for(const formId of ['sosForm','claimForm']){const form=$(formId);let previewURLs=[];form.elements.images.addEventListener('change',()=>{previewURLs.forEach(URL.revokeObjectURL);previewURLs=[];const box=$(formId==='sosForm'?'sosPreview':'claimPreview');box.replaceChildren();for(const file of [...form.elements.images.files].slice(0,2)){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>1024*1024)continue;const img=document.createElement('img');const url=URL.createObjectURL(file);previewURLs.push(url);img.src=url;img.alt=t('รูปภาพแนบ');box.append(img);}});}
setInterval(refreshMine,4000);window.addEventListener('online',refreshMine);refreshMine();
