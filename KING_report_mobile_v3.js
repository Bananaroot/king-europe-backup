/* KING EUROPE · rapporto pubblico mobile. Calcoli e salvataggio sul dispositivo. */
(function(){
const areas=[
 {chem:'Dopamina',formula:'C₈H₁₁NO₂',name:'Motivazione',about:'La dopamina partecipa ai processi di motivazione e apprendimento. Il punteggio descrive il tuo vissuto, non la sua concentrazione.',tip:'Prova a dedicare dieci minuti a una piccola attività che ti piace.',tags:['tirosina','l-tirosina']},
 {chem:'Serotonina',formula:'C₁₀H₁₂N₂O',name:'Serenità',about:'La serotonina è un neurotrasmettitore coinvolto in numerosi processi. Le risposte non indicano una carenza.',tip:'Cerca di mantenere regolarità nel sonno e un po’ di luce naturale.',tags:[]},
 {chem:'Ossitocina',formula:'C₄₃H₆₆N₁₂O₁₂S₂',name:'Relazioni',about:'L’ossitocina è coinvolta in diversi processi fisiologici e sociali. Questo questionario non ne misura i livelli.',tip:'Dedica del tempo a una persona con cui ti senti a tuo agio.',tags:[]},
 {chem:'Cortisolo',formula:'C₂₁H₃₀O₅',name:'Gestione dello stress',about:'Il cortisolo è coinvolto nella risposta allo stress. Un punteggio basso non significa avere cortisolo alto o basso.',tip:'Alterna gli impegni a pause brevi e sostenibili.',tags:[]},
 {chem:'Testosterone',formula:'C₁₉H₂₈O₂',name:'Energia',about:'Il testosterone svolge ruoli importanti nell’organismo. La percezione di energia non permette di valutarne i livelli.',tip:'Considera sonno, alimentazione varia e movimento adeguato.',tags:[]}
];
const KING_V2_I18N={"en":{"hero":"Your wellbeing profile","intro":"A personal overview based on your answers.","free":"Free questionnaire","personal":"Personalize your report","personalhelp":"Add the details you wish to associate with your report. Email is optional.","first":"First name","last":"Last name","agree":"I consent to sending my name, email and questionnaire scores to the test operator to store my result. I can take the questionnaire without sending anything.","save":"Personalize and save","begin":"Where to start","beginhelp":"These areas are ordered from those needing more attention in your answers to your perceived strengths.","tip":"A small step","product":"Explore a relevant product","open":"View product on eBay ↗","copy":"eBay URL (copy and paste):","next":"Continue your wellbeing journey","nexthelp":"You can take another free questionnaire. No purchase is required.","supp":"Next: Supplements questionnaire →","food":"Then: Food questionnaire →","notice":"This questionnaire is not a medical examination, does not measure hormones or neurotransmitters and cannot diagnose deficiencies. Product links are commercial.","print":"📄 Save PDF / Print","export":"↓ Export my results","again":"↻ Retake questionnaire","privacy":"Your result stays on this device; no personal details are requested or sent.","low":"Area to explore","mid":"Mixed experience","high":"Perceived strength","names":["Motivation","Calm","Relationships","Stress management","Energy"],"about":["Dopamine is involved in motivation and learning. Your score describes your experience, not your dopamine level.","Serotonin is a neurotransmitter involved in many processes. Your answers cannot identify a deficiency.","Oxytocin is involved in various physiological and social processes. This questionnaire does not measure its levels.","Cortisol is involved in the response to stress. A low score does not mean high or low cortisol.","Testosterone has important roles in the body. Perceived energy cannot reveal its levels."],"actions":["Spend ten minutes on a small activity you enjoy.","Try to keep a regular sleep routine and get some daylight.","Spend time with someone you feel comfortable with.","Alternate tasks with short, sustainable breaks.","Consider sleep, varied nutrition and suitable physical activity."]},"ru":{"hero":"Ваш профиль самочувствия","intro":"Личный обзор на основе ваших ответов.","free":"Бесплатный опрос","personal":"Персонализируйте отчёт","personalhelp":"Укажите данные по желанию. Email необязателен.","first":"Имя","last":"Фамилия","agree":"Я согласен(на) на отправку моих данных и результатов организатору для сохранения. Участие возможно и без отправки.","save":"Сохранить отчёт","begin":"С чего начать","beginhelp":"Сначала показаны области, которым, по вашим ответам, стоит уделить внимание.","tip":"Небольшой шаг","product":"Подходящий товар для ознакомления","open":"Посмотреть на eBay ↗","copy":"Ссылка eBay (скопируйте):","next":"Продолжите знакомство с собой","nexthelp":"Вы можете пройти другие бесплатные опросы. Покупка не требуется.","supp":"Далее: опрос о добавках →","food":"Затем: опрос о питании →","notice":"Опрос не является медицинским обследованием, не измеряет гормоны и не устанавливает дефициты. Ссылки на товары носят коммерческий характер.","print":"📄 Сохранить PDF / Печать","export":"↓ Скачать результат","again":"↻ Пройти заново","privacy":"Результат сохраняется на устройстве; личные данные не запрашиваются и не отправляются.","low":"Область внимания","mid":"Переменное состояние","high":"Ваш ресурс","names":["Мотивация","Спокойствие","Отношения","Стресс","Энергия"],"about":["Дофамин участвует в мотивации и обучении. Оценка отражает ощущения, а не уровень вещества.","Серотонин участвует во многих процессах. Ответы не позволяют выявить дефицит.","Окситоцин участвует в социальных и физиологических процессах. Опрос не измеряет его уровень.","Кортизол связан с реакцией на стресс. Низкий балл не означает повышенный или пониженный кортизол.","Тестостерон выполняет важные функции. По ощущению энергии нельзя определить его уровень."],"actions":["Уделите десять минут занятию, которое вам нравится.","Соблюдайте режим сна и проводите время при дневном свете.","Пообщайтесь с человеком, рядом с которым вам спокойно.","Чередуйте дела с короткими перерывами.","Обратите внимание на сон, разнообразное питание и движение."]}};
const v2Language=()=>{try{return typeof lang!=="undefined"&&["ru","en"].includes(lang)?lang:"it"}catch{return "it"}};
const v2Text=(key)=>KING_V2_I18N[v2Language()]?.[key]||{
 hero:"Il tuo profilo di benessere",intro:"Un percorso personale costruito sulle tue risposte.",free:"Test gratuito",personal:"Personalizza il tuo rapporto",personalhelp:"Inserisci i dati che desideri associare al tuo test. Email facoltativa.",first:"Nome",last:"Cognome",agree:"Acconsento all'invio dei dati e dei punteggi al gestore del test per conservare il risultato. Posso continuare senza inviare dati.",save:"Personalizza e salva",begin:"Da dove cominciare",beginhelp:"Le aree sono ordinate da quelle che richiedono più attenzione alle tue risorse percepite.",tip:"Un piccolo passo",product:"Approfondimento · un prodotto pertinente",open:"Guarda il prodotto su eBay ↗",copy:"Link eBay (copia/incolla):",next:"Continua il tuo percorso",nexthelp:"Puoi fare anche gli altri test gratuiti. Non serve acquistare prodotti.",supp:"Avanti: Test Integratori →",food:"Poi: Test Alimentazione →",notice:"Questo questionario non è un esame medico, non misura gli ormoni e non diagnostica carenze. Le schede prodotto hanno finalità commerciali.",print:"📄 Salva PDF / Stampa",export:"↓ Esporta il tuo risultato",again:"↻ Rifai il test",privacy:"Il risultato resta in questo browser. L'invio al gestore avviene soltanto con consenso, se il servizio è configurato.",low:"Area da approfondire",mid:"Equilibrio variabile",high:"Risorsa percepita",names:areas.map(a=>a.name),about:areas.map(a=>a.about),actions:areas.map(a=>a.tip)
 }[key];
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=v=>v<=33?v2Text('low'):v<=66?v2Text('mid'):v2Text('high');
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
// Un prodotto compare una sola volta nel rapporto, con ragione specifica per area.
const AREA_TEXT={
  0:'La tirosina è un precursore usato dall’organismo per sintetizzare catecolamine, tra cui la dopamina. Questo non significa che l’integratore aumenti motivazione o dopamina.',
  1:'Il magnesio contribuisce alla normale funzione psicologica. Non misura né regola direttamente la serotonina.',
  3:'Magnesio e vitamina B6 contribuiscono alla normale funzione psicologica e del sistema nervoso. Sono funzioni nutrizionali, non una riduzione dimostrata del cortisolo.',
  4:'Magnesio e vitamine B6/B12 contribuiscono al normale metabolismo energetico e alla riduzione di stanchezza e affaticamento, con apporti adeguati. Non correggono il testosterone.'
};
function productsFor(i,used){
 const candidates=links().filter(x=>
   x.active!==false && Array.isArray(x.recommended_areas) && x.recommended_areas.includes(i) &&
   typeof x.image==='string' && /^data:image\/(?:jpeg|png|webp);base64,/.test(x.image) &&
   typeof x.url==='string' && /^https:\/\/(?:www\.ebay\.it\/itm\/|ebay\.io\/m\/)/i.test(x.url) &&
   !used.has(x.url.split('?')[0].toLowerCase())
 );
 const chosen=candidates.slice(0,1);
 return chosen.map(x=>{used.add(x.url.split('?')[0].toLowerCase());return {...x,reason:(x.area_reasons||{})[String(i)]||'Approfondisci composizione e precauzioni sulla scheda prodotto.'}});
}

if(!document.getElementById('king-pdf-visible-urls')){
 const st=document.createElement('style');st.id='king-pdf-visible-urls';
 st.textContent='.km-print-link{display:block;margin-top:7px;font-size:11px;line-height:1.5;overflow-wrap:anywhere;word-break:break-all;color:#b8a687}@media print{.km-print-link{display:block!important;color:#333!important;font:10px/1.4 Arial,sans-serif!important;overflow-wrap:anywhere;word-break:break-word;text-decoration:underline;margin-top:6px}.km-product{color:#222!important;text-decoration:none!important}}';
 document.head.appendChild(st);
}
window.kingNewResult=function(values,compare){
 const sorted=areas.map((a,i)=>({...a,i,name:v2Text('names')[i],about:v2Text('about')[i],tip:v2Text('actions')[i],v:values[i]})).sort((a,b)=>a.v-b.v);
 const usedProducts=new Set(); const cards=sorted.map(a=>{const matches=productsFor(a.i,usedProducts);return `<article class="km-card"><div class="km-heading"><span class="km-index">${String(a.i+1).padStart(2,'0')}</span><div><div class="km-over">${safe(a.chem)} · ${safe(a.formula)}</div><h2>${safe(a.name)}</h2></div><span class="km-number" style="color:${color(a.v)}">${a.v}/100</span></div>${chemDrawing(a.i)}<div class="km-meter"><i style="width:${a.v}%;background:${color(a.v)}"></i></div><div class="km-status" style="color:${color(a.v)}">${label(a.v)}</div><p>${safe(a.about)}</p><div class="km-tip"><b>Un piccolo passo</b><p>${safe(a.tip)}</p></div>${matches.length?`<div class="km-products"><div class="km-over">Approfondimento · un prodotto pertinente</div>${matches.map(x=>`<a class="km-product" href="${safe(x.url)}" target="_blank" rel="noopener noreferrer" aria-label="Apri su eBay: ${safe(x.name)}">${x.image?`<img src="${safe(x.image)}" alt="${safe(x.name)}" loading="lazy" onerror="this.style.display='none'">`:'<span class="km-placeholder">✦</span>'}<span><b>${safe(x.name)}</b><small>${safe(x.reason||"Approfondisci ingredienti, etichetta e avvertenze.")}</small><strong>Guarda il prodotto su eBay ↗</strong><span class="km-print-link">Link eBay (copia/incolla): ${safe(x.url)}</span></span></a>`).join('')}</div>`:''}</article>`}).join('');
 const nameField=''; // V3 rapida: nessun modulo anagrafico obbligatorio

 const html=`<div id="km-report"><div class="km-hero"><div class="km-over">✦ KING EUROPE · WELLBEING</div><h1>${v2Text("hero")}</h1><p>${v2Text("intro")}</p><div class="km-date">${new Date().toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})} · ${v2Text("free")}</div></div>${nameField}<div class="km-intro"><b>${v2Text("begin")}</b><p>${v2Text("beginhelp")}</p><div class="km-mini">${sorted.map(a=>`<div><span>${safe(a.name)}</span><span style="color:${color(a.v)}">${a.v}/100</span></div>`).join('')}</div></div>${cards}<div class="km-final"><h2>${v2Text("next")}</h2><p>${v2Text("nexthelp")}</p><a class="km-next-primary" href="./test-integratori.html">${v2Text("supp")}</a><a class="km-next-secondary" href="./test-alimentazione.html">${v2Text("food")}</a></div><div class="km-disclaimer">${v2Text("notice")}</div><div class="km-actions"><button type="button" id="km-print">${v2Text("print")}</button><button type="button" id="km-export">${v2Text("export")}</button><button type="button" id="km-restart">${v2Text("again")}</button></div><p class="km-privacy">${v2Text("privacy")}</p></div>`;
 queueMicrotask(()=>{
  const el=document.getElementById('km-report');if(!el)return;
  function snapshot(){return {schema_version:'3.0',test:'king-benessere-v3',date:new Date().toISOString(),values:values.slice(),areas:areas.map(a=>a.name)};}
  function localSave(){const obj=snapshot();try{localStorage.setItem('king-wellbeing-v3-public-last',JSON.stringify(obj))}catch(e){}return obj;}
  localSave();
  document.getElementById('km-print').onclick=()=>{localSave();window.print();};
  document.getElementById('km-export').onclick=()=>{const obj=localSave();const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='KING-BENESSERE-V3-7-DOMANDE.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)};
  document.getElementById('km-restart').onclick=()=>location.reload();
 });
 return html;
};
})();

/* V3 · 7 domande · stesso sistema di schede eBay e stampa della V2; nessuna registrazione obbligatoria. */
