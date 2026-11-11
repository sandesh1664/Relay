import {env} from 'cloudflare:workers';
export async function POST(req:Request){
 const user=req.headers.get('oai-authenticated-user-id');if(!user)return Response.json({error:'Sign in to upload'}, {status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const type=req.headers.get('content-type')||'';if(!['video/mp4','video/webm','video/quicktime','image/jpeg','image/png','image/webp','audio/mpeg','audio/wav','audio/webm','audio/mp4','audio/ogg'].includes(type))return Response.json({error:'Choose an MP4, WebM, MOV, JPG, PNG, WebP or supported audio file.'},{status:400});
 if(Number(req.headers.get('content-length'))>20*1024*1024)return Response.json({error:'Maximum upload is 20 MB.'},{status:413});
 const data=await req.arrayBuffer();if(data.byteLength>20*1024*1024)return Response.json({error:'Maximum upload is 20 MB.'},{status:413});
 const key=user+'/'+crypto.randomUUID();await env.BUCKET!.put(key,data,{httpMetadata:{contentType:type}});return Response.json({url:'/api/media/'+key,type});
}
