# CSV-Datenstudio

Eine browserbasierte Single-Page-Anwendung (Vite + React + TypeScript) zum
Laden, Durchsuchen, Filtern, Analysieren und Visualisieren von CSV-Dateien –
vollständig clientseitig, ohne Backend. Die App bietet eine sortierbare,
paginierte Datentabelle, Volltextsuche, Spaltenauswahl, eine Filterzeile mit
Bedingungen je Spalte, automatisch erkannte Kennzahlen für numerische Spalten,
selbst gezeichnete Balken- und Liniendiagramme, CSV-Export der gefilterten
Ansicht, Persistenz in LocalStorage, Dark-Mode sowie einen mitgelieferten
Beispieldatensatz und saubere Zustände für Laden, Fehler und leere Daten.

## Tech-Stack

- Sprache: TypeScript
- Framework: React
- Build-Tool: Vite
- Laufzeit: Browser
- Diagramme: selbst gezeichnet (SVG/Canvas), ohne Diagramm-Bibliothek
- State: React-State/Hooks (Context)
- Persistenz: LocalStorage

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Anschließend die angezeigte Adresse (standardmäßig `http://localhost:5173`) im
Browser öffnen.

## Produktions-Build

```bash
npm run build
```

Das statische Bundle landet in `dist/` und kann mit einem beliebigen statischen
Server ausgeliefert werden (z. B. `npm run preview`).

## Bedienung

- **CSV laden**: Datei per Auswahl oder Drag-and-drop in die Dropzone ziehen.
- **Tabelle**: Klick auf einen Spaltenkopf sortiert auf-/absteigend; am unteren
  Rand wird geblättert.
- **Suche & Filter**: Volltextsuche über alle sichtbaren Spalten, kombinierbar
  mit der Filterzeile je Spalte.
- **Spaltenauswahl**: Spalten per Checkbox ein-/ausblenden.
- **Kennzahlen & Diagramme**: automatische Auswertung numerischer Spalten und
  selbst gezeichnete Balken-/Liniendiagramme.
- **Export**: lädt die gefilterte, durchsuchte, sortierte Ansicht als CSV.
- **Beispieldatensatz** laden, **Dark-Mode** umschalten, **Daten löschen** und
  **Zurücksetzen** über die Kopfzeile.

## Features

- CSV laden (Dateiauswahl + Drag-and-drop) mit automatischer
  Trennzeichenerkennung
- Sortierbare, paginierte Datentabelle
- Volltextsuche und Filterzeile (UND-Logik)
- Spaltenauswahl
- Kennzahlen (Anzahl, Summe, Mittelwert, Min, Max, fehlende Werte)
- Balken- und Liniendiagramm (SVG, ohne Bibliothek)
- CSV-Export der gefilterten Ansicht
- Persistenz in LocalStorage (Daten + Ansichtseinstellungen)
- Dark-Mode
- Beispieldatensatz und klare Leer-/Fehler-/Ladezustände

Alle Daten werden ausschließlich im Browser verarbeitet. Es werden keine
Netzwerk-Requests mit CSV-Inhalten versendet und keine Ressourcen von
Drittanbietern geladen.
