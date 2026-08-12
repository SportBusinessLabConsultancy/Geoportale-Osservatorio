# 🗺️ Geoportale Osservatorio Sport e Territorio

**Visore cartografico interattivo per l'analisi territoriale integrata di dati demografici, sportivi ed energetici a livello comunale italiano.**

## 🌍 Demo online

**🔗 Visore live:** https://sportbusinesslabconsultancy.github.io/Geoportale-Osservatorio/

**📦 Repository:** https://github.com/SportBusinessLabConsultancy/Geoportale-Osservatorio

12 capitoli tematici · 29 viste interattive · MapLibre GL JS + PMTiles, nessun server richiesto

---

## 📌 Descrizione

Il **Geoportale Osservatorio** è uno strumento di analisi territoriale interattiva sviluppato nell'ambito del progetto Stage 2026 SBL Consultancy. Il portale integra dati provenienti da fonti ufficiali ISTAT, dal Censimento della Popolazione 2021 e da dataset geografici nazionali, organizzati in 12 sezioni tematiche: Popolazione, Spazi Sportivi, Abitazioni, Istruzione, Spopolamento, Energia Rinnovabile, Indici COIN-R, Analisi Integrata, Luoghi Culturali, Eolico Onshore, Impianti Idroelettrici e Uso del Suolo.

Per ogni sezione è possibile esplorare i dati a livello comunale, visualizzare la simbologia graduata e consultare gli attributi di ogni territorio tramite popup interattivi. Il portale include inoltre l'indice di deprivazione sportiva e l'analisi incrociata tra dotazione sportiva e spopolamento demografico, strumento chiave per orientare le politiche di investimento nei territori più vulnerabili.

---

## 🎯 Obiettivi

- Integrare in un unico visore cartografico dati eterogenei su sport, demografia, energia e cultura a livello comunale italiano
- Fornire uno strumento di analisi territoriale accessibile e interattivo per supportare le decisioni di policy in ambito sportivo e di sviluppo locale
- Costruire un indice composito di dotazione sportiva comunale e un sistema di classificazione integrata dei comuni (cluster) che combini sport, spopolamento ed energia rinnovabile
- Pubblicare il geoportale come risorsa open access su GitHub Pages, senza necessità di server o infrastrutture dedicate

---

## 🗂️ Sezioni Tematiche

### 👥 Popolazione
Distribuzione della popolazione residente per comune (Censimento ISTAT 2021). La scala cromatica è in scala logaritmica per evidenziare le differenze tra piccoli comuni e grandi centri urbani: dal blu scuro (pochi abitanti) al blu chiaro (grandi città, oltre 400.000 abitanti). Sono disponibili tre viste: popolazione totale, età media e incidenza della popolazione straniera.

### 🏟️ Spazi Sportivi
Dotazione di spazi e infrastrutture sportive per comune, basata su dati OSM e indici regionali. L'indice di dotazione sportiva (0-100) combina numero di aree, strutture e percorsi sportivi normalizzati per popolazione. Scala logaritmica per evidenziare la distribuzione su tutto il territorio. Tre viste disponibili: indice complessivo, numero di aree sportive e superficie totale dedicata.

### 🏠 Abitazioni
Caratteristiche del patrimonio abitativo per comune (Censimento ISTAT 2021). Le viste mostrano la percentuale di abitazioni occupate, vuote e il numero di famiglie residenti, indicatori della vitalità residenziale del territorio.

### 🎓 Istruzione
Livello di istruzione della popolazione per comune (Censimento ISTAT 2021, popolazione 9 anni e oltre). Percentuali calcolate sul totale della popolazione in età scolare e post-scolare. Tre viste disponibili: laureati, diplomati e popolazione senza titolo di studio.

### 📉 Spopolamento
Variazione percentuale della popolazione residente tra il 2001 e il 2021 per comune. Dal rosso scuro (forte spopolamento) al bianco (crescita demografica). Le altre due viste forniscono indicatori di marginalità territoriale: distanza dalla stazione ferroviaria più vicina e numero di servizi essenziali presenti nel comune.

### ⚡ Energia Rinnovabile
Indice di energia rinnovabile e potenza installata per fonte (fotovoltaico, idroelettrico) a livello comunale. L'indice complessivo normalizza la potenza rinnovabile installata per popolazione residente; le altre due viste mostrano la potenza installata (kW) per le due principali fonti rinnovabili.

### 📊 Indici COIN-R
Indici composti regionali del modello COIN-R relativi a salute, ambiente, economia, società, mobilità e tecnologia. Sei viste disponibili, una per ciascun indice (0-100); valori più alti indicano migliori condizioni regionali.

### 💨 Eolico Onshore
Aree eoliche onshore in Italia, classificate per potenziale produttivo (kWh/m²/anno stimato, 1=2000-2500, 5=oltre 4000), con confini comunali di riferimento. Dati 2023.

### 💧 Impianti Idroelettrici
Impianti idroelettrici in Italia per tipologia (fluente, bacino, serbatoio, acquedotto, pompaggio), con confini comunali di riferimento. Dati 2024.

### 🔍 Analisi Integrata
Analisi integrata che combina indice di dotazione sportiva, indice di energia rinnovabile, variazione demografica e indice di vecchiaia per comune, con riferimento all'indice di salute regionale COIN-R. La Vista 1 mostra l'indice di dotazione sportiva; la Vista 2 mostra la classificazione integrata dei comuni in 4 cluster:
- 🟢 **Attrattivo sportivo** — alta dotazione sportiva, crescita demografica
- 🟠 **Potenziale inespresso** — buona dotazione sportiva, ma spopolamento in atto
- 🔵 **Resiliente sportivo** — dotazione sportiva nella media, territorio stabile
- 🔴 **Comune fragile** — bassa dotazione sportiva e spopolamento accentuato

### 🏛️ Luoghi Culturali
Localizzazione di istituti e luoghi della cultura in Italia (musei, gallerie, archivi, biblioteche e altri istituti), elaborati da dati del Ministero della Cultura, con confini comunali di riferimento. Ogni punto rappresenta un singolo istituto culturale.

### 🌿 Uso del Suolo
Copertura e uso del suolo in Italia secondo il dataset CORINE Land Cover 2018 (ISPRA), aggregato nelle 5 macro-categorie di I livello: superfici artificiali, superfici agricole, foreste e ambienti seminaturali, zone umide e corpi idrici. Fornisce il contesto territoriale di riferimento per gli altri indicatori dell'osservatorio.

---

## 📊 Risultati principali

- I comuni del Sud Italia e delle aree interne mostrano i valori più bassi di dotazione sportiva, spesso coincidenti con forti dinamiche di spopolamento
- Il cluster "Comune fragile" (circa 2.700 comuni, il 34% del totale) identifica i territori prioritari per interventi di investimento sportivo
- La correlazione tra dotazione sportiva e presenza di servizi essenziali conferma il ruolo dello sport come indicatore proxy di qualità dei servizi territoriali
- Le regioni del Nord-Ovest e dell'Emilia-Romagna presentano i valori più alti di energia rinnovabile installata per abitante
- I luoghi culturali si concentrano nelle aree urbane e nei capoluoghi, con una distribuzione più rarefatta nelle aree interne

---

## 🛠️ Tecnologie utilizzate

| Componente | Tecnologia |
|---|---|
| GIS Desktop | QGIS + Plugin QuickWebViewer |
| Elaborazione dati | Python (geopandas, pandas) |
| Tile vettoriali | PMTiles (go-pmtiles v1.31.2) |
| Rendering mappe | MapLibre GL JS |
| Frontend | Vue.js + Vuetify |
| Hosting | GitHub Pages (statico, senza server) |

---

## 📁 Struttura del progetto

```
osservatorio-sport/
├── README.md
├── index.html                    # Entry point del viewer
├── app/
│   ├── index.js                  # Logica viewer (Vue.js)
│   ├── customviewer.js
│   ├── styles.css
│   ├── customcolors.css
│   └── i18n/words.js
├── vendor/                       # Librerie JS (MapLibre, Vue, Vuetify, PMTiles)
│   ├── maplibre-gl.js
│   ├── pmtiles.js
│   └── ...
└── data/
    ├── conf.json                 # Configurazione 12 capitoli e 29 viste
    └── tileserver/               # File .pmtiles (tile vettoriali)
        ├── Popolazione.pmtiles
        ├── SpaziSportivi.pmtiles
        ├── Abitazioni.pmtiles
        ├── Istruzione.pmtiles
        ├── Spopolamento.pmtiles
        ├── Energia.pmtiles
        ├── CoinR.pmtiles
        ├── AnalisiIntegrata.pmtiles
        ├── LuoghiCulturaliPunti.pmtiles
        ├── EolicoOnshore.pmtiles
        ├── IdrImpianti.pmtiles
        └── usodelsuolo.pmtiles
```

---

## 📂 Dati

| Fonte | Descrizione |
|---|---|
| ISTAT Censimento 2021 | Popolazione, abitazioni, istruzione a livello comunale |
| OpenStreetMap + Sport e Salute | Aree e infrastrutture sportive (20 regioni) |
| Modello COIN-R | Indici compositi regionali (6 temi) |
| ISPRA / GSE | Energia rinnovabile (fotovoltaico, eolico, idroelettrico) |
| Ministero della Cultura | Istituti e luoghi della cultura (6.125 punti) |
| ISPRA SINAnet CLC2018 | CORINE Land Cover (115.782 poligoni, 43 classi) |
| ISTAT Limiti 2021 | Confini amministrativi comuni, province, regioni |

---

## 🔗 Link utili

🌐 [SBL Consultancy](https://www.sblconsultancy.it)
📖 [QuickWebViewer Plugin](https://quickwebviewer.org)
🗺️ [MapLibre GL JS](https://maplibre.org)

---

**Elaborazione:** Pegoraro Carlo — Stage 2026, SBL Consultancy  
**Tutor:** Simone Modugno  
**Dati:** ISTAT Censimento 2021, Modello COIN-R, Ministero dell'Ambiente  
**Strumenti:** QGIS, QuickWebViewer, PMTiles, MapLibre GL JS
