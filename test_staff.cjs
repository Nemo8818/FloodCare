// Staff alert logic without a browser. Run node test_staff.cjs.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const nodes={},saved=new Map();function el(id){return nodes[id]??={value:id==='filter'?'all':'',textContent:'',innerHTML:'',hidden:true};}
const sample={id:'SOS-example',type:'SOS',name:'<script>bad</script>',phone:'000',address:'Sample',reason:'มีผู้บาดเจ็บ',people:2,created:'2026-11-13T10:00:00Z',status:'ถึงเซิร์ฟเวอร์แล้ว — รอเจ้าหน้าที่รับเรื่อง',attachments:[],history:[]};
const ctx=vm.createContext({console,NodeFilter:{SHOW_TEXT:4},document:{documentElement:{},createTreeWalker:()=>({nextNode:()=>false}),querySelectorAll:()=>[],getElementById:el},window:{},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},sessionStorage:{getItem:()=>null,removeItem(){}},setInterval(){},AbortSignal,Date,fetch:async()=>({ok:true,json:async()=>({records:[sample]})})});
vm.runInContext(fs.readFileSync(__dirname+'/i18n.js','utf8'),ctx);vm.runInContext(fs.readFileSync(__dirname+'/staff.js','utf8'),ctx);
(async()=>{await vm.runInContext("session='test';lang='en';poll()",ctx);assert.equal(nodes.dashboard.hidden,false);assert.equal(nodes.urgent.hidden,false);assert.match(nodes.urgentTitle.textContent,/New SOS: 1/);assert.match(nodes.staffRecords.innerHTML,/&lt;script&gt;/);assert(!nodes.staffRecords.innerHTML.includes('<script>bad'));
nodes.urgent.hidden=true;await vm.runInContext('poll()',ctx);assert.equal(nodes.urgent.hidden,true);assert.equal(JSON.parse(saved.get('floodcare-seen-sos')).length,1);
ctx.fetch=async()=>{throw Error('disconnected');};await vm.runInContext('poll()',ctx);assert.match(nodes.staffConnection.textContent,/Disconnected/);
console.log('PASS: authenticated dashboard rendering, new SOS alert, seen-ID deduplication, escaped content, disconnect state.');})();
