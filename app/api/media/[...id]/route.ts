import {env} from 'cloudflare:workers';
export async function GET(req:Request,{params}:{params:Promise<{id:string[]}>}){
 const {id}=await params;const key=id.join('/');const range=req.headers.get('range');const obj=await env.BUCKET!.get(key,range?{range:req.headers}:undefined);if(!obj)return new Response('Not found',{status:404});
 const headers=new Headers({'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'private,max-age=3600','Accept-Ranges':'bytes'});
 const r=obj.range;if(range&&r&&'offset' in r&&'length' in r&&r.offset!==undefined&&r.length!==undefined){headers.set('Content-Range',`bytes ${r.offset}-${r.offset+r.length-1}/${obj.size}`);headers.set('Content-Length',String(r.length));return new Response(obj.body,{status:206,headers})}
 if(obj.size!==undefined)headers.set('Content-Length',String(obj.size));return new Response(obj.body,{headers});
}
