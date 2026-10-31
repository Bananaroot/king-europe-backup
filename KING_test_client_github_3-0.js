/* KING BENESSERE 3.0 — correzione mirata lettura/scrittura.
   Usa la configurazione GIA' caricata dalla pagina (NON include token).
   NOTA: una credenziale in un sito pubblico espone i dati: solo test fittizi.
   Non modifica il motore PDF, le immagini e i consigli eBay. */
(()=>{'use strict';
const cfg=window.KING_CLIENTI_CONFIG||{};
const repo=String(cfg.repo||'king-test-benessere-dati');
const owner=String(cfg.owner||'Bananaroot');
const branch=String(cfg.branch||'main');
// Nome effettivo visibile nel repository dell'utente.
const REGISTRY='stazione-test.json';
const CLICKS='clic-prodotti.json';
const endpoint='https://king-save.invalid/api/test';
const api=(path)=>`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
const headers=()=>({'Accept':'application/vnd.github+json','Authorization':'Bearer '+String(cfg.token||''),'X-GitHub-Api-Version':'2022-11-28'});
const encode=s=>btoa(Array.from(new TextEncoder().encode(s),x=>String.fromCharCode(x)).join(''));
const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const pause=t=>new Promise(resolve=>setTimeout(resolve,t));
function authorized(){if(!cfg.token||String(cfg.token).startsWith('INCOLLA_'))throw Error('TOKEN_MANCANTE');}
function niceError(code,raw=''){
 if(code===401)return 'GitHub 401: token non valido o revocato';
 if(code===403)return 'GitHub 403: accesso negato, permessi insufficienti o limite richieste';
 if(code===404)return 'GitHub 404: repository privato non accessibile con questo token o file non trovato';
 if(code===409)return 'GitHub 409: conflitto di modifica, riprovare';
 if(code===422)return 'GitHub 422: JSON o SHA non accettati';
 return `GitHub HTTP ${code}${raw?' · '+raw.slice(0,120):''}`;
}
async function read(path){authorized();let response;
 try{response=await fetch(api(path)+'?ref='+encodeURIComponent(branch)+'&t='+Date.now(),{headers:headers(),cache:'no-store'});}catch(e){throw Error('Rete GitHub non raggiungibile: '+e.message)}
 if(response.status===404)throw Error(niceError(404));
 if(!response.ok)throw Error(niceError(response.status));
 const data=await response.json();
 if(!data.content)throw Error('GitHub: risposta JSON non disponibile');
 let obj;try{obj=JSON.parse(decode(data.content));}catch(e){throw Error('Il file '+path+' non contiene JSON valido')}
 return {sha:data.sha,obj};
}
async function modify(path,change){authorized();for(let attempt=0;attempt<4;attempt++){
 const current=await read(path);const next=change(current.obj);
 if(next===null)return {already:true,obj:current.obj};
 const payload={message:'KING BENESSERE - registrazione '+path,branch,sha:current.sha,content:encode(JSON.stringify(next,null,2))};
 let response;try{response=await fetch(api(path),{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify(payload)});}catch(e){throw Error('Rete GitHub non raggiungibile: '+e.message)}
 if(response.ok)return {already:false,obj:next};
 if([409,422].includes(response.status)&&attempt<3){await pause(250*(attempt+1));continue}
 throw Error(niceError(response.status));
 }throw Error('Archivio occupato: riprovare');}
function entries(db){if(Array.isArray(db))return db;
 if(Array.isArray(db.registrazioni))return db.registrazioni;
 if(Array.isArray(db.tests))return db.tests;
 return [];
}
async function save(data){if(!data||!Array.isArray(data.values))throw Error('Risultato assente');
 const name=String(data.name||'').trim(),surname=String(data.surname||'').trim(),email=String(data.email||'').trim().toLowerCase();
 if(!name||!surname||!email)throw Error('Compila nome cognome ed email');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Email non valida');
 const date=String(data.date||new Date().toISOString());
 const id='v2-3.0:'+email+':'+date;
 const record={id,version:'v2-3.0',name,surname,email,date,values:data.values,areas:data.areas||[],consent:true,received_at:new Date().toISOString()};
 const updated=await modify(REGISTRY,db=>{
  if(!db||typeof db!=='object'||Array.isArray(db))throw Error('Struttura JSON incompatibile: atteso un oggetto');
  const arr=entries(db);
  if(arr.some(r=>r.id===id))return null;
  db.registrazioni=arr;
  db.registrazioni.push(record);db.ultimo_aggiornamento=new Date().toISOString();return db;
 });
 const count=entries(updated.obj).filter(x=>String(x.email||'').toLowerCase()===email).length;
 return {count};
}
let lastErr='';
function showError(message){lastErr=message;setTimeout(()=>{const el=document.getElementById('km-save-status');if(el)el.textContent='Salvataggio GitHub fallito: '+message+'. Il risultato resta sul telefono.';},40);}
// Intercettazione della sola richiesta V2 originale, senza cambiare gli altri fetch.
const originalFetch=window.fetch.bind(window);
window.fetch=function(input,options){const url=typeof input==='string'?input:input?.url;
 if(url!==endpoint||String(options?.method||'GET').toUpperCase()!=='POST')return originalFetch(input,options);
 let obj;try{obj=JSON.parse(options.body);}catch(e){showError('dati test non validi');return Promise.resolve(new Response('bad request',{status:400}))}
 return save(obj).then(result=>{lastErr='';return new Response(JSON.stringify({ok:true,count:result.count}),{status:200,headers:{'Content-Type':'application/json'}});}).catch(err=>{showError(err.message||String(err));return new Response(JSON.stringify({error:String(err.message||err)}),{status:500,headers:{'Content-Type':'application/json'}});});
};
// Clic su eBay registrati senza bloccare la navigazione.
async function click(href,title){const url=new URL(href,location.href).href;
 return modify(CLICKS,db=>{
  if(!db||typeof db!=='object'||Array.isArray(db))throw Error('Struttura JSON clic incompatibile');
  db.links=Array.isArray(db.links)?db.links:[];
  let item=db.links.find(x=>x.url===url);
  if(!item){item={url,nome:title||'Prodotto eBay',clic:0};db.links.push(item);}
  item.clic=Number(item.clic||0)+1;
  db.totale=Number(db.totale||0)+1;db.ultimo_aggiornamento=new Date().toISOString();return db;
 });
}
document.addEventListener('click',e=>{
 const a=e.target.closest?.('a[href]');if(!a||!a.closest('#km-report'))return;
 let u;try{u=new URL(a.href,location.href)}catch{return}
 if(!/(^|\.)ebay\.(io|it|com|de|fr|es)$/i.test(u.hostname))return;
 click(a.href,a.textContent?.trim().slice(0,90)).catch(()=>{});
},true);
window.KING_TEST_GITHUB={read,save,click,registry:REGISTRY,clicks:CLICKS,getLastError:()=>lastErr};
})();
