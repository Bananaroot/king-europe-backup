/* KING 3.0 - interruttore clic eBay; non cambia grafica o catalogo.
   Aggancia solo i link prodotti mostrati da KING_REPORT. */
(function(){
  'use strict';
  const CLICK = 'https://king-benessere-click.vania-dadea.workers.dev/go';
  function isEbay(url){
    try {
      const u = new URL(url,location.href);
      const host = u.hostname.toLowerCase();
      return u.protocol === 'https:' && (
        host === 'ebay.io' || host === 'www.ebay.io' ||
        /(^|\.)ebay\.(it|com|co\.uk|de|fr|es|pl)$/.test(host)
      );
    } catch(_) {return false;}
  }
  document.addEventListener('click',function(e){
    const a=e.target.closest?.('a.km-product');
    if(!a || !isEbay(a.href))return;
    // Il browser segue il link di tracciamento; il Worker registra e rimanda a eBay.
    const dest=new URL(CLICK);
    dest.searchParams.set('u',a.href);
    dest.searchParams.set('n',(a.querySelector('b')?.textContent||'Prodotto').slice(0,120));
    dest.searchParams.set('v','v2-3.0');
    const campaign=(new URLSearchParams(location.search).get('campagna')||'').slice(0,60);
    if(campaign)dest.searchParams.set('c',campaign);
    a.href=dest.toString();
  },true);
})();
