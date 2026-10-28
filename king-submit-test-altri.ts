import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const ALLOWED=new Set(['https://bananaroot.github.io']);
const baseHeaders=(origin:string)=>({'Access-Control-Allow-Origin':ALLOWED.has(origin)?origin:'','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type','Content-Type':'application/json','Vary':'Origin'});
Deno.serve(async req=>{
  const origin=req.headers.get('origin')||'';
  const headers=baseHeaders(origin);
  if(req.method==='OPTIONS') return new Response(null,{status:204,headers});
  if(req.method!=='POST'||!ALLOWED.has(origin))return new Response(JSON.stringify({ok:false}),{status:403,headers});
  try {
    if(Number(req.headers.get('content-length')||0)>5000)throw new Error('size');
    const p=await req.json();
    if(!['integratori','alimentazione'].includes(p.test)||p.consent!==true||!Array.isArray(p.values)||p.values.length!==5||!p.values.every((n:unknown)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<=2))throw new Error('invalid');
    const name=String(p.name||'').trim().slice(0,60),surname=String(p.surname||'').trim().slice(0,70),email=String(p.email||'').trim().slice(0,160);
    if(!name||!surname||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('identity');
    const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
    const {error}=await db.from('king_test_clienti').insert({nome:name,cognome:surname,email,punteggi:p.values,data_test:new Date().toISOString(),consenso:true,tipo_test:'king-'+p.test});
    if(error)throw error;
    return new Response(JSON.stringify({ok:true}),{status:201,headers});
  }catch(_){return new Response(JSON.stringify({ok:false}),{status:400,headers});}
});
