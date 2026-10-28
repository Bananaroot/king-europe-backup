/* KING BENESSERE — integrazione pubblica, nessuna chiave privata in GitHub.
 * Attiva solo dopo aver pubblicato la funzione server e configurato HTTPS.
 */
window.KING_TEST_SYNC_ENDPOINT = window.KING_TEST_SYNC_ENDPOINT || "";
window.KingPublicTestSync = {
  submit: async function(type, form, choices, lines) {
    const status = document.getElementById('status');
    const values = Object.fromEntries(new FormData(form).entries());
    const record = {
      test:type,
      name:String(values.first_name||'').trim(),
      surname:String(values.last_name||'').trim(),
      email:String(values.email||'').trim(),
      country:String(values.country||'').trim(),
      values:choices.map(Number),
      date:new Date().toISOString(),
      consent:form.elements.consent.checked === true,
      marketing:form.elements.marketing.checked === true
    };
    try {
      const key='king_pubblico_'+type+'_ultimo';
      localStorage.setItem(key,JSON.stringify(record));
    } catch (_) {}
    const endpoint=window.KING_TEST_SYNC_ENDPOINT;
    if (!record.consent) {
      if(status) status.textContent='PDF disponibile. Non hai autorizzato l’invio del profilo al database.';
      return;
    }
    if(!/^https:\/\//i.test(endpoint)) {
      if(status) status.textContent='PDF disponibile. Archivio online non ancora collegato: il risultato non è stato inviato.';
      return;
    }
    if(status) status.textContent='Invio del profilo in corso…';
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(record)});
      if(!response.ok) throw new Error('HTTP '+response.status);
      const reply=await response.json();
      if(reply.ok!==true) throw new Error('No confirmation');
      if(status) status.textContent='Profilo salvato nel database KING BENESSERE.';
    } catch (_) {
      if(status) status.textContent='PDF disponibile, ma invio al database non riuscito. Riprova quando il servizio è attivo.';
    }
  }
};
