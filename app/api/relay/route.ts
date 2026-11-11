import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const json=(x:unknown,status=200)=>Response.json(x,{status});
export async function GET(req:Request){
 try{const user=req.headers.get('oai-authenticated-user-id');const db=env.DB!;
 const [scenes,reactions,comments]=await Promise.all([db.prepare('SELECT * FROM scenes ORDER BY created DESC LIMIT 500').all(),db.prepare('SELECT scene,kind,count(*) AS count FROM reactions GROUP BY scene,kind').all(),db.prepare('SELECT id,scene,author,body,created FROM comments ORDER BY created LIMIT 2000').all()]);
 const mine=user?await db.prepare('SELECT scene,kind FROM reactions WHERE user=?').bind(user).all():{results:[]};
 return json({scenes:scenes.results,reactions:reactions.results,comments:comments.results,mine:mine.results,user: user?{id:user,name:(req.headers.get('oai-authenticated-user-email')||'Creator').split('@')[0]}:null});
 }catch{return json({error:'Could not load Relay. Please try again.'},503)}
}
export async function POST(req:Request){
 const user=req.headers.get('oai-authenticated-user-id');if(!user)return json({error:'Sign in to create and participate.'},401);
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Invalid origin'},403);
 try{const b=await req.json() as Record<string,any>;const db=env.DB!;const author=String(b.author||'Creator').trim().slice(0,40)||'Creator';
 if(b.action==='create'){
 const title=String(b.title||'').trim(),body=String(b.body||'').trim();if(!title||title.length>100||!body||body.length>2000)return json({error:'Add a title (up to 100 characters) and scene (up to 2,000).'},400);
 if(b.parent&&!String(b.parent).startsWith('demo-')&&!(await db.prepare('SELECT id FROM scenes WHERE id=?').bind(b.parent).first()))return json({error:'Original scene not found'},404);
 const id=crypto.randomUUID(); const media=b.media&&String(b.media).startsWith('/api/media/'+user+'/')?String(b.media):null;
 await db.prepare('INSERT INTO scenes (id,parent,title,body,genre,author,user_id,media,media_type,created) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(id,b.parent||null,title,body,['Sci-fi','Comedy','Mystery','Drama','Fantasy'].includes(b.genre)?b.genre:'Drama',author,user,media,media?String(b.mediaType||''):null,Date.now()).run();return json({id});
 }
 if(b.action==='react'){
 if(!['like','save'].includes(b.kind))return json({error:'Invalid reaction'},400);
 const current=await db.prepare('SELECT scene FROM reactions WHERE scene=? AND user=? AND kind=?').bind(b.scene,user,b.kind).first();
 await db.prepare(current?'DELETE FROM reactions WHERE scene=? AND user=? AND kind=?':'INSERT INTO reactions (scene,user,kind) VALUES (?,?,?)').bind(b.scene,user,b.kind).run();return json({ok:true});
 }
 if(b.action==='comment'){const body=String(b.body||'').trim();if(!body||body.length>500)return json({error:'Comments must be 1–500 characters.'},400);await db.prepare('INSERT INTO comments (id,scene,user,author,body,created) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),b.scene,user,author,body,Date.now()).run();return json({ok:true});}
 return json({error:'Unknown action'},400);
 }catch{return json({error:'Your change could not be saved. Try again.'},500)}
}
