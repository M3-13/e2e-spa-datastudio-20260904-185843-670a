# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Ruhiges, datendichtes Data-Studio im Linear/Stripe-Stil: kühle neutrale Flächen, klares Blau als Akzent und kompakte, präzise Tabellen – professionell und lesbar, mit sauber getrenntem Hell-/Dunkelschema.

## Colors

- `--color-bg`: **#ffffff**
- `--color-bg_dark`: **#0f141a**
- `--color-surface`: **#f7f8fa**
- `--color-surface_dark`: **#1a2129**
- `--color-fg`: **#1a1f26**
- `--color-fg_dark`: **#e6e9ed**
- `--color-accent`: **#2f6fed**
- `--color-accent_hover`: **#1f5fd6**
- `--color-accent_soft`: **#e8effc**
- `--color-accent_soft_dark`: **#1c2b45**
- `--color-border`: **#d9dee5**
- `--color-border_dark`: **#2b333d**
- `--color-muted`: **#5c6670**
- `--color-muted_dark`: **#9aa4ae**
- `--color-danger`: **#d64545**
- `--color-success`: **#2e9e5b**
- `--color-warning`: **#c98a1b**

## Typography

- `font_family`: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
- `heading_weight`: 600
- `body_weight`: 400
- `size_scale`: 12px / 13px / 14px / 16px / 18px / 22px / 28px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primär: padding 10px 16px, radius md, bg=accent, fg=#ffffff, font 14px/600, min-height 44px, hover=accent_hover, active um 8% dunkler, disabled opacity 0.45 + cursor not-allowed, Fokus-Ring 2px accent_soft. Sekundär: bg=surface, border 1px border, fg=fg, hover border=accent; im Dark-Mode bg=surface_dark, border=border_dark, fg=fg_dark.

### IconButton

44×44px, radius md, border 1px border, bg=surface, fg=fg, hover border=accent + bg=accent_soft, active um 8% dunkler, disabled opacity 0.45; im Dark-Mode bg=surface_dark, border=border_dark, fg=fg_dark. Dient u.a. als Dark-Mode-Umschalter.

### Card

bg=surface, border 1px border, radius md, padding 16px, Schatten 0 1px 2px rgba(16,24,40,0.06); im Dark-Mode bg=surface_dark, border=border_dark.

### Input

bg=bg, border 1px border, radius md, padding 8px 12px, min-height 40px, font 14px, fg=fg, placeholder=muted, fokus border=accent + Ring 3px accent_soft, disabled opacity 0.5; im Dark-Mode bg=bg_dark, border=border_dark, fg=fg_dark.

### Table

Kopfzeile: bg=surface, fg=muted, font 12px/600, padding 10px 12px, sticky. Zellen: padding 10px 12px, border-bottom 1px border, font 13px/400, Zeilen-Hover bg=accent_soft. Sortierindikator als Pfeil in accent. Im Dark-Mode Kopf bg=surface_dark, Zellenrand border_dark, Text fg_dark.

### Badge

bg=accent_soft, fg=accent, radius pill, padding 2px 8px, font 12px/500; Typ-Varianten: numerisch=accent, Text=muted, Warnung=warning, Fehler=danger.

### Dropzone

Dashed border 2px border, radius lg, padding 24px, min-height 160px, zentrierter Inhalt, fg=muted; hover/drag-over border=accent + bg=accent_soft; im Dark-Mode border=border_dark, hover bg=accent_soft_dark.

### State

Leer-/Fehler-/Ladezustand: zentriert, Icon 32px in muted, Titel 16px/600, Text 14px muted, max-width 420px, padding 32px, primärer Button als Handlungsoption.

### Chart

SVG-Fläche min-height 240px, responsive Breite 100%, Achsen/Labels fg=muted 12px, Gitterlinien border, Serienfarbe accent, Linien 2px, Balken radius sm, Leerzustand mit muted Hinweis.

### FilterRow

Kompakte Inputs padding 8px 10px, min-height 36px, radius sm, Typ-Select mit Badge; UND-Logik visuell durch klare Trennung mit 8px Abstand.

## Layout Principles

- Maximale Inhaltsbreite 1280px, zentriert, Seitenpadding 24px (16px unter 768px).
- Breakpoints: 640px und 1024px; unter 768px stapeln sich Bedienfelder, die Tabelle scrollt horizontal.
- Desktop-Layout: Toolbar oben (Laden, Suche, Export, Reset), darunter Filter-/Spaltenleiste und Tabelle; ab 1024px optionale Seitenleiste für Kennzahlen/Diagramme.
- Vertikaler Abstand zwischen Hauptsektionen 24px, innerhalb von Karten 16px.
- Diagramme und Tabelle nutzen 100% Breite ihres Containers; Diagramm-Mindesthöhe 240px.
