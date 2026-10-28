/* KING EUROPE · rapporto pubblico mobile. Calcoli e salvataggio sul dispositivo. */
(function(){
const areas=[
 {chem:'Dopamina',formula:'C₈H₁₁NO₂',name:'Motivazione',about:'La dopamina partecipa ai processi di motivazione e apprendimento. Il punteggio descrive il tuo vissuto, non la sua concentrazione.',tip:'Prova a dedicare dieci minuti a una piccola attività che ti piace.',tags:['tirosina','l-tirosina']},
 {chem:'Serotonina',formula:'C₁₀H₁₂N₂O',name:'Serenità',about:'La serotonina è un neurotrasmettitore coinvolto in numerosi processi. Le risposte non indicano una carenza.',tip:'Cerca di mantenere regolarità nel sonno e un po’ di luce naturale.',tags:[]},
 {chem:'Ossitocina',formula:'C₄₃H₆₆N₁₂O₁₂S₂',name:'Relazioni',about:'L’ossitocina è coinvolta in diversi processi fisiologici e sociali. Questo questionario non ne misura i livelli.',tip:'Dedica del tempo a una persona con cui ti senti a tuo agio.',tags:[]},
 {chem:'Cortisolo',formula:'C₂₁H₃₀O₅',name:'Gestione dello stress',about:'Il cortisolo è coinvolto nella risposta allo stress. Un punteggio basso non significa avere cortisolo alto o basso.',tip:'Alterna gli impegni a pause brevi e sostenibili.',tags:[]},
 {chem:'Testosterone',formula:'C₁₉H₂₈O₂',name:'Energia',about:'Il testosterone svolge ruoli importanti nell’organismo. La percezione di energia non permette di valutarne i livelli.',tip:'Considera sonno, alimentazione varia e movimento adeguato.',tags:[]}
];
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=v=>v<=33?'Area da approfondire':v<=66?'Equilibrio variabile':'Risorsa percepita';
const color=v=>v<=33?'#ed7775':v<=66?'#efbe6d':'#6bd2a6';
const links=()=>{
 const mode=window.KING_CATALOG_MODE||'both';
 const manager=Array.isArray(window.KING_PUBLIC_PRODUCTS)?window.KING_PUBLIC_PRODUCTS:[];
 const ebay=Array.isArray(window.KING_EBAY_PRODUCTS)?window.KING_EBAY_PRODUCTS:[];
 const selected=mode==='ebay'?ebay:mode==='manager'?manager:[...ebay,...manager];
 const seen=new Set();
 return selected.filter(x=>{const key=(x.url||'').split('?')[0].toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true;});
};
const cfg=()=>window.KING_REPORT_CONFIG||{};
function chemDrawing(i){
 // Le illustrazioni vettoriali provengono dagli stessi schemi già usati nel test.
 try {if(typeof CHEM_SVG!=='undefined' && CHEM_SVG[i])return `<div class="km-chem-art" aria-label="Schema molecolare illustrativo di ${safe(areas[i].chem)}">${CHEM_SVG[i]}</div>`}catch(e){}
 return `<div class="km-chem-fallback">${safe(areas[i].chem)}</div>`;
}
function productsFor(i){
 const db=window.KING_SCIENCE_DB||{};const rules=db.logic?.ingredient_rules||{};
 const catalog=links();const found=[];
 for(const x of catalog){
  if(!/^https:\/\/(?:[^/]+\.)?ebay\.[^/]+\/|^https:\/\/ebay\.io\//i.test(x.url||'')) continue;
  const ingredientIds=Array.isArray(x.ingredient_ids)?x.ingredient_ids:[];
  const matched=ingredientIds.map(id=>({id,rule:rules[id]})).filter(z=>z.rule&&z.rule.areas.includes(i));
  if(!matched.length) continue;
  const best=matched.find(z=>z.rule.level==='physiological')||matched[0];
  found.push({...x,reason:best.rule.description, evidenceLevel:best.rule.level});
 }
 return found.slice(0,db.logic?.per_area_limit||3);
}

window.kingNewResult=function(values,compare){
 const sorted=areas.map((a,i)=>({...a,i,v:values[i]})).sort((a,b)=>a.v-b.v);
 const cards=sorted.map(a=>{const matches=productsFor(a.i);return `<article class="km-card"><div class="km-heading"><span class="km-index">${String(a.i+1).padStart(2,'0')}</span><div><div class="km-over">${safe(a.chem)} · ${safe(a.formula)}</div><h2>${safe(a.name)}</h2></div><span class="km-number" style="color:${color(a.v)}">${a.v}/100</span></div>${chemDrawing(a.i)}<div class="km-meter"><i style="width:${a.v}%;background:${color(a.v)}"></i></div><div class="km-status" style="color:${color(a.v)}">${label(a.v)}</div><p>${safe(a.about)}</p><div class="km-tip"><b>Un piccolo passo</b><p>${safe(a.tip)}</p></div>${matches.length?`<div class="km-products"><div class="km-over">Prodotti da conoscere · inserzioni eBay</div>${matches.map(x=>`<a class="km-product" href="${safe(x.url)}" target="_blank" rel="noopener noreferrer" aria-label="Apri su eBay: ${safe(x.name)}">${x.image?`<img src="${safe(x.image)}" alt="${safe(x.name)}" loading="lazy">`:'<span class="km-placeholder">✦</span>'}<span><b>${safe(x.name)}</b><small>${safe(x.reason||"Approfondisci ingredienti, etichetta e avvertenze.")}</small><strong>Scopri su eBay ↗</strong></span></a>`).join('')}</div>`:''}</article>`}).join('');
 const nameField=`<section class="km-person"><h2>Personalizza il tuo rapporto</h2><p>Inserisci i dati che desideri associare al tuo test. Email facoltativa: serve per identificare la tua richiesta, non per pubblicità automatica.</p><div class="km-fields"><label>Nome<input id="km-name" maxlength="60" placeholder="Nome" autocomplete="given-name"></label><label>Cognome<input id="km-surname" maxlength="70" placeholder="Cognome" autocomplete="family-name"></label><label>Email<input id="km-email" type="email" maxlength="160" placeholder="nome@email.it" autocomplete="email" inputmode="email"></label></div><label class="km-consent"><input id="km-consent" type="checkbox"> <span>Acconsento all'invio del mio nome, cognome, email e delle risposte al gestore del test per conservare il mio risultato. Posso svolgere il test anche senza inviarli.</span></label><button type="button" id="km-name-save">Personalizza e salva</button><p id="km-save-status" class="km-save-status" role="status" aria-live="polite"></p></section>`;
 const html=`<div id="km-report"><div class="km-hero"><div class="km-over">✦ KING EUROPE · WELLBEING</div><h1>Il tuo profilo di benessere</h1><p>Un percorso personale costruito sulle tue risposte.</p><div class="km-date">${new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})} · Test gratuito</div></div>${nameField}<div class="km-intro"><b>Da dove cominciare</b><p>Le aree sono ordinate da quelle che nelle tue risposte richiedono più attenzione alle tue risorse percepite.</p><div class="km-mini">${sorted.map(a=>`<div><span>${safe(a.name)}</span><span style="color:${color(a.v)}">${a.v}/100</span></div>`).join('')}</div></div>${cards}<div class="km-final"><h2>Il tuo prossimo passo</h2><p>Puoi approfondire anche gli altri test gratuiti. Non è necessario acquistare integratori per completare questo percorso.</p><a href="./test-integratori.html">Test Integratori ↗</a><a href="./test-alimentazione.html">Test Alimentazione ↗</a></div><div class="km-disclaimer">Questo questionario non è un esame medico: non misura ormoni o neurotrasmettitori, non diagnostica carenze e non prescrive cure. Le schede prodotto sono contenuti commerciali di KING EUROPE, da valutare secondo etichetta e con un professionista quando necessario.</div><div class="km-actions"><button type="button" id="km-print">📄 Salva PDF / Stampa</button><button type="button" id="km-export">↓ Esporta il tuo risultato</button><button type="button" id="km-restart">↻ Rifai il test</button></div><p class="km-privacy">Il risultato viene salvato in questo browser. L'invio al gestore avviene soltanto con consenso esplicito, se il server di raccolta è stato configurato.</p></div>`;
 queueMicrotask(()=>{const el=document.getElementById('km-report');if(!el)return;
  const stored=(()=>{try{return JSON.parse(localStorage.getItem('king-wellbeing-public-last')||'null')}catch{return null}})();
  const inputs={name:document.getElementById('km-name'),surname:document.getElementById('km-surname'),email:document.getElementById('km-email')};
  for(const k of Object.keys(inputs)) if(stored?.[k]) inputs[k].value=stored[k];
  const status=document.getElementById('km-save-status'), button=document.getElementById('km-name-save');
  function snapshot(){return {schema_version:'2.0',test:'king-benessere',name:inputs.name.value.trim(),surname:inputs.surname.value.trim(),email:inputs.email.value.trim(),date:new Date().toISOString(),values:values.slice(),areas:areas.map(a=>a.name)};}
  function localSave(){const obj=snapshot();try{localStorage.setItem('king-wellbeing-public-last',JSON.stringify(obj))}catch(e){status.textContent='Spazio locale insufficiente; esporta il risultato.'}return obj;}
  localSave();
  button.onclick=async()=>{
   if(!inputs.email.checkValidity()){inputs.email.reportValidity();return;}
   const obj=localSave();
   if(!document.getElementById('km-consent').checked){status.textContent='✓ Rapporto personalizzato e salvato su questo dispositivo. Nessun dato inviato al negozio.';return;}
   const endpoint=cfg().submissionEndpoint;
   if(!endpoint||!/^https:\/\//.test(endpoint)){status.textContent='✓ Salvato sul dispositivo. Invio al negozio non attivo: configura il servizio di raccolta in KING_report_config.js.';return;}
   button.disabled=true;status.textContent='Invio del rapporto in corso…';
   try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);let res;
    try{res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...obj,consent:true}),signal:controller.signal})}finally{clearTimeout(timer)}
    if(!res.ok)throw Error('HTTP '+res.status);
    status.textContent='✓ Salvato sul dispositivo e ricevuto dall’archivio KING EUROPE.';
   }catch(e){status.textContent='✓ Salvato sul dispositivo, ma NON ricevuto dall’archivio. Controlla la connessione o riprova.';}finally{button.disabled=false;}
  };
  document.getElementById('km-print').onclick=()=>{localSave();window.print()};
  document.getElementById('km-export').onclick=()=>{const obj=localSave();const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='KING-EUROPE-il-mio-test.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)};
  document.getElementById('km-restart').onclick=()=>{location.reload()};
 });
 return html;
};
})();
