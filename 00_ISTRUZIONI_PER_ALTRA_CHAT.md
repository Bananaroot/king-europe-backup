# KING EUROPE — CONSEGNA SCIENTIFICA V4 (CUMULATIVA)

**Questa V4 sostituisce le PROPOSTE V1/V2/V3, NON il database reale esistente.**

1. Leggi `01_ARCHIVIO_CUMULATIVO_V4.json`, `02_GERARCHIA_TASSONOMIA_V4.json`, `03_REGOLE_PUNTEGGI_V4.json`. Contiene anche i due record originali aceto di mele e Spirulina di V3.
2. Prima di importare, esamina `database-scientifico.html`, `king-database-scientifico.json`, `KING_scienza_logica.js`, `regole-abbinamento-prodotti.json`, `KING_catalogo_ebay.js` nella loro versione attuale. Lo schema V4 è **PROPOSTO, NON IMPORT-READY**.
3. Produci una mappa campo originale → nuovo campo; crea un backup del JSON; migra con upsert transazionale su ID stabili e deduplica per alias. Non cancellare né modificare dati preesistenti senza riconciliazione.
4. La gerarchia è **famiglia → sottogruppo → ingrediente → sostanza attiva**, con relazioni non gerarchiche verso nutrienti e funzioni. Una ricerca specifica apre il dettaglio, la famiglia fa da indice; NON ereditare automaticamente benefici, vitamine e rischi dalla famiglia.
5. Ogni composizione e beneficio deve distinguere *citazione storica riformulata*, *evidenza moderna*, *dose*, *popolazione*, *forza delle prove*, *rischi* e *claim commerciale autorizzato* (inizialmente non verificato).
6. Score 1–10 SOLO quando dati comparabili lo permettono; `null` se ignoto. Rosso = blocco automatico raccomandazioni, non un semplice malus. Non diagnosticare tramite Test Benessere.
7. Non modificare Cloudflare Worker, Test Benessere, sistemi di vendita, menu o UI non richiesti. Non attribuire prodotti OstroVit/Bulk/eBay senza catalogo ed etichetta verificati.
8. L'indice del libro e il materiale precedente restano preservati. L'originale Hannes è fonte BASE STORICA, gli aggiornamenti moderni si aggiungono separatamente.
9. Dopo integrazione, restituisci al Laboratorio il **formato JSON effettivo** e l'esito della migrazione, perché le prossime schede siano native.

NOTA: la famiglia 'alghe' ha senso editoriale, ma Spirulina e Klamath sono cianobatteri; Kelp è alga bruna. Il beta-carotene è un carotenoide e un precursore della vitamina A, non un sinonimo di vitamina A.
