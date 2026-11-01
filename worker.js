/* KING BENESSERE · Worker ricezione + lettura amministrativa.
   Repository privato, senza token GitHub nei file pubblici.
   Richiede segreti GITHUB_TOKEN e ADMIN_KEY su Cloudflare. */
const REPO = 'Bananaroot/king-test-benessere-dati';
const FILE = 'archivio-test.json';
const CLICKS = 'clic-prodotti.json';
const ORIGIN = 'https://bananaroot.github.io';
const cors = {
  'Access-Control-Allow-Origin': ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-King-Admin',
  'Vary': 'Origin',
  'Cache-Control': 'no-store'
};
const reply = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' }
});
function encode(text) {
  const bytes = new TextEncoder().encode(text);
  let result=''; for(const byte of bytes) result+=String.fromCharCode(byte);
  return btoa(result);
}
function decode(text) {
  return new TextDecoder().decode(Uint8Array.from(atob(text.replace(/\s/g,'')), c=>c.charCodeAt(0)));
}
function githubHeaders(env) {
  return {
    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'king-benessere-save',
    'Content-Type': 'application/json'
  };
}
async function readGitHub(env, path) {
  const api=`https://api.github.com/repos/${REPO}/contents/${path}`;
  const res=await fetch(api+'?ref=main', {headers:githubHeaders(env),cache:'no-store'});
  if(res.status===404) return {api,sha:null,obj:null};
  if(!res.ok) throw new Error(`GitHub lettura HTTP ${res.status}`);
  const file=await res.json();
  if(!file.content) throw new Error('Risposta GitHub senza contenuto JSON');
  return {api,sha:file.sha,obj:JSON.parse(decode(file.content))};
}
export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
    if(request.method==='GET' && url.pathname==='/health')
      return reply({ok:true,service:'KING BENESSERE SAVE'});
    if(!env.GITHUB_TOKEN) return reply({ok:false,error:'Segreto GITHUB_TOKEN mancante'},503);

    // Lettura dei dati personali consentita solo con una chiave amministrativa separata.
    if(request.method==='GET' && url.pathname==='/admin') {
      if(!env.ADMIN_KEY || String(env.ADMIN_KEY).length<20)
        return reply({ok:false,error:'Segreto ADMIN_KEY non configurato (minimo 20 caratteri)'},503);
      const supplied=request.headers.get('X-King-Admin')||'';
      if(supplied!==env.ADMIN_KEY) return reply({ok:false,error:'Accesso amministrativo non autorizzato'},401);
      try {
        const registry=await readGitHub(env,FILE);
        const clicks=await readGitHub(env,CLICKS);
        return reply({ok:true,registrazioni:registry.obj||{registrazioni:[]},clic:clicks.obj||{totale:0,links:[]}});
      } catch(e) {return reply({ok:false,error:e.message},502);}
    }

    if(request.method!=='POST' || url.pathname!=='/save')
      return reply({ok:false,error:'Percorso non valido'},404);
    if(request.headers.get('Origin')!==ORIGIN)
      return reply({ok:false,error:'Origine non autorizzata'},403);
    try {
      const raw=await request.text();
      if(raw.length>12000) return reply({ok:false,error:'Dati troppo grandi'},413);
      const data=JSON.parse(raw);
      const name=String(data.name||'').trim().slice(0,60);
      const surname=String(data.surname||'').trim().slice(0,70);
      const email=String(data.email||'').trim().toLowerCase().slice(0,160);
      if(!data.consent || !name || !surname ||
         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
         !Array.isArray(data.values) || data.values.length!==5 ||
         !data.values.every(v=>Number.isFinite(Number(v)) && Number(v)>=0 && Number(v)<=100))
        return reply({ok:false,error:'Registrazione non valida'},400);
      const record={
        id:crypto.randomUUID(),
        version:String(data.version||'v2-3.0').slice(0,30),
        name,surname,email,values:data.values.map(Number),
        areas:Array.isArray(data.areas)?data.areas.slice(0,5).map(x=>String(x).slice(0,80)):[],
        consent:true,received_at:new Date().toISOString()
      };
      for(let attempt=0;attempt<5;attempt++) {
        const old=await readGitHub(env,FILE);
        const db=old.obj||{versione:'1.0',sistema:'KING TEST BENESSERE',clienti:[],registrazioni:[]};
        if(!Array.isArray(db.registrazioni)) db.registrazioni=[];
        db.registrazioni.push(record);
        db.ultimo_aggiornamento=new Date().toISOString();
        const payload={message:'KING Benessere - nuova registrazione',branch:'main',content:encode(JSON.stringify(db,null,2))};
        if(old.sha) payload.sha=old.sha;
        const put=await fetch(old.api, {method:'PUT',headers:githubHeaders(env),body:JSON.stringify(payload)});
        if(put.ok) return reply({ok:true,saved:true,count:db.registrazioni.filter(x=>x.email===email).length});
        if((put.status===409||put.status===422)&&attempt<4) continue;
        return reply({ok:false,error:`GitHub scrittura HTTP ${put.status}`},502);
      }
      return reply({ok:false,error:'Archivio occupato'},503);
    } catch(e) {
      return reply({ok:false,error:'Errore durante il salvataggio'},500);
    }
  }
};
