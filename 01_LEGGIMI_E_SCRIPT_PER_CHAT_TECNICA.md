# KING EUROPE — ISTRUZIONI PRIORITARIE ALLA CHAT TECNICA

## Nuova direttiva (sostituisce la vecchia logica quando incompatibile)
Questo è il pacchetto UNICO V3 che incorpora il patrimonio V1 e l’ampliamento V2. Non importare V1 e V2 separatamente. Il nuovo modello è una **biblioteca scientifica di affermazioni tracciabili e confrontabili**, non un elenco pubblicitario di benefici. La V3 è una consegna di dati e regole, NON un archivio già integrato.

### Sequenza obbligatoria
1. Fare un backup verificabile dei file del KING EUROPE BACKUP; esaminare il database scientifico originale e gli script esistenti, INCLUSI ID, relazioni, import/export, UI e dipendenze.
2. Leggere nell’ordine 02 (ingredienti e libro), 03 (tassonomia), 04 (score), 05 (esempio confronti) e 06 (indice). Considerare lo schema proposto, non quello definitivo.
3. Redigere una mappatura campo per campo vecchio→nuovo, preservare tutti i record e creare un importatore compatibile *idempotente* (upsert su ID stabile, senza duplicati). NON sovrascrivere l’intero JSON originario. In caso di conflitto, mantenere i dati originali e segnalare il conflitto per revisione.
4. Collegare le affermazioni al loro tipo di fonte: libro storico/pagina, studio umano, meccanismo plausibile, fonte regolatoria; distinguere fatto verificato, ipotesi, tradizione e claim commerciale ammesso. L'autore non è prova clinica: mantenere il libro come BASE storica senza cancellarlo.
5. Attivare classificazione multidimensionale: vitamine individuali, minerali individuali, aminoacidi, lipidi, composti bioattivi, organi e funzioni, benefici specifici per esito misurabile, utilizzi tradizionali, interazioni, eventi avversi, gruppi speciali, dosi/formulazioni e controllo qualità. Assenza del dato = null / non verificato; mai inferire vitamine o efficacia dal nome o dalla categoria.
6. Punteggi 1–10 **per singolo esito e specifico contesto**: forza delle evidenze, ampiezza del beneficio, corrispondenza della dose, gravità del rischio, probabilità del rischio, qualità del prodotto. Numeri SOLO se giustificati da fonti e criteri; valori incerti = null. Verde/giallo/rosso per singola dimensione, più stato 'non valutabile'. I colori di beneficio non compensano le allerte di sicurezza. Non fare somme automatiche che simulino una prescrizione.
7. Per i confronti: verificare stesso obiettivo, misura clinica, popolazione, forma e dose, qualità degli studi, rischi individuali, interazioni, controindicazioni, qualità produttore; se i dati non consentono il confronto rispondere 'NON CLASSIFICABILE' e motivare. Non dire mai 'senza effetti collaterali'.
8. Collegare ai prodotti KING OstroVit/Bulk e ai link eBay solo dopo la verifica di etichette, dosi, immagini e indirizzi. NON suggerire prodotti tramite Test Benessere né modificare test senza una richiesta specifica. I test non diagnosticano carenze o livelli ormonali.
9. Ampliare la pagina scientifica già esistente per ricerca, filtri, schede espandibili, collegamenti, corso, bibliografia, import/export e compatibilità mobile, MA solo dopo mappatura e con il menu e lo stile KING invariati.
10. NON toccare Worker Cloudflare, sistemi di vendita, navigazione principale, magazzino operativo o test. Dopo l’integrazione verificare record preesistenti, ricerca, link, backup e rollback, su copia di prova prima del sito attivo.

### Stato scientifico e documentale
- Il libro è Hendrik Hannes, *Integratori alimentari*, Edizioni Il Punto d'Incontro, prima ed. italiana 2001, ristampa 2004. Le pagine 16–20 sono Aceto di mele. Spirulina inizia a p.31 e continua a p.32; Klamath segue da p.32. Pagina 170 non è Spirulina.
- Le fotografie della prefazione pp. 7–15 forniscono orientamento storico e NON dimostrazione di efficacia.
- L'archivio 02 contiene **solo due ingredienti**; le valutazioni sono provvisorie e non sono una revisione clinica sistematica. La tassonomia 03 è espandibile senza cancellare termini precedenti.
- Nessuna compatibilità tecnica è stata certificata, perché il JSON originale del KING EUROPE MANAGER non è stato fornito al laboratorio. Prima di attivare qualunque import serve la verifica tecnica.

### Risultato da restituire al laboratorio
Restituisci lo schema effettivo dopo la mappatura, le regole per ID/merge/versione, gli eventuali campi non supportati, il file JSON finale compatibile e l’esito dei test di conservazione dati. Questo schema verrà riutilizzato per ogni ingrediente nuovo.
