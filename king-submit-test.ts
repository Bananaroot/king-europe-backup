// Supabase Edge Function: name king-submit-test
// Secrets are read server-side by Supabase, never placed on GitHub Pages.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const allowed = new Set(['https://bananaroot.github.io']);
Deno.serve(async (req) => {
  const origin=req.headers.get('origin')||'';
  const headers={'Access-Control-Allow-Origin':allowed.has(origin)?origin:'', 'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type, apikey, authorization','Content-Type':'application/json','Vary':'Origin'};
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST'||!allowed.has(origin))return new Response(JSON.stringify({error:'Not allowed'}),{status:403,headers});
  try{
    if(Number(req.headers.get('content-length')||0)>5000)return new Response(JSON.stringify({error:'Payload too large'}),{status:413,headers});
    const p=await req.json();
    if(p.consent!==true||p.test!=='king-benessere'||!Array.isArray(p.values)||p.values.length!==5||!p.values.every((v:unknown)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<=100))return new Response(JSON.stringify({error:'Invalid values or consent'}),{status:400,headers});
    const name=String(p.name||'').trim().slice(0,60), surname=String(p.surname||'').trim().slice(0,70),email=String(p.email||'').trim().slice(0,160);
    if(!name||!surname||!/^\S+@\S+\.\S+$/.test(email))return new Response(JSON.stringify({error:'Name surname and email required'}),{status:400,headers});
    const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
    const {error}=await db.from('king_test_clienti').insert({nome:name,cognome:surname,email,punteggi:p.values,data_test:(Number.isFinite(Date.parse(p.date))?new Date(p.date).toISOString():new Date().toISOString()),consenso:true,tipo_test:'king-benessere'});
    if(error)throw error;
    return new Response(JSON.stringify({ok:true}),{status:201,headers});
  }catch(_){return new Response(JSON.stringify({error:'Unable to store'}),{status:400,headers});}
});
