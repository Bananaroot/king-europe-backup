# KING MARKETING CENTER — Specifica di progetto
Versione 0.1 · 1 novembre 2026 · KING EUROPE BACKUP

## Vincoli non negoziabili
- Non modificare il gestionale, i Worker, il magazzino, gli ordini, il catalogo, le registrazioni, i PDF e il tracking eBay che oggi funzionano.
- Nessun token GitHub e nessuna chiave ADMIN_KEY nell'HTML o in un archivio pubblico.
- Separare il registro campagne dai dati personali dei test.
- Il pannello prototipo `KING_MARKETING_CENTER.html` è **autonomo, locale** e non sincronizza con Cloudflare. Prima di cambiare dispositivo esportare il JSON.

## Campagne e post
Ogni campagna ha `id`, codice univoco, nome, stato, data creazione e note. Ogni post ha `id`, `campaignId`, piattaforma, profilo, URL, data, note e visualizzazioni *inserite manualmente*. Aprire i post dal pannello. In seguito: autorizzazione API ove possibile.

## Metriche da rendere disponibili in futuro
1. `page_view`: visita iniziale al test (opzionale, conteggio aggregato).
2. `test_started`: prima risposta.
3. `result_view`: risultato completo mostrato (priorità immediata richiesta).
4. `registration_saved`: conferma **effettiva** di scrittura nella repository/database.
5. `ebay_click`: evento già tracciato dal Worker click attuale, da associare alla campagna solo se identificabile.

Non confondere visite con test completati o clienti. Non mostrare numeri fittizi al posto di metriche non disponibili. Distinguere per canale, campagna e singola pubblicazione attraverso parametri URL e ID evento. Limitare dati personali, definire conservazione e informativa privacy per tracking non strettamente necessario.

## Integrazione futura, solo dopo verifica dello ZIP aggiornato
- Creare un endpoint `POST /event` su Worker dedicato, con rate limiting e validazione campi, e un archivio persistente separato; valutare D1 o altro storage idoneo.
- Pubblicare link campagna diversi (`?utm_source=instagram&utm_campaign=wellness-nov-01&utm_content=post-a`).
- Contare `result_view` nel momento in cui **il risultato è davvero renderizzato**, non all'apertura della pagina.
- Invio non bloccante: `navigator.sendBeacon` o `fetch` con fallback e id evento, senza ritardare o bloccare l'uso del test.
- Testare su Safari e Opera, con e senza email, e con clic eBay. Verificare che vecchi Worker e PDF continuino a funzionare.

## Piano test/PDF successivo (nessuna modifica eseguita)
Fonte di riferimento funzionale: `test-benessere-v2-3-0.html` insieme ai moduli di report effettivamente usati dalla versione online corrente. Non assumere che tutti gli HTML presenti nello ZIP siano pubblicati.

Da analizzare e uniformare singolarmente: `test-benessere-v2.html`, `test-benessere-v3.html`, `test-benessere-v3-3-0.html`, `test-benessere.html`, `test-benessere_PUBBLICO.html`, `test-integratori.html`, `test-alimentazione.html`. Confermare quali sono in uso prima di modificarli.

### Requisiti funzionali
- Per ogni test: mantenere domande e logica esistenti, salvare registrazione e risposte tramite sistema backup senza Supabase, mostrare report e link eBay senza regressioni.
- PDF: riferimento grafico e struttura della versione 3.0, **almeno 6 pagine leggibili** quando il contenuto lo giustifica; niente pagine vuote o testo tagliato, prodotti pertinenti con immagini/link funzionanti, spiegazioni prudenti e non diagnostiche.
- Test breve a 7 domande: sostituire impaginazione PDF scadente con template coerente, senza inventare risultati clinici.
- Test versione 2: aggiungere soltanto la persistenza mancante; non copiare indiscriminatamente le funzioni della 3.0.
- Possibile copertina con DNA/spirale dorata soltanto su una tipologia di report, dopo verifica dello stile.
- Prima di ogni rilascio: backup ZIP, confronto file, test locale, verifica PDF visiva su mobile, verifica salvato nel database, test Worker click.

## Stato consegna
- **Realizzato:** pagina autonoma archivio campagne/post con apertura link, metriche manuali visualizzazioni ed export/import JSON locale.
- **Non realizzato:** collegamento al menu principale, storage centrale, lettura API social, contatore risultati Worker, modifiche ai test, nuovi PDF. Richiedono il backup attuale e la verifica dei collegamenti effettivamente online.
