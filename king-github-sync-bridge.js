/* KING GitHub SYNC - VERSIONE DI PROVA. Non inserire token nel file pubblico. */
(()=>{'use strict';
const KEY='king_europe_manager_EMERGENZA_2026_v1';
const CFG='king_sync_cfg_v1',Q='king_sync_queue_v1',LAST='king_sync_last_v1';
const REMOTE='king-sync-test/archivio-sync.json';
const SYNC_LOG='king_sync_last_confirmed_v2';
const writeLog=(kind,detail)=>{try{store(SYNC_LOG,{kind,detail,at:new Date().toISOString()})}catch(e){}};

const $=s=>document.querySelector(s);
const clone=x=>JSON.parse(JSON.stringify(x));
const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const cfg=()=>Object.assign({owner:'Bananaroot',repo:'king-sync-test',branch:'main',enabled:true},read(CFG,{}));
const token=()=>sessionStorage.getItem('KING_SYNC_TOKEN')||'';
// Credenziali di prova: cifratura in IndexedDB, chiave non esportabile.
// ATTENZIONE: uno script ostile eseguito sullo stesso origin potrebbe comunque usare la chiave.
const VAULT_DB='king_sync_device_credentials_v1', VAULT_KEY='github';
function openVault(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(Error('Memoria protetta non disponibile'));const req=indexedDB.open(VAULT_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('secrets'))req.result.createObjectStore('secrets')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('IndexedDB'))})}
async function vaultOperation(mode,value){const db=await openVault();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('secrets',mode==='read'?'readonly':'readwrite'),os=tx.objectStore('secrets');const r=mode==='read'?os.get(VAULT_KEY):mode==='delete'?os.delete(VAULT_KEY):os.put(value,VAULT_KEY);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error||Error('Archivio credenziali'));tx.onabort=()=>reject(tx.error||Error('Operazione interrotta'));})}finally{db.close()}}
async function rememberToken(t){if(!crypto?.subtle)throw Error('Cifratura non supportata');const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(t));await vaultOperation('write',{key,iv:Array.from(iv),data:Array.from(new Uint8Array(ct)),savedAt:new Date().toISOString()})}
async function restoreToken(){const v=await vaultOperation('read');if(!v)return false;if(!v.key||!v.iv||!v.data)throw Error('Autorizzazione non valida');const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:new Uint8Array(v.iv)},v.key,new Uint8Array(v.data));const t=new TextDecoder().decode(raw);if(!t)throw Error('Token salvato vuoto');sessionStorage.setItem('KING_SYNC_TOKEN',t);return true}
async function forgetToken(){sessionStorage.removeItem('KING_SYNC_TOKEN');await vaultOperation('delete')}

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
// Nessuna fotografia base64 viene scritta nella baseline o nel repository remoto.
const snapshot=data=>{
 const d=clone(data);
 function shrink(o){if(!o||typeof o!=='object')return;
   if(Array.isArray(o)){o.forEach(shrink);return}
   for(const k of Object.keys(o)){
     if(typeof o[k]==='string'&&/^data:image\//i.test(o[k]))delete o[k];
     else shrink(o[k]);
   }
 }
 shrink(d);return d;
};
const noImg=o=>snapshot(o);
// Gli ordini vengono uniti per ID. La base aggiornata prevale sulle vecchie quantita'.
function mergeCatalog(current,incoming){
 if(!current)return {data:snapshot(incoming),added:(incoming.orders||[]).length};
 const d=clone(current);
 const orderIds=new Set((d.orders||[]).map(o=>String(o.id)));
 let added=0;
 for(const o of (incoming.orders||[]))if(o&&o.id!=null&&!orderIds.has(String(o.id))){d.orders.push(clone(o));orderIds.add(String(o.id));added++}
 for(const field of ['stock','products']){
   const existing=d[field]||[];
   const byId=new Map(existing.map((o,i)=>[String(o.id),i]));
   const bySku=new Map(existing.map((o,i)=>[o.catalogSku||o.sku,i]).filter(x=>x[0]!=null).map(x=>[String(x[0]),x[1]]));
   for(const item of incoming[field]||[]){
     const i=byId.get(String(item.id))??bySku.get(String(item.catalogSku||item.sku||''));
     if(i===undefined){const safe=snapshot(item);existing.push(safe);if(safe.id)byId.set(String(safe.id),existing.length-1)}
     else {const old=existing[i];const pic=old.imageUrl;existing[i]={...old,...snapshot(item)};if(pic&&!existing[i].imageUrl)existing[i].imageUrl=pic}
   }
   d[field]=existing;
 }
 for(const k of Object.keys(incoming))if(!(k in d))d[k]=snapshot(incoming[k]);
 return {data:d,added};
}
async function persistState(d){await persistSmart(d)}

// Backup ampio e privato del browser. IndexedDB non ha il piccolo limite di localStorage.
const DATA_DB='king_sync_full_store_v2';
function dataDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DATA_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('data'))r.result.createObjectStore('data')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putLarge(d){const database=await dataDB();try{await new Promise((res,rej)=>{const tx=database.transaction('data','readwrite');tx.objectStore('data').put(d,'full');tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})}finally{database.close()}}
async function getLarge(){const database=await dataDB();try{return await new Promise((res,rej)=>{const tx=database.transaction('data','readonly');const q=tx.objectStore('data').get('full');q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}finally{database.close()}}
function currentState(){try{return typeof db==='object'&&db&&Array.isArray(db.orders)?db:local()}catch{return local()}}
async function persistSmart(d){
 // Scrivere PRIMA nella memoria grande; nessuna operazione rischia di distruggere la vecchia copia.
 await putLarge(d);
 try{store(KEY,d)}catch(e){
  // Ultima risorsa: conservare il magazzino leggero nel vecchio formato e le foto in IndexedDB.
  if(!/quota|storage/i.test(String(e))&&e?.name!=='QuotaExceededError')throw e;
  try{store(KEY,snapshot(d))}catch(ex){throw Error('Archivio IndexedDB salvato, ma spazio locale insufficiente anche per il JSON leggero: '+ex.message)}
 }
 // la baseline ha SOLO metadati, mai foto: aggiornarla dopo il salvataggio.
 const compact=snapshot(d);try{store(LAST,compact)}catch(e){console.warn('Baseline temporaneamente non salvata',e)}
 last=compact;
 try{if(typeof db==='object'){db=clone(d); if(typeof render==='function')render()}}catch(e){console.warn('KING rendering',e)}
}
async function restoreLarge(){
 try{const saved=await getLarge();if(!saved)return;
   const raw=local();const localIds=new Set((raw?.orders||[]).map(x=>String(x.id)));
   const hasUnseen=(raw?.orders||[]).some(x=>!new Set((saved.orders||[]).map(a=>String(a.id))).has(String(x.id)));
   // Non recuperare sopra ordini più recenti: fondere i nuovi ordini e mantenere i dati correnti.
   const result=hasUnseen?mergeCatalog(saved,raw).data:(raw&&sig(snapshot(raw))!==sig(snapshot(saved))?mergeCatalog(raw,saved).data:saved);
   if(hasUnseen)await putLarge(result);
   if(typeof db==='object'){db=clone(result);if(typeof render==='function')render()}
 }catch(e){st('⚠️ Archivio locale: '+e.message,true)}
}

const sig=o=>JSON.stringify(o);
function diff(old,now){old=snapshot(old);now=snapshot(now);const items=[];const ts=new Date().toISOString();const make=(field,kind,x,extra={})=>items.push({id:id(),ts,field,kind,...x,...extra});
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
     if(sig(noImg(left))!==sig(noImg(right)))make(field,'upsertMeta',{key:k,value:{...v,qty:undefined}});
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
async function push(){if(busy)return;const q=read(Q,[]);if(!q.length){const log=read(SYNC_LOG,null);st(log?.kind==='sent'?'✅ Ultimo invio GitHub: '+log.detail+' · '+new Date(log.at).toLocaleString('it-IT'):'Nessuna modifica in coda. Usa Verifica giacenza GitHub per controllare il remoto.');return}busy=true;try{let done=false;for(let retry=0;retry<4&&!done;retry++){
 const r=await remoteRead();if(!r.doc)throw Error('Inizializza prima archivio privato dal pulsante dedicato');const known=new Set(r.doc.events.map(x=>x.id));const adds=q.filter(x=>!known.has(x.id));if(!adds.length){done=true;break}try{await remoteWrite(r.sha,{...r.doc,events:r.doc.events.concat(adds)});done=true}catch(e){if(!String(e).includes('409')&&!String(e).includes('422'))throw e}
}if(!done)throw Error('Conflitto: riprova');const left=read(Q,[]).filter(x=>!q.some(y=>x.id===y.id));store(Q,left);writeLog('sent',q.length+' eventi confermati');st('✅ GitHub: '+q.length+' eventi confermati e salvati');}catch(e){st('⚠️ Salvataggio locale OK. GitHub: '+e.message,true)}finally{busy=false}}
let last=snapshot(read(LAST,null));
// Memorizza lo stato iniziale PRIMA della prima modifica: non perdere il primo salvataggio.
if(!last && local()){last=snapshot(local());try{store(LAST,last)}catch(e){console.warn('KING SYNC baseline',e)}}
window.KING_SYNC_AFTER_SAVE=function(){try{
 const now=currentState();if(!now)return;
 void putLarge(clone(now)).catch(e=>console.warn('IndexedDB backup',e));
 if(!last){last=snapshot(now);store(LAST,last);st('⚠️ Archivio locale inizializzato. Verifica le quantità su GitHub.');return}
 const changes=diff(last,now);
 if(!changes.length)return;
 // La coda deve essere scritta PRIMA di aggiornare il riferimento locale.
 const q=read(Q,[]);store(Q,q.concat(changes));
 last=snapshot(now);store(LAST,last);
 writeLog('pending',changes.length+' modifica/e registrate');
 st('⏳ '+changes.length+' modifica/e rilevate e messe in coda');
 if(token())void push();else st('⚠️ Modifiche in attesa: autorizza GitHub per inviarle');
 }catch(e){st('⚠️ SYNC salvataggio: '+e.message,true)}};

async function initialize(){if(!confirm('PRIMO AVVIO: creare archivio privato con i dati attuali di questo dispositivo? NON sovrascrive un archivio già esistente. Confermi?'))return;try{const old=await remoteRead();if(old.doc)throw Error('Archivio esiste già: usa Recupera aggiornamenti');const base=currentState();if(!base)throw Error('Importa prima il JSON aggiornato');await remoteWrite(null,{schema:1,createdAt:new Date().toISOString(),base:snapshot(base),events:[]});last=snapshot(base);store(LAST,last);store(Q,[]);const c=cfg();c.enabled=true;store(CFG,c);enableRefresh();st('✅ Archivio iniziale privato creato. SYNC attivo.')}catch(e){st(e.message,true)}}
function canInitialJoin(current,remote){
 if(!current||!remote||read(Q,[]).length)return false;
 const localOrders=Array.isArray(current.orders)?current.orders:[];
 const remoteOrders=Array.isArray(remote.orders)?remote.orders:[];
 if(!remoteOrders.length||localOrders.length>=remoteOrders.length)return false;
 const ids=new Set(remoteOrders.filter(o=>o&&o.id!=null).map(o=>String(o.id)));
 return localOrders.every(o=>o&&o.id!=null&&ids.has(String(o.id)));
}
async function pull(){try{if(read(Q,[]).length)throw Error('Ci sono modifiche locali da inviare: prima premi Invia in attesa. Nessun dato sovrascritto.');const r=await remoteRead();if(!r.doc)throw Error('Archivio remoto non inizializzato');const remote=apply(r.doc.base,r.doc.events);const current=currentState();const d=mergeCatalog(current,remote).data;if(current&&last&&sig(snapshot(current))!==sig(last)) {if(!canInitialJoin(current,remote))throw Error('Dati locali modificati: blocco importazione per sicurezza');}if(!confirm('Unire gli aggiornamenti remoti senza eliminare gli ordini locali? Esporta comunque una copia di sicurezza prima'))return;store('king_sync_auto_import_confirmed_v1',true);await persistState(d);const c=cfg();c.enabled=true;store(CFG,c);st('✅ Dati recuperati: '+(d.orders?.length||0)+' ordini, '+(d.stock?.length||0)+' voci magazzino. Ricarica la pagina.');setTimeout(()=>location.reload(),900)}catch(e){st('⚠️ '+e.message,true)}}
// Recupero una volta dopo l'autorizzazione: nessuna verifica periodica.
async function autoPull(){
 if(busy||!token())return;
 try{
  if(read(Q,[]).length){st('⏳ Modifiche locali in attesa: inviarle prima di recuperare GitHub');return}
  const r=await remoteRead();
  if(!r.doc){st('⚠️ Archivio remoto non inizializzato: importa il JSON e premi Crea archivio iniziale');return}
  const remote=apply(r.doc.base,r.doc.events),current=currentState();const fresh=mergeCatalog(current,remote).data;
  if(current&&last&&sig(snapshot(current))!==sig(last)&&!canInitialJoin(current,remote)){st('⚠️ Dati locali differenti: recupero automatico sospeso per non perdere vendite',true);return}
  if(current&&sig(snapshot(current))===sig(snapshot(fresh))){st('✅ GitHub già aggiornato · '+(fresh.orders?.length||0)+' ordini');return}
  if(canInitialJoin(current,remote)){await persistState(fresh);store('king_sync_auto_import_confirmed_v1',true);st('✅ Primo accesso completato: '+fresh.orders.length+' ordini dal GitHub privato');location.reload();return}
  // Primo recupero con conferma: evita conflitti con dati locali non sincronizzati.
  if(!read('king_sync_auto_import_confirmed_v1',false)){
    st('📥 Aggiornamenti GitHub disponibili: premi Recupera aggiornamenti per la prima importazione');return;
  }
  await persistState(fresh);
  st('✅ GitHub sincronizzato all’accesso · '+(fresh.orders?.length||0)+' ordini');location.reload();
 }catch(e){st('⚠️ Lettura GitHub: '+e.message,true)}
}
async function reconcileLocal(){
 try{
  const now=currentState();if(!now||!last)throw Error('Manca il riferimento iniziale locale. Non ricreare l’archivio.');
  const existing=read(Q,[]);if(existing.length){st('⏳ '+existing.length+' eventi già in attesa: premi Invia in attesa');return}
  const changes=diff(last,now);
  if(!changes.length){st('Non vedo differenze rispetto all’ultimo salvataggio locale. Verifica su GitHub prima di cambiare altri valori.');return}
  if(!confirm('Sono state trovate '+changes.length+' differenze locali. Inviarle a GitHub?'))return;
  store(Q,changes);last=snapshot(now);store(LAST,last);writeLog('pending',changes.length+' modifiche recuperate');
  st('⏳ '+changes.length+' modifiche in coda');if(token())await push();
 }catch(e){st('⚠️ '+e.message,true)}
}
async function verifyRemoteStock(){
 try{
  if(!token())throw Error('Prima autorizza GitHub');
  const r=await remoteRead();if(!r.doc)throw Error('Archivio remoto non trovato');
  const remote=apply(r.doc.base,r.doc.events),here=currentState();
  const target=(x)=>(x?.stock||[]).find(p=>String(p.catalogSku||p.sku||'')==='19128'||String(p.id)==='omega369-90');
  const a=target(here),b=target(remote),pending=read(Q,[]).length;
  const text='Omega 3-6-9 SKU 19128: dispositivo '+(a?.qty??'assente')+' | GitHub '+(b?.qty??'assente')+'; ordini dispositivo '+(here?.orders?.length||0)+' | GitHub '+(remote.orders?.length||0)+'; in coda '+pending;
  st((a&&b&&Number(a.qty)===Number(b.qty)?'✅ ':'⚠️ ')+text,!!(a&&b&&Number(a.qty)!==Number(b.qty)));
 }catch(e){st('⚠️ Verifica GitHub: '+e.message,true)}
}
function syncUi(){const s=document.createElement('section');s.id='king-sync-controls';s.style='max-width:920px;margin:12px auto;padding:14px;border:2px solid #a6b4a6;border-radius:12px;background:#f4faf4;color:#14271c;font:14px system-ui;';s.innerHTML=`<details id="king-sync-details"><summary style="cursor:pointer;font-weight:bold">🔄 KING BACKUP · SYNC · Impostazioni</summary><p style="margin:7px 0">Il gestionale continua a funzionare in locale. Ogni salvataggio invia automaticamente a GitHub le modifiche; nessun timer. Per sincronizzare serve prima autorizzare GitHub e inizializzare l’archivio privato.</p><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><label>Repository <input id="king-sync-repo" value="king-sync-test" style="width:125px"></label><label>Token <input id="king-sync-token" type="password" placeholder="Token privato, non pubblicarlo" style="width:160px"></label><button id="king-sync-access" type="button">Autorizza</button><label style="font-size:12px;display:inline-flex;align-items:center;gap:5px"><input id="king-sync-remember" type="checkbox"> Ricorda su questo dispositivo (prova)</label><button id="king-sync-forget" type="button">Rimuovi autorizzazione</button><button id="king-sync-pull" type="button">Recupera aggiornamenti</button><button id="king-sync-push" type="button">Invia in attesa</button><button id="king-sync-verify" type="button">Verifica giacenza GitHub</button><button id="king-sync-reconcile" type="button">Rileva modifiche non inviate</button><button id="king-sync-init" type="button">Crea archivio iniziale</button><button id="king-sync-import" type="button">Importa JSON iniziale</button><input type="file" id="king-sync-file" accept=".json,application/json" hidden></div></details><p id="king-sync-status" style="margin:8px 0">SYNC automatica su modifica. Se il token non è configurato, le operazioni restano in attesa in locale.</p>`;
 const where=document.querySelector('main')||document.body;where.parentNode.insertBefore(s,where);
 const saved=cfg();$('#king-sync-repo').value=saved.repo;
 $('#king-sync-access').onclick=async()=>{const c=cfg();c.repo=$('#king-sync-repo').value.trim();store(CFG,c);const t=$('#king-sync-token').value.trim();try{if(t){sessionStorage.setItem('KING_SYNC_TOKEN',t);if($('#king-sync-remember').checked){await rememberToken(t);st('✅ Token ricordato su questo dispositivo. Nessun timer: SYNC sulle modifiche.')}else{await vaultOperation('delete');st('✅ Token valido per questa sessione.')}}else if(!token()){if(await restoreToken())st('✅ Autorizzazione recuperata dal dispositivo');else throw Error('Inserisci il token')}$('#king-sync-token').value='';if(read(Q,[]).length)void push();else void autoPull()}catch(e){st('⚠️ '+e.message,true)}};
 $('#king-sync-forget').onclick=async()=>{try{await forgetToken();$('#king-sync-token').value='';$('#king-sync-remember').checked=false;st('✅ Autorizzazione rimossa da questo browser')}catch(e){st('⚠️ '+e.message,true)}};
 $('#king-sync-verify').onclick=verifyRemoteStock;$('#king-sync-reconcile').onclick=reconcileLocal;$('#king-sync-init').onclick=initialize;$('#king-sync-pull').onclick=pull;$('#king-sync-push').onclick=push;
 $('#king-sync-import').onclick=()=>$('#king-sync-file').click();
 $('#king-sync-file').onchange=async e=>{try{const f=e.target.files?.[0];if(!f)return;const data=JSON.parse(await f.text());if(!Array.isArray(data.stock)||!Array.isArray(data.products)||!Array.isArray(data.orders))throw Error('JSON non compatibile');if(read(Q,[]).length)throw Error('Esistono modifiche in attesa');const current=currentState();const {data:merged,added}=mergeCatalog(current,data);if(!confirm('Confronto per ID: '+added+' ordini NUOVI su '+data.orders.length+'; gli altri restano. Aggiornare soltanto le quantita diverse?'))return;await persistState(merged);st('✅ Importati '+added+' ordini nuovi. Totale '+merged.orders.length+'. Foto protette in IndexedDB. Ricarico pagina');setTimeout(()=>location.reload(),650)}catch(x){st('Errore importazione: '+x.message,true)}};
}
function enableRefresh(){/* Nessun polling. Il recupero avviene all’apertura con sessione autorizzata. */}
async function bootSync(){await restoreLarge();syncUi();if(!token()){try{if(await restoreToken()){st('✅ Token ricordato recuperato automaticamente');void autoPull()}}catch(e){st('⚠️ Credenziali locali: '+e.message,true)}}else void autoPull()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void bootSync()});else void bootSync()
})();
