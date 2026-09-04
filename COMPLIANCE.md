VERDICT: CHANGES_REQUESTED

Der zusammengeführte Sprintstand erfüllt die zentralen datenschutzrechtlichen Sicherheitsanforderungen für eine rein clientseitige CSV-Anwendung weitgehend: keine Serverübermittlung, keine Drittanbieter-Ressourcen, Text-only-DOM-Rendering, CSV-Formel-Escaping, Dateigrößen- und Feldlängenbegrenzung sowie eine Löschfunktion. Es bestehen jedoch behebbare Lücken bei Pflichttexten, CRA-Dokumentation/SBOM, einer unvollständigen Löschung aus `localStorage` und bei der Barrierefreiheit.

---

## 1. DSGVO / Datenschutz

### Befund 1.1 — Fehlende Datenschutzerklärung / kein Datenschutzhinweis (mittel)
Die App verarbeitet potenziell personenbezogene Daten aus CSV-Dateien ausschließlich lokal im Browser und speichert sie in `localStorage`. Es fehlt jedoch eine Datenschutzerklärung, die über Zweck, Umfang, Speicherort, Speicherdauer und Betroffenenrechte informiert.

**Betroffen:** `src/App.tsx`, `index.html`, es existiert keine sichtbare Datenschutzseite.

**Abhilfe:**  
Im Footer von `src/App.tsx` Links ergänzen:
```tsx
<footer className="app-footer">
  CSV-Datenstudio — Datenauswertung vollständig im Browser.
  <nav aria-label="Rechtliches">
    <a href="/datenschutz.html">Datenschutz</a> · <a href="/impressum.html">Impressum</a>
  </nav>
</footer>
```
Zusätzlich neue statische Seiten `public/datenschutz.html` und `public/impressum.html` anlegen. In der Datenschutzerklärung muss mindestens stehen:  
- Es findet keine Übertragung der CSV-Daten an den Anbieter oder Dritte statt.  
- Speicherung erfolgt ausschließlich im `localStorage` des Browsers unter `csv-datenstudio.state` und `csv-datastudio-theme`.  
- Zweck: Wiederherstellung des zuletzt geladenen Datensatzes und der Ansichtseinstellungen nach einem Reload.  
- Speicherdauer: bis zur Löschung durch den Nutzer über „Daten löschen“.  
- Betroffenenrechte: Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Beschwerde bei einer Aufsichtsbehörde.  
- Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung der gewünschten lokalen Persistenzfunktion); Art. 25 Abs. 2 DSGVO.

---

### Befund 1.2 — „Daten löschen“ entfernt nicht die gespeicherte Theme-Einstellung (mittel)
`ClearDataButton` ruft `clearState()` aus `src/lib/persistence.ts` auf. `clearState()` entfernt ausschließlich den Schlüssel `csv-datenstudio.state`. Der Theme-Schlüssel `csv-datastudio-theme` aus `src/components/ThemeToggle.tsx` bleibt erhalten. Dadurch bleibt eine Ansichtseinstellung trotz „Daten löschen“ bestehen und wird nach einem Reload wiederhergestellt.

**Betroffen:**  
- `src/lib/persistence.ts`  
- `src/components/ThemeToggle.tsx`

**Abhilfe:**  
In `src/lib/persistence.ts` `clearState()` erweitern:
```ts
export function clearState(): void {
  skipNextSave = true;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem('csv-datastudio-theme');
  } catch {
    // best-effort
  }
}
```
Alternativ den Theme-Schlüssel als Konstante zentral exportieren und in beiden Dateien verwenden. Damit erfüllt „Daten löschen“ vollständig AC-23.

---

### Befund 1.3 — Reset-Button löscht unbeabsichtigt geladene Daten (mittel)
Der Reset-Button (`src/components/ResetButton.tsx`) ruft `resetAll()` auf. `resetAll()` in `src/state/AppState.tsx` setzt auch `data` auf `null`. Laut AC-15 soll der Reset-Button „Suche, Filter und Einstellungen“ zurücksetzen, nicht zwingend den geladenen Datensatz. Das führt zu unerwartetem Datenverlust; außerdem wird der geleerte Zustand durch `PersistenceSync` wieder in `localStorage` geschrieben.

**Betroffen:**  
- `src/state/AppState.tsx`  
- `src/components/ResetButton.tsx`

**Abhilfe:**  
Eine separate View-Reset-Funktion einführen, die `data`, `delimiter` und `loadStatus` unangetastet lässt, aber Suche, Filter, Sortierung, Spaltenauswahl, Seitengröße, Seite und Diagrammauswahl zurücksetzt. `ResetButton` an diese Funktion binden. `ClearDataButton` verwendet weiterhin `resetAll()` plus `clearState()`.  
Beispiel in `AppState.tsx`:
```ts
const resetView = useCallback(() => {
  setVisibleKeys([]);
  setSort(null);
  setFilters({});
  setSearch('');
  setPage(1);
  setPageSize(25);
  setChartKey(null);
}, []);
```
`resetView` zusätzlich in den Context aufnehmen und `ResetButton` darauf umstellen.

---

### Befund 1.4 — Klartextspeicherung im Browser dokumentieren und begrenzen (niedrig)
Die CSV-Daten werden unverschlüsselt im `localStorage` gespeichert. Bei einer rein clientseitigen App mit explizit gewünschter Wiederherstellung ist das vertretbar, aber es muss in der Datenschutzerklärung offen dokumentiert und auf Restrisiken hingewiesen werden. Eine zusätzliche technische Minimierung wäre möglich, etwa die Begrenzung der gespeicherten Datenmenge oder eine Warnung vor sensiblen Daten.

**Betroffen:**  
- `src/lib/persistence.ts`  
- Datenschutzseite

**Abhilfe:**  
In der Datenschutzerklärung ausdrücklich auf die lokale Klartextspeicherung hinweisen. Optional in der UI beim ersten Laden einer CSV-Datei einen Hinweis „Die Daten bleiben lokal in Ihrem Browser gespeichert“ ergänzen.

---

## 2. EU Cyber Resilience Act (CRA)

### Befund 2.1 — Keine maschinenlesbare SBOM / kein Schwachstellenprüfungsprozess sichtbar (mittel)
CRA verlangt für Produkte mit digitalen Elementen die Bereitstellung einer SBOM und einen Prozess zum Umgang mit bekannten Schwachstellen. `package-lock.json` ist vorhanden, aber keine SBOM-Datei und kein sichtbarer `npm audit`/Vulnerability-Check im Build- oder CI-Prozess.

**Betroffen:**  
- `package.json`
- CI-/Build-Prozess

**Abhilfe:**  
In `package.json` ein Script ergänzen, z. B.:
```json
"scripts": {
  "audit": "npm audit --omit=dev",
  "sbom": "cyclonedx-bom -o sbom.json"
}
```
Zusätzlich eine SBOM-Datei (`sbom.json`, vorzugsweise CycloneDX oder SPDX) als Build-Artefakt erzeugen und im Build/CI ausführen. Im Bericht dokumentieren, dass `npm audit` bei jeder Änderung läuft.

---

### Befund 2.2 — Fehlende Content-Security-Policy / Härtungsheader (mittel)
Die SPA lädt keine Drittanbieter, setzt aber keine Content-Security-Policy. Eine CSP verhindert zusätzlich, dass bei einer künftigen XSS-Schwachstelle Daten an externe Ziele entweichen können. Sie gehört zu Security by default und ist für eine öffentliche Web-App erwartbar.

**Betroffen:**  
- `index.html`

**Abhilfe:**  
In den `<head>` von `index.html` eine produktive CSP aufnehmen, die alle legitimen Ressourcen des eigenen Builds erlaubt:
```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
/>
```
Diese Policy erlaubt die vom Build erzeugten eigenen Module und Styles. Sie blockiert keine benötigte Funktion, da die App keine externen Requests, Frames oder Inline-Skripte benötigt.

---

### Befund 2.3 — Sicherheitseigenschaften und Update-/Patch-Vorgehen nicht dokumentiert (niedrig)
Sichtbar sind Sicherheitsmaßnahmen im Code, aber es fehlt eine explizite Dokumentation der Security-Eigenschaften, des Release-/Patch-Prozesses und einer Meldemöglichkeit für Schwachstellen.

**Betroffen:**  
- `README.md` oder eine neu anzulegende `SECURITY.md`

**Abhilfe:**  
`SECURITY.md` anlegen mit den Abschnitten:  
- Sicherheitsarchitektur (client-seitige Verarbeitung, keine Datenübertragung, DOM-Text-Rendering, Dateilimits, Export-Escaping).  
- Update-/Patch-Prozess (Deployment des statischen Bundles, Versionierung).  
- Vulnerability-Disclosure-Prozess (E-Mail/Issue-Kontakt).  
- Hinweis auf SBOM und Audit-Script.

---

## 3. EU AI Act

Keine KI-Funktion im sichtbaren Produkt enthalten. Der **EU AI Act** ist daher nicht anwendbar. Keine Befunde.

---

## 4. Pflichttexte & UI (Impressum, Datenschutz, Cookies/Consent)

### Befund 4.1 — Impressum und Datenschutzerklärung fehlen (hoch)
Für eine öffentliche Web-UI bestehen Informationspflichten nach deutschem Telemedienrecht (z. B. DDG/TMG-Nachfolge, § 5 DDG) und Art. 13 DSGVO. Im sichtbaren Code gibt es weder ein Impressum noch eine Datenschutzerklärung.

**Betroffen:**  
- `src/App.tsx`
- Es fehlen `public/impressum.html` und `public/datenschutz.html`.

**Abhilfe:**  
Wie bei Befund 1.1 beschrieben. Zusätzlich im Impressum: Name/Anschrift des Anbieters, Vertretungsberechtigter, Kontaktmöglichkeit, ggf. Registerangaben und Umsatzsteuer-ID. In der Datenschutzerklärung zusätzlich die Verantwortlichkeit benennen.

---

### Befund 4.2 — Kein transparenter Hinweis auf lokale Speicherung in der Import-UI (niedrig)
Der Footer informiert mit „Datenauswertung vollständig im Browser“, aber die Importfläche nennt nur die Dateigrößenbeschränkung. Eine klare Information vor dem ersten Import verbessert Transparenz und minimiert Missverständnisse.

**Betroffen:**  
- `src/components/FileDropzone.tsx`

**Abhilfe:**  
Den Hinweistext ergänzen:
```tsx
<p className={styles.dropHint}>
  oder CSV-Datei hierher ziehen (max. 20 MB). Die Daten bleiben in Ihrem Browser
  gespeichert und werden nicht an einen Server übertragen.
</p>
```

---

### Befund 4.3 — Cookie-/Consent-Banner nicht erforderlich (kein Befund)
Die App setzt keine Cookies und lädt keine Drittanbieter-Ressourcen. `localStorage` ist für die gewünschte Persistenzfunktion technisch erforderlich. Ein Consent-Banner ist daher nicht nötig, aber die Informationen gehören in die Datenschutzerklärung. Keine Maßnahme erforderlich.

---

## 5. Barrierefreiheit (WCAG / BITV / EAA)

### Befund 5.1 — Numerische Filterfelder ohne zugänglichen Namen (mittel)
In `src/components/FilterRow.tsx` haben die beiden `input type="number"`-Felder („Wert“ und „bis“) nur Platzhalter, aber keine programmatisch ermittelbare Beschriftung. Screenreader-Nutzer wissen nicht, welcher Wert in welches Feld gehört.

**Betroffen:**  
- `src/components/FilterRow.tsx`

**Abhilfe:**  
Für die Eingabefelder `aria-label` ergänzen:
```tsx
<input
  type="number"
  aria-label={`${col.label} – Wert`}
  className={styles.input}
  placeholder="Wert"
  value={value}
  onChange={(event) => commit(col, op, event.target.value, value2)}
/>
```
Für das zweite Feld:
```tsx
<input
  type="number"
  aria-label={`${col.label} – bis`}
  className={styles.input}
  placeholder="bis"
  value={value2}
  onChange={(event) => commit(col, op, value, event.target.value)}
/>
```

---

### Befund 5.2 — Sortierzustand der Tabelle nicht programmatisch ausgezeichnet (mittel)
Die sortierbaren Spaltenköpfe in `src/components/DataTable.tsx` vermitteln den Zustand nur über ein Pfeil-Zeichen. Es fehlt `aria-sort` am `<th>`, damit assistive Technologien den Sortierzustand erkennen.

**Betroffen:**  
- `src/components/DataTable.tsx`

**Abhilfe:**  
Am `<th>` passend setzen:
```tsx
<th
  key={col.key}
  className={styles.th}
  aria-sort={
    isSorted
      ? sort?.dir === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none'
  }
>
```
`aria-sort="none"` kann bei allen nicht sortierten Spalten gesetzt werden.

---

### Befund 5.3 — Fokusindikator für `details`/`summary` in der Spaltenauswahl fehlt (niedrig)
Die Spaltenauswahl nutzt `<details><summary>`. Das Summary-Element hat keinen sichtbaren Fokusstil. Tastaturnutzer können den Fokus schlecht erkennen.

**Betroffen:**  
- `src/components/ColumnSelector.module.css`

**Abhilfe:**  
In `ColumnSelector.module.css` ergänzen:
```css
.summary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

---

## 6. Positiv festgehalten

- **Keine Serverübertragung:** AC-21/22 sind im sichtbaren Code erfüllt; kein `fetch`, keine Drittanbieter-URLs.  
- **Sicheres DOM-Rendering:** React-Textknoten, kein `dangerouslySetInnerHTML` oder `innerHTML` mit CSV-Inhalten.  
- **CSV-Formel-Escaping:** `src/lib/exportCsv.ts` behandelt gefährliche Präfixe korrekt.  
- **Ressourcenlimits:** `MAX_FILE_SIZE` (20 MB) und `MAX_FIELD_LENGTH` (100.000 Zeichen) sind implementiert.  
- **Löschfunktion vorhanden:** `ClearDataButton` ist vorhanden, muss aber Theme-Schlüssel einbeziehen.  
- **Barrierefreiheit grundlegend gut:** `aria-live`, `role="status"`, `role="alert"`, sichtbare Labels, 44-px-Touch-Ziele.

---

## Empfohlenes Ablauf-Paket vor Auslieferung

1. `public/impressum.html` und `public/datenschutz.html` erstellen und im Footer verlinken.  
2. `clearState()` um Theme-Schlüssel erweitern.  
3. View-Reset von Voll-Reset trennen.  
4. `index.html` mit produktiver CSP versehen.  
5. `aria-sort` und `aria-label` für numerische Filter ergänzen.  
6. SBOM/Sicherheitsdokumentation und `npm audit` in den Build aufnehmen.

Damit wäre das Produkt für eine öffentliche Bereitstellung aus den geprüften Rechtsbereichen marktreif.