import type { ReactElement } from 'react';

export function ThemeToggle(): ReactElement {
  return (
    <button type="button" className="themetoggle" disabled>
      Dark Mode
    </button>
  );
}
