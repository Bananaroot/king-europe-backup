/* KING GitHub SYNC - VERSIONE DI PROVA. Non inserire token nel file pubblico. */
(()=>{'use strict';
const KEY='king_europe_manager_EMERGENZA_2026_v1';
const CFG='king_sync_cfg_v1',Q='king_sync_queue_v1',LAST='king_sync_last_v1';
const REMOTE='king-sync-test/archivio-sync.json';
const $=s=>document.querySelector(s);
const clone=x=>JSON.parse(JSON.stringify(x));
const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const cfg=()=>Object.assign({owner:'Bananaroot',repo:'king-sync-test',branch:'main',enabled:true},read(CFG,{}));
const token=()=>sessionStorage.getItem('KING_SYNC_TOKEN')||'';
const st=(t,bad)=>{const el=$('#king-sync-status');if(el){el.textContent=t;el.style.color=bad?'#b91c1c':'#166534'}};
const auth=()=>{if(!token())throw Error('Token mancante: inseriscilo nel riquadro SYNC.');return {'Authorization':'Bearer '+token(),'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}};
const api=()=>{const c=cfg();if(c.repo==='king-europe-backup')throw Error('Non usare il repository pubblico per dati privati');return `https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/contents/${REMOTE}?ref=${encodeURIComponent(c.branch)}`};
const b64=s=>{let b='';for(const x of new TextEncoder().encode(s))b+=String.fromCharCode(x);return btoa(b)};
const un64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const id=()=>crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2);
async function remoteRead(){const r=await fetch(api(),{headers:auth(),cache:'no-store'});if(r.status===404)return{sha:null,doc:null};if(!r.ok)throw Error('GitHub lettura HTTP '+r.status);const j=await r.json();let encoded=j.content;
if(!encoded){const c=cfg();const blob=await fetch(`https://api.github.com/repos/${encodeURIComponent(c.owner)}/${encodeURIComponent(c.repo)}/git/blobs/${encodeURIComponent(j.sha)}`,{headers:auth(),cache:'no-store'});if(!blob.ok)throw Error('GitHub Blob HTTP '+blob.status);const bj=await blob.json();encoded=bj.content;}
if(!encoded)throw Error('GitHub non ha restituito i dati del JSON');const doc=JSON.parse(un64(encoded));if(!doc||!doc.base||!Array.isArray(doc.events))throw Error('Archivio remoto non compatibile');return{sha:j.sha,doc}}
async function remoteWrite(sha,doc){const c=cfg(),url=api().split('?')[0];const b={message:'KING SYNC: operazioni magazzino',content:b64(JSON.stringify(doc)),branch:c.branch};if(sha)b.sha=sha;const r=await fetch(url,{method:'PUT',headers:{...auth(),'Content-Type':'application/json'},body:JSON.stringify(b)});if(!r.ok)throw Error('GitHub scrittura HTTP '+r.status+' '+(await r.text()).slice(0,130));}
function local(){return read(KEY,null)}
const listKeys=new Set(['stock','orders','products','accounts','tasks','boxes','ideas','strategicStock']);
const noImg=o=>{const c=clone(o);delete c.imageUrl;return c};
const sig=o=>JSON.stringify(o);
function diff(old,now){const items=[];const ts=new Date().toISOString();const make=(field,kind,x,extra={})=>items.push({id:id(),ts,field,kind,...x,...extra});
for(const field of Object.keys(now)){
 if(field==='kingSyncStockLedger')continue;
 const a=old[field],b=now[field];
 if(listKeys.has(field)&&Array.isArray(a)&&Array.isArray(b)){
  const am=new Map(a.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
  const bm=new Map(b.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
  if(am.size!==a.length||bm.size!==b.length){if(sig(a)!==sig(b))make(field,'replace',{value:b});continue}
  for(const [k,v] of bm){const prev=am.get(k);if(!prev){make(field,'upsert',{key:k,value:v});continue}
   if(field==='stock'&&typeof prev.qty==='number'&&typeof v.qty==='number'){
     const d=v.qty-prev.qty;
     const left={...prev,qty:0},right={...v,qty:0};
     if(d)make(field,'delta',{key:k,amount:d});
     if(sig(noImg(left))!==sig(noImg(right))||prev.imageUrl!==v.imageUrl)make(field,'upsertMeta',{key:k,value:{...v,qty:undefined}});
   } else if(sig(prev)!==sig(v))make(field,'upsert',{key:k,value:v});
  }
  for(const k of am.keys())if(!bm.has(k))make(field,'delete',{key:k});
 }else if(sig(a)!==sig(b)){make(field,'replace',{value:b})}
}
return items;
}
function apply(data,events){const d=clone(data),seen=new Set();for(const ev of events){if(!ev?.id||seen.has(ev.id))continue;seen.add(ev.id);const f=ev.field;if(ev.kind==='replace'){d[f]=clone(ev.value);continue}if(!Array.isArray(d[f]))d[f]=[];const arr=d[f],at=arr.findIndex(x=>String(x.id)===String(ev.key));if(ev.kind==='delete'){if(at>=0)arr.splice(at,1)}else if(ev.kind==='delta'){if(at>=0)arr[at].qty=(Number(arr[at].qty)||0)+ev.amount}else if(ev.kind==='upsert'){if(at>=0)arr[at]=clone(ev.value);else arr.push(clone(ev.value))}else if(ev.kind==='upsertMeta'){if(at>=0)Object.assign(arr[at],clone(ev.value),{qty:arr[at].qty})}}
return d;}
let busy=false;
async function push(){if(busy)return;const q=read(Q,[]);if(!q.length){st('Nessuna modifica in attesa');return}busy=true;try{let done=false;for(let retry=0;retry<4&&!done;retry++){
 const r=await remoteRead();if(!r.doc)throw Error('Inizializza prima archivio privato dal pulsante dedicato');const known=new Set(r.doc.events.map(x=>x.id));const adds=q.filter(x=>!known.has(x.id));if(!adds.length){done=true;break}try{await remoteWrite(r.sha,{...r.doc,events:r.doc.events.concat(adds)});done=true}catch(e){if(!String(e).includes('409')&&!String(e).includes('422'))throw e}
}if(!done)throw Error('Conflitto: riprova');const left=read(Q,[]).filter(x=>!q.some(y=>x.id===y.id));store(Q,left);st('✅ '+q.length+' operazioni inviate a GitHub');}catch(e){st('⚠️ Salvataggio locale OK. GitHub: '+e.message,true)}finally{busy=false}}
let last=read(LAST,null);
// Memorizza lo stato iniziale PRIMA della prima modifica: non perdere il primo salvataggio.
if(!last && local()){last=clone(local());try{store(LAST,last)}catch(e){console.warn('KING SYNC baseline',e)}}
window.KING_SYNC_AFTER_SAVE=function(){try{const c=cfg();const now=local();if(!now)return;if(!last){last=clone(now);store(LAST,last);st('Prima sincronizzazione: inizializza/recupera archivio');return}const changes=diff(last,now);last=clone(now);store(LAST,last);if(changes.length){store(Q,read(Q,[]).concat(changes));st('⏳ '+changes.length+' modifiche salvate localmente, invio GitHub');void push();}}catch(e){st('SYNC: '+e.message,true)}};
async function initialize(){if(!confirm('PRIMO AVVIO: creare archivio privato con i dati attuali di questo dispositivo? NON sovrascrive un archivio già esistente. Confermi?'))return;try{const old=await remoteRead();if(old.doc)throw Error('Archivio esiste già: usa Recupera aggiornamenti');const base=local();if(!base)throw Error('Importa prima il JSON aggiornato');await remoteWrite(null,{schema:1,createdAt:new Date().toISOString(),base,events:[]});last=clone(base);store(LAST,last);store(Q,[]);const c=cfg();c.enabled=true;store(CFG,c);enableRefresh();st('✅ Archivio iniziale privato creato. SYNC attivo.')}catch(e){st(e.message,true)}}
async function pull(){try{if(read(Q,[]).length)throw Error('Ci sono modifiche locali da inviare: prima premi Invia in attesa. Nessun dato sovrascritto.');const r=await remoteRead();if(!r.doc)throw Error('Archivio remoto non inizializzato');const d=apply(r.doc.base,r.doc.events);const current=local();if(current&&last&&sig(current)!==sig(last))throw Error('Dati locali modificati: blocco importazione per sicurezza');if(!confirm('Recuperare archivio remoto? Questa operazione sostituisce i dati locali di questo browser. Hai già esportato il backup?'))return;store('king_sync_auto_import_confirmed_v1',true);store(KEY,d);last=clone(d);store(LAST,last);const c=cfg();c.enabled=true;store(CFG,c);st('✅ Dati recuperati: '+(d.orders?.length||0)+' ordini, '+(d.stock?.length||0)+' voci magazzino. Ricarica la pagina.');setTimeout(()=>location.reload(),900)}catch(e){st('⚠️ '+e.message,true)}}
// Recupero una volta dopo l'autorizzazione: nessuna verifica periodica.
async function autoPull(){
 if(busy||!token())return;
 try{
  if(read(Q,[]).length){st('⏳ Modifiche locali in attesa: inviarle prima di recuperare GitHub');return}
  const r=await remoteRead();
  if(!r.doc){st('⚠️ Archivio remoto non inizializzato: importa il JSON e premi Crea archivio iniziale');return}
  const fresh=apply(r.doc.base,r.doc.events),current=local();
  if(current&&last&&sig(current)!==sig(last)){st('⚠️ Dati locali differenti: recupero automatico sospeso per non perdere vendite',true);return}
  if(current&&sig(current)===sig(fresh)){st('✅ GitHub già aggiornato · '+(fresh.orders?.length||0)+' ordini');return}
  // Il primo recupero su un altro browser richiede conferma: evita di eliminare dati locali non sincronizzati.
  if(!read('king_sync_auto_import_confirmed_v1',false)){
    st('📥 Aggiornamenti GitHub disponibili: premi Recupera aggiornamenti per la prima importazione');return;
  }
  store(KEY,fresh);last=clone(fresh);store(LAST,last);
  st('✅ GitHub sincronizzato all’accesso · '+(fresh.orders?.length||0)+' ordini');location.reload();
 }catch(e){st('⚠️ Lettura GitHub: '+e.message,true)}
}
function syncUi(){const s=document.createElement('section');s.id='king-sync-controls';s.style='max-width:920px;margin:12px auto;padding:14px;border:2px solid #a6b4a6;border-radius:12px;background:#f4faf4;color:#14271c;font:14px system-ui;';s.innerHTML=`<b>🔄 KING BACKUP · SYNC AUTOMATICA sulle modifiche</b><p style="margin:7px 0">Il gestionale continua a funzionare in locale. Ogni salvataggio invia automaticamente a GitHub le modifiche; nessun timer. Per sincronizzare serve prima autorizzare GitHub e inizializzare l’archivio privato.</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label>Repository <input id="king-sync-repo" value="king-sync-test" style="width:125px"></label><label>Token <input id="king-sync-token" type="password" placeholder="Token privato, non pubblicarlo" style="width:160px"></label><button id="king-sync-access" type="button">Autorizza</button><button id="king-sync-pull" type="button">Recupera aggiornamenti</button><button id="king-sync-push" type="button">Invia in attesa</button><button id="king-sync-init" type="button">Crea archivio iniziale</button><button id="king-sync-import" type="button">Importa JSON iniziale</button><input type="file" id="king-sync-file" accept=".json,application/json" hidden></div><p id="king-sync-status" style="margin:8px 0">SYNC automatica su modifica. Se il token non è configurato, le operazioni restano in attesa in locale.</p>`;
 const where=document.querySelector('main')||document.body;where.parentNode.insertBefore(s,where);
 const saved=cfg();$('#king-sync-repo').value=saved.repo;
 $('#king-sync-access').onclick=()=>{const c=cfg();c.repo=$('#king-sync-repo').value.trim();store(CFG,c);const t=$('#king-sync-token').value.trim();if(t)sessionStorage.setItem('KING_SYNC_TOKEN',t);$('#king-sync-token').value='';st(token()?'✅ Token attivo: modifiche inviate automaticamente':'⚠️ Inserisci il token',!token());if(token()&&read(Q,[]).length)void push();else if(token())void autoPull();};
 $('#king-sync-init').onclick=initialize;$('#king-sync-pull').onclick=pull;$('#king-sync-push').onclick=push;
 $('#king-sync-import').onclick=()=>$('#king-sync-file').click();
 $('#king-sync-file').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;const data=JSON.parse(await f.text());if(!Array.isArray(data.stock)||!Array.isArray(data.products)||!Array.isArray(data.orders))throw Error('JSON non compatibile');if(read(Q,[]).length)throw Error('Esistono modifiche in attesa');if(!confirm('Importare '+data.orders.length+' ordini nel BACKUP locale? Sovrascriverà i suoi dati locali.'))return;store(KEY,data);last=clone(data);store(LAST,last);st('✅ JSON importato nella copia SYNC. Ricarico pagina');setTimeout(()=>location.reload(),650)}catch(x){st('Errore importazione: '+x.message,true)}};
}
function enableRefresh(){/* Nessun polling. Il recupero avviene all’apertura con sessione autorizzata. */}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{syncUi();if(token())void autoPull()});else{syncUi();if(token())void autoPull()}
})();
