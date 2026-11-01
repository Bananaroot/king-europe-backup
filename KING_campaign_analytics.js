/* KING marketing: eventi anonimi; non altera i dati del test o i worker esistenti. */
(function(){'use strict';
 const endpoint=String(window.KING_ANALYTICS_ENDPOINT||'').trim();
 const test=(location.pathname.split('/').pop()||'').replace(/[^a-z0-9_-]/gi,'_');
 const campaign=(new URLSearchParams(location.search).get('campagna')||'diretto').slice(0,80).replace(/[^\w-]/g,'_');
 const sidKey='king_analytics_sid_'+test;
 let sid='';try{sid=sessionStorage.getItem(sidKey)||'';if(!sid){sid=crypto.randomUUID();sessionStorage.setItem(sidKey,sid)}}catch(e){sid='session-unavailable'}
 let sent=new Set();
 function emit(event,extra){
   if(!/^https:\/\//.test(endpoint))return false;
   if(!['result_view','shop_click'].includes(event))return false;
   if(event==='result_view'&&sent.has(event))return true;
   if(event==='result_view')sent.add(event);
   const payload={event,test,campaign,session:sid,extra:typeof extra==='number'?extra:undefined};
   const body=JSON.stringify(payload);
   try{if(navigator.sendBeacon){const b=new Blob([body],{type:'text/plain;charset=UTF-8'});if(navigator.sendBeacon(endpoint+'/event',b))return true}}catch(e){}
   fetch(endpoint+'/event',{method:'POST',mode:'cors',keepalive:true,headers:{'Content-Type':'text/plain'},body}).catch(()=>{});return true;
 }
 document.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(!a)return;
   try{const u=new URL(a.href,location.href);if(/(^|\.)(ebay\.it|ebay\.com|ebay\.io|etsy\.com)$/.test(u.hostname))emit('shop_click')}catch(_){}});
 window.KingCampaignAnalytics={emit};
})();
