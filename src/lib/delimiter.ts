const CANDIDATES = [',', ';', '\t', '|'];

function countOccurrences(line: string, delimiter: string): number {
  if (delimiter.length === 0) {
    return 0;
  }
  let count = 0;
  let index = line.indexOf(delimiter);
  while (index !== -1) {
    count += 1;
    index = line.indexOf(delimiter, index + delimiter.length);
  }
  return count;
}

/**
 * Detects the most likely CSV delimiter (`,`, `;`, tab or `|`) by counting
 * each candidate's occurrences across the first lines of the sample. The
 * candidate with the highest total count wins; ties are broken by how many
 * lines contain the candidate, then by the default candidate order. Falls
 * back to `,` when no delimiter appears in the sample.
 */
export function detectDelimiter(sample: string): string {
  const lines = sample.split(/\r\n|\n|\r/);

  let best = ',';
  let bestCount = 0;
  let bestLines = 0;

  for (const candidate of CANDIDATES) {
    let total = 0;
    let linesWithCandidate = 0;
    for (const line of lines) {
      const count = countOccurrences(line, candidate);
      if (count > 0) {
        linesWithCandidate += 1;
        total += count;
      }
    }

    if (total === 0) {
      continue;
    }

    if (
      total > bestCount ||
      (total === bestCount && linesWithCandidate > bestLines)
    ) {
      best = candidate;
      bestCount = total;
      bestLines = linesWithCandidate;
    }
  }

  return best;
}
