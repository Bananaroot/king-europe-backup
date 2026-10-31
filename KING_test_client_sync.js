/* KING TEST CLIENTI - PROVA separata. Il token GitHub NON va qui. */
(()=>{'use strict';
 const cfg=window.KING_CLIENTI_CONFIG||{};
 const key=String(cfg.version||'').startsWith('v3')?'king-wellbeing-v3-public-last':'king-wellbeing-v2-public-last';
 const recordId=()=>crypto.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2);
 function result(){try{const r=JSON.parse(localStorage.getItem(key)||'null');return r&&Array.isArray(r.values)?r:null}catch{return null}}
 async function saveDirect(payload){
  const path=String(cfg.path||'archivio-test.json').split('/').map(encodeURIComponent).join('/');
  const url='https://api.github.com/repos/'+encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) + '/contents/' + path;
  const hdr={'Authorization':'Bearer '+cfg.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
  const toB64=str=>btoa(Array.from(new TextEncoder().encode(str),b=>String.fromCharCode(b)).join(''));
  const fromB64=str=>new TextDecoder().decode(Uint8Array.from(atob(str.replace(/\s/g,'')),c=>c.charCodeAt(0)));
  for(let attempt=0;attempt<5;attempt++){
    const r=await fetch(url+'?ref='+encodeURIComponent(cfg.branch||'main')+'&t='+Date.now(),{headers:hdr,cache:'no-store'});
    if(!r.ok)throw Error('Lettura GitHub HTTP '+r.status);
    const old=await r.json();
    if(!old.content)throw Error('Archivio non disponibile come file: controlla JSON');
    const db=JSON.parse(fromB64(old.content));
    if(!Array.isArray(db.registrazioni))throw Error('Archivio JSON: manca registrazioni[]');
    let already=db.registrazioni.find(e=>e.id===payload.event_id);
    if(!already){
      db.registrazioni.push({id:payload.event_id,visitor_id:payload.visitor_id,version:payload.version,
        name:payload.name,surname:payload.surname,email:payload.email.toLowerCase(),
        values:payload.values,areas:payload.areas,received_at:new Date().toISOString(),source:'KING-test-2.0'});
      db.ultimo_aggiornamento=new Date().toISOString();
    }
    const n=db.registrazioni.filter(e=>e.email===payload.email.toLowerCase()).length;
    if(already)return {ok:true,id:payload.event_id,tests_for_email:n};
    const up=await fetch(url,{method:'PUT',headers:{...hdr,'Content-Type':'application/json'},
      body:JSON.stringify({message:'KING TEST 3.0: registrazione di prova',branch:cfg.branch||'main',sha:old.sha,content:toB64(JSON.stringify(db,null,2))})});
    if(up.ok)return {ok:true,id:payload.event_id,tests_for_email:n};
    if(up.status===409||up.status===422)continue;
    throw Error('Scrittura GitHub HTTP '+up.status+' '+(await up.text()).slice(0,150));
  }
  throw Error('Archivio occupato: riprova il salvataggio');
 }

 function makePanel(){
  if(document.getElementById('king-leads-prova')||!document.getElementById('km-report')||!result())return;
  const holder=document.createElement('section');holder.id='king-leads-prova';holder.style='max-width:880px;margin:22px auto;padding:20px;border:1px solid #b9a076;border-radius:18px;background:#fffaf0;color:#231e17;font:16px system-ui;line-height:1.5';
  holder.innerHTML=`<h2 style="font-size:24px;margin:0 0 8px">Archivio test KING · 3.0</h2><p>Il tuo risultato rimane visibile anche senza registrazione. Solo se scegli di inviarlo, i dati qui sotto saranno conservati nell'archivio privato del gestore. <b>Solo collaudo con dati inventati.</b> La versione con token pubblico non protegge i dati.</p><form id="king-leads-form"><div style="display:grid;gap:9px"><label>Nome <input name="name" maxlength="60" required autocomplete="given-name" style="width:100%;padding:10px"></label><label>Cognome <input name="surname" maxlength="70" required autocomplete="family-name" style="width:100%;padding:10px"></label><label>Email <input name="email" type="email" maxlength="160" required autocomplete="email" style="width:100%;padding:10px"></label></div><label style="display:block;margin:14px 0"><input type="checkbox" name="consent" required> Acconsento esplicitamente alla registrazione di nome, cognome, email, versione del test e punteggi del questionario nel registro privato KING. Comprendo che queste risposte possono riguardare il benessere personale. Non acconsento automaticamente a pubblicità.</label><button type="submit" style="padding:12px 20px;border:0;border-radius:9px;background:#355c52;color:white;font-weight:700">Salva test 3.0 su GitHub</button><p id="king-leads-status" role="status" aria-live="polite"></p></form><small>Non è un test medico e non misura ormoni. Per una pubblicazione reale servono informativa privacy e gestione dei diritti sui dati.</small>`;
  document.getElementById('km-report').after(holder);
  const f=holder.querySelector('form'),st=holder.querySelector('#king-leads-status');
  f.addEventListener('submit',async e=>{
   e.preventDefault();if(!f.reportValidity())return;
   const r=result();if(!r){st.textContent='Risultato non trovato. Completa prima il test.';return}
   if(!cfg.token||cfg.token.startsWith('INCOLLA_')){st.textContent='Token GitHub non configurato. Nessun dato inviato.';return}
   const data=new FormData(f);const uid=sessionStorage.getItem('king-leads-demo-visitor')||recordId();sessionStorage.setItem('king-leads-demo-visitor',uid);
   const payload={event_id:recordId(),visitor_id:uid,version:cfg.version,name:String(data.get('name')||'').trim(),surname:String(data.get('surname')||'').trim(),email:String(data.get('email')||'').trim(),values:r.values,areas:r.areas||[],consent:true,consented_at:new Date().toISOString(),source:'KING-test-prova'};
   const btn=f.querySelector('button');btn.disabled=true;st.textContent='Invio in corso…';
   try{const body=await saveDirect(payload);st.textContent='✅ Test registrato online. ID: '+body.id+' · Totale test associati a questa email: '+body.tests_for_email;btn.textContent='Registrato'}
   catch(e){st.textContent='⚠️ Non salvato sul server: '+e.message;btn.disabled=false}
  });
 }
 const observer=new MutationObserver(()=>makePanel());
 function start(){observer.observe(document.body,{subtree:true,childList:true});makePanel();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
