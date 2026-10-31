/* KING Test Benessere 3.0 - salvataggio GitHub e conteggio clic. Nessun polling. 
   AVVISO: l'accesso tramite token nel sito pubblico NON protegge dati personali.
   SOLO test con dati inventati finche' non viene introdotto un ricevitore privato. */
(()=>{'use strict';
const CFG=window.KING_CLIENTI_CONFIG||{};
const target=(path)=>'https://api.github.com/repos/'+encodeURIComponent(CFG.owner||'Bananaroot')+'/'+encodeURIComponent(CFG.repo||'king-test-benessere-dati')+'/contents/'+path;
const base=()=>({'Authorization':'Bearer '+CFG.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'});
const enc=t=>btoa(Array.from(new TextEncoder().encode(t),b=>String.fromCharCode(b)).join(''));
const dec=t=>new TextDecoder().decode(Uint8Array.from(atob(t.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const delay=n=>new Promise(r=>setTimeout(r,n));
const ready=()=>{if(!CFG.token||String(CFG.token).startsWith('INCOLLA_'))throw Error('Token test non configurato');};
async function read(path){ready();const res=await fetch(target(path)+'?ref='+encodeURIComponent(CFG.branch||'main')+'&t='+Date.now(),{headers:base(),cache:'no-store'});if(res.status===404)return {sha:null,obj:null};if(!res.ok)throw Error('lettura GitHub HTTP '+res.status);const r=await res.json();if(!r.content)throw Error('Contenuto GitHub non disponibile');return {sha:r.sha,obj:JSON.parse(dec(r.content))};}
async function write(path,update,initial){
 for(let attempt=0;attempt<6;attempt++){
  const old=await read(path);const fresh=update(old.obj||initial());if(fresh===null)return {already:true,data:old.obj};
  const payload={message:'KING Benessere: aggiornamento '+path,branch:CFG.branch||'main',content:enc(JSON.stringify(fresh,null,2))};if(old.sha)payload.sha=old.sha;
  const r=await fetch(target(path),{method:'PUT',headers:{...base(),'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.ok)return {data:fresh};if((r.status===409||r.status===422)&&attempt<5){await delay(150*(attempt+1));continue;}throw Error('scrittura GitHub HTTP '+r.status);
 }throw Error('Archivio occupato, riprova');
}
async function save(obj){
 if(!obj||!Array.isArray(obj.values))throw Error('Risultato test non valido');
 if(!obj.name?.trim()||!obj.surname?.trim()||!obj.email?.trim())throw Error('Compila nome, cognome ed email per registrarti');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email))throw Error('Indirizzo email non valido');
 const stamp=String(obj.date||new Date().toISOString());
 const id='v2-'+stamp+'-'+obj.email.trim().toLowerCase();
 const payload={id,version:'v2-3.0',name:obj.name.trim(),surname:obj.surname.trim(),email:obj.email.trim().toLowerCase(),date:stamp,values:obj.values,areas:obj.areas,consent:true,received_at:new Date().toISOString()};
 const rv=await write(CFG.path||'archivio-test.json',db=>{
  db.registrazioni=Array.isArray(db.registrazioni)?db.registrazioni:[];
  if(db.registrazioni.some(x=>x.id===id))return null;
  db.registrazioni.push(payload);db.ultimo_aggiornamento=new Date().toISOString();return db;
 },()=>({versione:'1.0',sistema:'KING TEST BENESSERE',clienti:[],registrazioni:[],ultimo_aggiornamento:null,ultimo_trasferimento:null}));
 const db=rv.data|| (await read(CFG.path||'archivio-test.json')).obj;
 return {count:db.registrazioni.filter(x=>String(x.email||'').toLowerCase()===payload.email).length};
}
async function click(href,name){
 const p=new URL(href,location.href),url=p.href;
 await write('clic-prodotti.json',db=>{
   const key=url;db.links=Array.isArray(db.links)?db.links:[];
   let item=db.links.find(x=>x.url===key);if(!item){item={url:key,nome:name||'',clic:0};db.links.push(item);}
   item.clic=(Number(item.clic)||0)+1;db.totale=(Number(db.totale)||0)+1;db.ultimo_aggiornamento=new Date().toISOString();return db;
 },()=>({versione:'1.0',totale:0,links:[],ultimo_aggiornamento:null}));
}
document.addEventListener('click',event=>{
 const a=event.target.closest?.('a[href]');if(!a)return;
 let u;try{u=new URL(a.href,location.href)}catch{return}
 if(!/(^|\.)ebay\.(io|it|com|de|fr|es)$/i.test(u.hostname))return;
 // registra soltanto i clic relativi ai prodotti nel risultato benessere
 if(!a.closest('#km-report'))return;
 click(a.href,a.closest('.km-product')?.textContent?.slice(0,90)||a.textContent?.slice(0,90)).catch(()=>{});
},true);
const originalFetch=window.fetch.bind(window);
window.fetch=function(input,init){
 const requestUrl=typeof input==='string'?input:input?.url;
 if(requestUrl==='https://king-save.invalid/api/test' && String(init?.method||'GET').toUpperCase()==='POST'){
  let obj;try{obj=JSON.parse(init.body)}catch{return Promise.resolve(new Response('bad request',{status:400}));}
  return save(obj).then(r=>new Response(JSON.stringify({ok:true,count:r.count}),{status:200,headers:{'Content-Type':'application/json'}}));
 }
 return originalFetch(input,init);
};
window.KING_TEST_GITHUB={save,read};
})();
