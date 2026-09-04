import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactElement } from 'react';
import { useAppState } from '../state/AppState';
import { parseCsv } from '../lib/csvParser';
import { detectDelimiter } from '../lib/delimiter';
import styles from './FileDropzone.module.css';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const DELIMITER_OPTIONS: { value: string; label: string }[] = [
  { value: ',', label: 'Komma (,)' },
  { value: ';', label: 'Semikolon (;)' },
  { value: '\t', label: 'Tabulator' },
  { value: '|', label: 'Pipe (|)' },
];

function describeDelimiter(delimiter: string | null): string {
  switch (delimiter) {
    case ',':
      return 'Komma';
    case ';':
      return 'Semikolon';
    case '\t':
      return 'Tabulator';
    case '|':
      return 'Pipe';
    default:
      return delimiter ?? '\u2014';
  }
}

export function FileDropzone(): ReactElement {
  const {
    delimiter,
    loadStatus,
    error,
    setData,
    setDelimiter,
    setLoadStatus,
    setError,
    setPage,
  } = useAppState();

  const [dragOver, setDragOver] = useState(false);
  const rawTextRef = useRef<string>('');

  const applyText = useCallback(
    (text: string, delim: string) => {
      rawTextRef.current = text;
      const { columns, rows } = parseCsv(text, delim);
      setDelimiter(delim);
      setData({ columns, rows });
      setError(null);
      setPage(1);
      setLoadStatus('ready');
    },
    [setData, setDelimiter, setError, setLoadStatus, setPage],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        setData(null);
        setDelimiter(null);
        setError(
          'Die Datei ist größer als 20 MB und kann nicht geladen werden.',
        );
        setLoadStatus('error');
        return;
      }

      setLoadStatus('loading');
      setError(null);

      file
        .text()
        .then((text) => {
          applyText(text, detectDelimiter(text));
        })
        .catch(() => {
          setError('Die Datei konnte nicht gelesen werden.');
          setLoadStatus('error');
        });
    },
    [applyText, setData, setDelimiter, setError, setLoadStatus],
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    event.target.value = '';
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onDelimiterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newDelimiter = event.target.value;
    const text = rawTextRef.current;
    if (text === '') {
      setDelimiter(newDelimiter);
      return;
    }
    applyText(text, newDelimiter);
  };

  return (
    <section className={styles.dropzoneSection}>
      <div
        className={
          dragOver ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone
        }
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          accept=".csv,text/csv,text/plain"
          id="file-dropzone-input"
          className={styles.hiddenInput}
          onChange={onInputChange}
        />
        <label htmlFor="file-dropzone-input" className={styles.fileButton}>
          CSV-Datei auswählen
        </label>
        <p className={styles.dropHint}>
          oder CSV-Datei hierher ziehen (max. 20 MB)
        </p>
      </div>

      {loadStatus === 'loading' && (
        <p className={styles.statusText}>Datei wird geladen …</p>
      )}
      {loadStatus === 'error' && error !== null && (
        <p className={styles.errorText}>{error}</p>
      )}

      <div className={styles.delimiterRow}>
        <span className={styles.delimiterInfo}>
          Erkanntes Trennzeichen: <strong>{describeDelimiter(delimiter)}</strong>
        </span>
        <label className={styles.delimiterLabel}>
          Trennzeichen
          <select
            className={styles.delimiterSelect}
            value={delimiter ?? ''}
            onChange={onDelimiterChange}
          >
            <option value="" disabled>
              Automatisch
            </option>
            {DELIMITER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
