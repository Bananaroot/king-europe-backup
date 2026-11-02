# KING EUROPE — patrimonio scientifico V3: separazione permanente

## Principio
**La banca dati è la fonte; le regole la interpretano; il software la presenta.** Il programma HTML non deve diventare l'unica copia delle informazioni.

## Livelli, tutti conservati

1. **Fonti originali:** libro, autore, edizione, capitolo, pagina, fotografie mantenute dall'autore del progetto in archivio privato. Le schede citano le fonti, non sostituiscono le fotografie.
2. **Dati estratti:** `02_ARCHIVIO_SCIENTIFICO_ACETO_SPIRULINA.json`, schede ingredienti, composizione, singoli benefici/limiti, note e riferimenti.
3. **Vocabolario e classificazione:** `03_TASSONOMIA_COMPLETA.json` (termini, funzioni, categorie, relazioni), separata dai testi.
4. **Metodologia:** `04_REGOLE_PUNTEGGI_E_SEMAFORI.json` (evidenze, rischi, punteggi per esito e contesto, null quando non valutabile).
5. **Confronti:** `05_CONFRONTI_DIMOSTRATIVI.json` (esempi, non raccomandazioni mediche automatiche).
6. **Indice bibliografico:** `06_INDICE_LIBRO.json`; ogni futura opera manterrà la propria identità.
7. **Visualizzazione:** `king-laboratorio-scientifico.html`, CSS e JS separati; nessuna diagnosi, prescrizione o autoproposta commerciale.
8. **Legacy:** `KING_ARCHIVIO_ORIGINALE_SOLO_COPIA_NON_PUBBLICARE.json`: copia per audit e confronto, non da pubblicare o sovrascrivere sul sito.

## Identità e aggiornamenti

- ID ingredienti stabile, es. `ingredient-spirulina`, mai derivato solo da nome o da ordine.
- Le nuove schede riportano fonti, pagine, livello di verifica e motivi per score null.
- Ogni ingrediente è uno o più record JSON, NON blocchi HTML copiati.
- I nuovi lotti arrivano come JSON con chiave `ingredients` e ID stabili, comprensivi di nuovi `sources` se occorrono.
- `AGGIORNA_ARCHIVIO.py` produce una nuova copia e un rapporto; se la stessa scheda ID è identica la salta, se diversa la segnala senza sovrascriverla; i cambiamenti importanti vanno approvati esplicitamente e versionati.
- Il JS del laboratorio è una **copia di pubblicazione** rigenerabile dal JSON; non è il documento master.
- L'integrazione con `king-database-scientifico.json` richiede una migrazione documentata a parte: non fondere automaticamente i 15 legacy nella V3 e non sostituire i Test Benessere.

## Esempio di aggiornamento

`python AGGIORNA_ARCHIVIO.py 02_ARCHIVIO_SCIENTIFICO_ACETO_SPIRULINA.json NUOVO_LOTTO.json nuovo_rilascio`

Il risultato contiene `KING_ARCHIVIO_V3_UNIFICATO.json`, `RAPPORTO_IMPORTAZIONE.json` e un JS rigenerato. Controllare il rapporto prima di qualsiasi pubblicazione.

## Direttive alla chat che studia il libro

Invia **una consegna JSON incrementale** con ingredienti completi, fonti verificabili, riferimenti alle pagine, classificazione tramite vocabolario V3 e segnalazione esplicita degli elementi incerti. Conserva testi didattici separati dai claim e le valutazioni per esito/popolazione/dose. NON creare HTML o un database indipendente a ogni capitolo. Per modificare una scheda già esistente, proporre una nuova revisione identificabile e motivata, non una sostituzione silenziosa.
