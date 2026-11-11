import {build} from 'esbuild';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(x=>x.endsWith('.sql')))sqlite.exec(readFileSync('drizzle/'+f,'utf8'));
const objects=new Map();globalThis.__testEnv={DB:{prepare(sql){let args=[];const stmt=sqlite.prepare(sql);return {bind(...a){args=a;return this},async all(){return {results:stmt.all(...args)}},async first(){return stmt.get(...args)||null},async run(){return stmt.run(...args)}}}},BUCKET:{async put(k,v,o){objects.set(k,{body:v,httpMetadata:o.httpMetadata})},async get(k){return objects.get(k)}}};
async function load(path){const r=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false,plugins:[{name:'test-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__testEnv',loader:'js'}))}}]});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))}
const api=await load('app/api/relay/route.ts');const upload=await load('app/api/media/route.ts');const media=await load('app/api/media/[...id]/route.ts');
function req(body,user='test-a',origin='https://relay.test'){return new Request('https://relay.test/api/relay',{method:'POST',headers:{'content-type':'application/json',origin,...(user?{'oai-authenticated-user-id':user}:{})},body:JSON.stringify(body)})}
assert.equal((await api.POST(req({action:'create'},''))).status,401);
assert.equal((await api.POST(req({action:'create'},'test-a','https://other.test'))).status,403);
assert.equal((await api.POST(req({action:'create',title:'',body:'x'}))).status,400);
const root=await (await api.POST(req({action:'create',title:'Test beginning',body:'An open door.',genre:'Mystery',author:'Tester'}))).json();assert.ok(root.id);
const child=await (await api.POST(req({action:'create',parent:root.id,title:'A different turn',body:'The door closes.',genre:'Mystery',author:'Tester'}))).json();assert.ok(child.id);
assert.equal((await api.POST(req({action:'create',parent:'missing',title:'x',body:'x'}))).status,404);
await api.POST(req({action:'react',scene:root.id,kind:'save'}));await api.POST(req({action:'react',scene:root.id,kind:'like'}));await api.POST(req({action:'comment',scene:root.id,body:'A good beginning'}));
let state=await (await api.GET(new Request('https://relay.test/api/relay',{headers:{'oai-authenticated-user-id':'test-a'}}))).json();assert.equal(state.scenes.length,2);assert.equal(state.scenes.find(x=>x.id===child.id).parent,root.id);assert.equal(state.mine.length,2);assert.equal(state.comments.length,1);
state=await (await api.GET(new Request('https://relay.test/api/relay',{headers:{'oai-authenticated-user-id':'test-b'}}))).json();assert.equal(state.mine.length,0);
await api.POST(req({action:'react',scene:root.id,kind:'like'}));state=await (await api.GET(new Request('https://relay.test/api/relay',{headers:{'oai-authenticated-user-id':'test-a'}}))).json();assert.equal(state.mine.length,1);
const up=await upload.POST(new Request('https://relay.test/api/media',{method:'POST',headers:{origin:'https://relay.test','oai-authenticated-user-id':'test-a','content-type':'image/png'},body:new Uint8Array([1,2,3])}));assert.equal(up.status,200);const saved=await up.json();const image=await media.GET(new Request('https://relay.test'+saved.url),{params:Promise.resolve({id:saved.url.replace('/api/media/','').split('/')})});assert.equal(image.headers.get('content-type'),'image/png');assert.equal((await image.arrayBuffer()).byteLength,3);
assert.equal((await upload.POST(new Request('https://relay.test/api/media',{method:'POST',headers:{origin:'https://relay.test','oai-authenticated-user-id':'test-a','content-type':'text/html'},body:'<script/>'}))).status,400);
console.log('PASS: authentication, origin protection, validation, persisted scenes and branches, per-user saves, reaction toggling, comments, media storage and retrieval, upload type rejection.');
