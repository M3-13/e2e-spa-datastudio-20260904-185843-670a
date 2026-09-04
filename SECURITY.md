VERDICT: CHANGES_REQUESTED

## Sicherheitsprüfung – CSV-Datenstudio

### Scanner-Befunde

**npm audit**
- `vite` (direkte Abhängigkeit, Audit-Schweregrad „high“): gemeldet sind Path Traversal im Optimized-Deps-`.map`-Handling, ein `server.fs.deny`-Bypass auf Windows sowie eine NTLMv2-Hash-Offenlegung über `launch-editor`. Alle betreffen ausschließlich den **Vite-Entwicklungsserver**.
- `esbuild` (transitiv, „moderate“): Entwicklungsserver erlaubt beliebigen Websites, Requests an den Dev-Server zu senden und Antworten zu lesen.
- `semgrep` wurde nicht ausgeführt (`[skipped]`); daraus wird kein Befund abgeleitet.

**Bewertung:** Die gemeldeten Schwachstellen sind real, betreffen aber nicht das ausgelieferte statische Bundle. Die `vite.config.ts` setzt keinen Netzwerk-Host; der Dev-Server lauscht standardmäßig nur auf `localhost`. Für Endnutzer der statischen SPA ist die Ausnutzbarkeit daher gering. Dennoch sollte die Abhängigkeit aktualisiert werden.

---

### Befunde im Code

#### 1. Mittel – Veraltete Vite-/esbuild-Abhängigkeiten mit bekannten Dev-Server-Schwachstellen
- **Betroffen:** `package.json` / `package-lock.json`
- **Beschreibung:** `vite <=6.4.2` und `esbuild <=0.24.2` enthalten die oben genannten Schwachstellen. `vite` ist als direkte Dev-Abhängigkeit installiert, `esbuild` wird über Vite eingebunden.
- **Konkreter Fix:** Vite auf eine nicht betroffene Version aktualisieren. Laut Audit wird mindestens `vite@8.2.2` vorgeschlagen. Vorher die Breaking Changes des Major-Updates prüfen; alternativ prüfen, ob eine gepatchte Version im aktuellen Major verfügbar ist. Danach `npm audit` erneut ausführen.

#### 2. Mittel – Fehlende Zeilenbegrenzung im CSV-Parser ermöglicht clientseitige Ressourcenerschöpfung
- **Betroffen:** `src/lib/csvParser.ts`
- **Beschreibung:** Die Feldlänge ist auf 100.000 Zeichen begrenzt, die Zeilenzahl jedoch nicht. Eine 20-MB-Datei mit sehr vielen kurzen Datensätzen kann zu übermäßigem Speicherverbrauch, sehr vielen Filter-/Sortiervorgängen und einem Einfrieren des Browsers führen. AC-20 verlangt nur die Feldgrenze, aber eine Zeilengrenze fehlt.
- **Konkreter Fix:** Eine `MAX_ROWS`-Konstante (z. B. 100.000) einführen und beim Überschreiten den Parsevorgang abbrechen, eine Fehlermeldung setzen (`loadStatus: 'error'`) und keine Daten in den State übernehmen.

#### 3. Mittel – `Math.min(...values)` / `Math.max(...values)` in `histogramBars` kann bei großen Zahlenmengen die Argumentgrenze sprengen
- **Betroffen:** `src/components/ChartsPanel.tsx`, Funktion `histogramBars`
- **Beschreibung:** `Math.min(...values)` und `Math.max(...values)` verteilen das gesamte `values`-Array als Einzelargumente. Bei zulässigen, aber großen CSV-Dateien (z. B. >100.000 numerische Werte) überschreitet das die Argumentanzahl der JavaScript-Engine und verursacht einen `RangeError`, der die App abstürzen lässt.
- **Konkreter Fix:** Minimum und Maximum iterativ berechnen, z. B.:
  ```ts
  let min = values[0];
  let max = values[0];
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  ```

#### 4. Niedrig – `localStorage.getItem` ohne Fehlerbehandlung in `ThemeToggle`
- **Betroffen:** `src/components/ThemeToggle.tsx`, `useEffect` beim Mount
- **Beschreibung:** In blockierten oder privaten Browser-Kontexten kann `localStorage.getItem` eine `SecurityError` werfen. Da der Aufruf nicht in `try/catch` steht, kann dies den Start der Komponente stören. Die übrige Persistenz (`persistence.ts`) fängt solche Fehler bereits ab.
- **Konkreter Fix:** Den Aufruf in `try/catch` kapseln und Fehler ignorieren, analog zu `PersistenceSync`.

#### 5. Niedrig – Fehlende Content Security Policy
- **Betroffen:** `index.html`
- **Beschreibung:** Die App lädt ausschließlich eigene Ressourcen, setzt aber keine CSP. Als Härtung gegen eventuelle zukünftige XSS- oder Injektionspfade sollte eine restriktive CSP definiert werden.
- **Konkreter Fix:** CSP-Meta-Tag im `<head>` ergänzen, das die tatsächlich genutzten eigenen Ressourcen erlaubt und nichts blockiert:
  ```html
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'">
  ```
  Hinweis: Für den Vite-Dev-Server kann eine gesonderte, weniger strikte Dev-CSP nötig sein; für das Produktions-Bundle ist die obige Policy mit den vorhandenen lokalen Ressourcen kompatibel.

#### 6. Niedrig – `pageSize` aus LocalStorage nicht nach oben begrenzt
- **Betroffen:** `src/lib/persistence.ts`, `isPositiveInt`
- **Beschreibung:** Beim Laden des Zustands wird jede positive ganze Zahl als `pageSize` akzeptiert. Ein manipulierter LocalStorage-Wert (z. B. 100.000.000) führt zu einer riesigen Seitengröße und kann die Tabelle beim Rendern erheblich verlangsamen.
- **Konkreter Fix:** Zusätzlich eine Obergrenze prüfen, z. B. `value <= 500`. Alternativ beim Laden auf die definierten `PAGE_SIZES` von `Pagination` begrenzen.

#### 7. Niedrig – Ungekürztes Spaltenlabel in `aria-label`
- **Betroffen:** `src/components/ChartsPanel.tsx`, `BarChart`
- **Beschreibung:** Das `aria-label` des SVG-Diagramms wird mit `column.label` ungekürzt gesetzt. Da ein CSV-Feld bis zu 100.000 Zeichen lang sein kann, entsteht ein sehr großes ARIA-Label im DOM.
- **Konkreter Fix:** Die bereits vorhandene `truncateLabel`-Funktion auch für das `aria-label` verwenden, z. B. `truncateLabel(column.label, 80)`.

---

### Positivbefund
Die sichtbare Implementierung setzt die Sicherheitsanforderungen AC-17 bis AC-23 weitgehend um:
- Dateigrößenprüfung vor dem Einlesen (`File.size > 20 MB`) ist vorhanden.
- CSV-Zellwerte, Spaltennamen und Diagrammbeschriftungen werden als Text über React gerendert; kein `dangerouslySetInnerHTML`.
- Der CSV-Export schützt vor Formel-Injection durch Apostroph-Präfix für Werte, die mit `=`, `+`, `-`, `@`, Tabulator oder `\r` beginnen.
- Die Feldlänge ist auf 100.000 Zeichen begrenzt.
- Es sind keine Netzwerk-Requests mit CSV-Inhalten oder Drittanbieter-Ressourcen sichtbar.
- Die Funktion „Daten löschen“ entfernt LocalStorage und setzt den Zustand zurück.
- Die Persistenz validiert aus LocalStorage geladene Daten sorgfältig (`isCsvData`, `isColumn`, `isRow`, `isFilter` usw.).

Keine kritischen oder unmittelbar ausnutzbaren Schwachstellen im ausgelieferten Produkt; die erforderlichen Härtungen sind mittel/niedrig.