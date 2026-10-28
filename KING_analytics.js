/* KING BENESSERE — Analytics opzionale v1. Nessun dato del questionario o anagrafico inviato. */
(function () {
  'use strict';
  // Inserisci solo il codice del sito creato su https://www.goatcounter.com/ (NON password o chiavi API).
  var SITE_CODE = '';  // Esempio: 'kingbenessere'
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/i.test(SITE_CODE)) return;
  var gc = document.createElement('script');
  gc.src = 'https://gc.zgo.at/count.js';
  gc.async = true;
  gc.setAttribute('data-goatcounter', 'https://' + SITE_CODE + '.goatcounter.com/count');
  document.head.appendChild(gc);

  function send(path, title) {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({path:path, title:title, event:true, no_session:true});
    }
  }
  function productId(url) {
    try {
      var u = new URL(url, location.href);
      if (!/(^|\.)ebay\.(it|com|de|fr|es|co\.uk)$/.test(u.hostname) &&
          u.hostname !== 'ebay.io' && u.hostname !== 'www.ebay.io') return null;
      var match = u.pathname.match(/\/itm\/(?:[^/]+\/)?(\d{9,15})(?:\/|$)/);
      return match ? match[1] : 'ebay-link';
    } catch (_) { return null; }
  }
  // Delegazione: include automaticamente i nuovi prodotti inseriti in futuro, anche dopo il caricamento.
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var id = productId(a.href);
    if (id) send('ebay-' + id, 'Apertura prodotto eBay ' + id);
  }, true);

  // Campagna QR TikTok: registra un evento dedicato quando il QR contiene utm_source=tiktok.
  try {
    var params = new URLSearchParams(location.search);
    if ((params.get('utm_source') || '').toLowerCase() === 'tiktok') {
      function campaign() { send('campagna-tiktok-qr', 'Visita da QR TikTok'); }
      if (document.readyState === 'complete') campaign();
      else window.addEventListener('load', campaign, {once:true});
    }
  } catch (_) {}
})();
