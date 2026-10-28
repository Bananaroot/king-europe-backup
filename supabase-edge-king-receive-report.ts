// Deploy as Supabase Edge Function "king-receive-report".
// Secrets SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY remain on the server.
import { createClient } from 'npm:@supabase/supabase-js@2';
const origin='https://bananaroot.github.io';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST'||req.headers.get('origin')!==origin)return new Response(JSON.stringify({error:'not allowed'}),{status:403,headers});
 try{
  const length=Number(req.headers.get('content-length')||0);if(length>5000)return new Response('{}',{status:413,headers});
  const x=await req.json();
  if(x.consent!==true||x.test!=='king-benessere'||!Array.isArray(x.values)||x.values.length!==5||!x.values.every((n:unknown)=>Number.isInteger(n as number)&&(n as number)>=0&&(n as number)<=100))return new Response('{}',{status:400,headers});
  const name=String(x.name||'').slice(0,60),surname=String(x.surname||'').slice(0,70),email=String(x.email||'').slice(0,160);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return new Response('{}',{status:400,headers});
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const {error}=await db.from('king_wellbeing_submissions').insert({consent:true,name,surname,email,report:{test:x.test,values:x.values,date:new Date().toISOString()}});
  if(error)throw error;return new Response(JSON.stringify({ok:true}),{headers});
 }catch(e){return new Response(JSON.stringify({error:'failed'}),{status:500,headers})}
});
