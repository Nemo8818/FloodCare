// Run: node test_app.cjs. Node built-ins only; no browser required.
const {readFileSync}=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes={},storage=new Map();
function node(id){return nodes[id]??={value:'',textContent:'',innerHTML:'',hidden:false,replaceChildren(){},addEventListener(){},elements:{images:{addEventListener(){},files:[]}},classList:{toggle(){}}};}
const ctx=vm.createContext({console,NodeFilter:{SHOW_TEXT:4},document:{documentElement:{},createTreeWalker:()=>({nextNode:()=>false}),querySelectorAll:()=>[],getElementById:node,querySelector:()=>node('nav')},navigator:{onLine:false},window:{addEventListener(){},location:{}},location:{protocol:'file:'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},crypto:require('node:crypto').webcrypto,Date,alert(){},setTimeout,setInterval(){},URL,Blob,AbortSignal,fetch:()=>Promise.reject(Error('offline'))});
vm.runInContext(readFileSync(__dirname+'/i18n.js','utf8'),ctx);
vm.runInContext(readFileSync(__dirname+'/app.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`persist([{id:'SOS-test',type:'SOS',name:'<img src=x>',phone:'000',people:3,address:'บ้านสมมติ',reason:'มีผู้บาดเจ็บ',status:'บันทึกในเครื่อง — ยังไม่ส่ง',created:new Date().toISOString(),attachments:[]}])`);
assert(!nodes.records.innerHTML.includes('<img src=x>'));assert(nodes.records.innerHTML.includes('&lt;img'));
run("lang='en';render()");assert.match(nodes.records.innerHTML,/Saved on this device — not sent/);assert.match(nodes.records.innerHTML,/Retry sending/);assert.match(nodes.records.innerHTML,/Someone is injured/);assert.match(nodes.records.innerHTML,/บ้านสมมติ/);
run("$('language').onchange({target:{value:'en'}})");assert.equal(storage.get('floodcare-language'),'en');
const persisted=JSON.parse(storage.get('floodcare-v1'));assert.equal(persisted[0].status,'บันทึกในเครื่อง — ยังไม่ส่ง');
ctx.localStorage.setItem=()=>{throw Error('quota');};assert.equal(run('persist([])'),false);assert.equal(run('rows.length'),1);
(async()=>{await run("sendRecord('SOS-test')");assert.match(nodes.message.textContent,/Sending failed/);assert.equal(run('rows[0].sent'),undefined);console.log('PASS: language, escaping, local persistence, no false send on network failure, storage failure.');})();
