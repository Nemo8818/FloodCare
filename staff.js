'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STAGES=['รับเรื่องแล้ว','ขอข้อมูลเพิ่ม','นัดตรวจพื้นที่','กำลังดำเนินการ','ปิดงาน'];
let session='';try{session=sessionStorage.getItem('floodcare-staff')||'';}catch{}
let records=[],busy=false,audio=null,alertsEnabled=false;
let seen=new Set();try{seen=new Set(JSON.parse(localStorage.getItem('floodcare-seen-sos')||'[]'));}catch{}
function say(s){$('staffMessage').textContent=s;}
async function staffApi(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Staff-Session':session},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(12000)});const d=await r.json();if(!r.ok){const e=Error(d.error||'Server error');e.status=r.status;throw e;}return d;}
function saveSeen(){try{localStorage.setItem('floodcare-seen-sos',JSON.stringify([...seen]));}catch{}}
function render(){
 const q=$('search').value.toLocaleLowerCase(),f=$('filter').value;
 const view=records.filter(r=>(f==='all'||r.type===f)&&[r.id,r.name,r.address].join(' ').toLocaleLowerCase().includes(q)).sort((a,b)=>(b.type==='SOS')-(a.type==='SOS')||Boolean(b.vulnerable)-Boolean(a.vulnerable)||b.created.localeCompare(a.created));
 $('stats').innerHTML=`<div>${t('คำขอทั้งหมด')}<b>${records.length}</b></div><div>SOS<b>${records.filter(r=>r.type==='SOS').length}</b></div><div>${t('ข้อมูลเยียวยา')}<b>${records.filter(r=>r.type==='CLAIM').length}</b></div>`;
 $('staffRecords').innerHTML=view.map(r=>`<article class="record ${r.type==='SOS'?'sos':''}"><span class="badge">${r.type==='SOS'?'SOS':t('เยียวยา')}</span><h3>${esc(r.id)}</h3><p><b>${esc(r.name)}</b> • ${esc(r.phone)}<br>${esc(r.address)}<br>${esc(r.type==='SOS'?t(r.reason):r.reason)}</p><p>${r.type==='SOS'?`${t('จำนวน')}: ${esc(r.people)} • ${r.vulnerable?t('มีผู้ต้องการความช่วยเหลือพิเศษ'):t('ไม่ระบุผู้ต้องการความช่วยเหลือพิเศษ')}`:`${t('วันที่เกิดเหตุ')}: ${esc(r.date)}`}</p><p>${t('พิกัด')}: ${r.location?`${esc(r.location.lat)}, ${esc(r.location.lng)} (±${esc(Math.round(r.location.accuracy))} m) ${esc(new Date(r.location.at).toLocaleString(locale()))}`:t('ไม่มีพิกัด')}</p><div class="photos">${(r.attachments||[]).filter(a=>/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(a.data)).map(a=>`<img src="${a.data}" alt="${t('รูปภาพแนบ')}" loading="lazy">`).join('')}</div><p class="badge">${esc(t(r.status))}</p><p>${t('ถึงเซิร์ฟเวอร์เมื่อ')}: ${esc(new Date(r.created).toLocaleString(locale()))}</p><label>${t('เปลี่ยนสถานะ')}<select data-id="${esc(r.id)}"><option value="">${t('เลือกสถานะ')}</option>${STAGES.map(s=>`<option value="${s}">${t(s)}</option>`).join('')}</select></label><details><summary>${t('ประวัติสถานะ')}</summary>${(r.history||[]).map(h=>`<p>${esc(t(h.status))} • ${esc(new Date(h.at).toLocaleString(locale()))}</p>`).join('')||t('ยังไม่มีการเปลี่ยนสถานะ')}</details></article>`).join('')||'<p>'+t('ไม่พบรายการ')+'</p>';
}
function alertSOS(list){
 if(!list.length)return;
 $('urgent').hidden=false;$('urgentTitle').textContent=t('SOS ใหม่')+': '+list.length;
 if(alertsEnabled&&audio){try{const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.frequency.value=880;gain.gain.value=.12;osc.start();osc.stop(audio.currentTime+.5);}catch{}}
 if(alertsEnabled&&'Notification' in window&&Notification.permission==='granted'){try{new Notification('FloodCare SOS',{body:t('มีคำขอฉุกเฉินใหม่ โปรดตรวจหน้าเจ้าหน้าที่'),tag:'floodcare-sos'});}catch{}}
}
async function poll(){if(!session||busy)return;const activeSession=session;busy=true;try{
 const data=await staffApi('/api/requests');if(session!==activeSession)return;records=data.records;
 $('loginPanel').hidden=true;$('dashboard').hidden=false;
 $('staffConnection').textContent=t('เชื่อมต่อเซิร์ฟเวอร์แล้ว')+' • '+new Date().toLocaleTimeString(locale());
 const fresh=records.filter(r=>r.type==='SOS'&&!seen.has(r.id));fresh.forEach(r=>seen.add(r.id));saveSeen();render();alertSOS(fresh);
 }catch(e){$('staffConnection').textContent=t('ขาดการเชื่อมต่อ — ยังไม่ได้รับข้อมูลล่าสุด');if(e.status===401){session='';try{sessionStorage.removeItem('floodcare-staff');}catch{}$('dashboard').hidden=true;$('loginPanel').hidden=false;records=[];render();say(t('กรุณาเข้าสู่ระบบอีกครั้ง'));}}
 finally{busy=false;}}
$('loginForm').onsubmit=async e=>{e.preventDefault();try{const data=await staffApi('/api/login',{password:$('password').value.trim()});session=data.session;try{sessionStorage.setItem('floodcare-staff',session);}catch{}$('password').value='';say('');await poll();}catch(error){say(error.status===401?t('รหัสไม่ตรงกับเซิร์ฟเวอร์นี้ ตรวจว่าเปิดด้วย START_FLOODCARE และใช้พอร์ต 8765'):error.status===429?t('ลองเข้าสู่ระบบหลายครั้ง กรุณารอ 1 นาที'):t('เชื่อมต่อไม่ได้ โปรดเปิด START_FLOODCARE ค้างไว้')+' ('+(error.status||'network')+')');}};
$('logout').onclick=async()=>{try{await staffApi('/api/logout',{});}catch{}session='';try{sessionStorage.removeItem('floodcare-staff');}catch{}records=[];render();$('dashboard').hidden=true;$('loginPanel').hidden=false;$('urgent').hidden=true;$('staffConnection').textContent=t('ยังไม่ได้เข้าสู่ระบบ');};
$('staffRecords').onchange=async e=>{const id=e.target.dataset.id;if(!id||!STAGES.includes(e.target.value))return;const status=e.target.value; e.target.disabled=true;try{await staffApi('/api/status',{id,status});say(t('อัปเดตสถานะแล้ว'));await poll();}catch{say(t('อัปเดตไม่สำเร็จ กรุณาลองอีกครั้ง'));e.target.disabled=false;}};
$('enableAlerts').onclick=async()=>{alertsEnabled=true;try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio=audio||new AC();await audio.resume();}if('Notification' in window&&Notification.permission==='default')await Notification.requestPermission();}catch{}say(t('เปิดการแจ้งเตือนแล้ว เสียงและป๊อปอัปขึ้นกับสิทธิของเบราว์เซอร์ โปรดเปิดหน้านี้ค้างไว้'));};
$('dismiss').onclick=()=>{$('urgent').hidden=true;};$('refresh').onclick=poll;
$('search').oninput=render;$('filter').onchange=render;
$('language').onchange=e=>{lang=e.target.value==='en'?'en':'th';try{localStorage.setItem('floodcare-language',lang);}catch{}translateStatic();render();say('');if(!session)$('staffConnection').textContent=t('ยังไม่ได้เข้าสู่ระบบ');else poll();};
setInterval(poll,3000);poll();
