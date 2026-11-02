/* KING EUROPE · ricerca assistita additiva, nessuna modifica ai database */
(()=>{'use strict';
const input=document.getElementById('search');const panel=document.getElementById('search-panel');const catalog=document.getElementById('items');
if(!input||!panel||!catalog)return;
const guide=document.createElement('div');guide.className='lab-search-guide';guide.innerHTML='<b>🔎 Cerca anche per esigenza o utilizzo</b><div>Prova un ingrediente, una vitamina oppure un argomento come “mal di testa”. Vengono mostrati solo i collegamenti già presenti nelle schede scientifiche.</div><div class="examples"></div>';
panel.appendChild(guide);
const examples=guide.querySelector('.examples');
const data=window.KING_LAB_DATA&&Array.isArray(window.KING_LAB_DATA.ingredients)?window.KING_LAB_DATA.ingredients:[];
const names=data.slice(0,5).map(x=>x.name_it||x.name).filter(Boolean);
['mal di testa',...names].forEach(q=>{const b=document.createElement('button');b.type='button';b.className='lab-example';b.textContent=q;b.addEventListener('click',()=>{input.value=q;input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()});examples.appendChild(b)});
const empty=document.createElement('div');empty.className='lab-empty';empty.hidden=true;catalog.after(empty);
function refresh(){const q=input.value.trim();const shown=[...catalog.querySelectorAll('button.item')].length;empty.hidden=!q||shown>0||data.length===0;if(!empty.hidden){empty.replaceChildren();const strong=document.createElement('strong');strong.textContent='📖 Nessuna scheda collegata a “'+q+'”';const p=document.createElement('p');p.textContent='Non vuol dire che l’argomento non sia utile: significa soltanto che non abbiamo ancora catalogato un collegamento verificabile nei '+data.length+' ingredienti V3.';const b=document.createElement('button');b.type='button';b.textContent='Mostra tutti gli ingredienti';b.onclick=()=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}))};empty.append(strong,p,b)}}
input.addEventListener('input',()=>setTimeout(refresh,0));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,0)));refresh();
})();
