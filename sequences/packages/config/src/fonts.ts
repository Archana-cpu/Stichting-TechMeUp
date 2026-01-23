export type FontFamily = {
  id: string;
  name: string;
  variable: string;
  fallback: string;
  weights: number[];
};

export const fonts: Record<string, FontFamily> = {
  sans: {
    id: 'geist-sans',
    name: 'Geist Sans',
    variable: '--font-sans',
    fallback: 'system-ui, -apple-system, sans-serif',
    weights: [400, 500, 600, 700],
  },
  mono: {
    id: 'geist-mono',
    name: 'Geist Mono',
    variable: '--font-mono',
    fallback: 'ui-monospace, monospace',
    weights: [400, 500],
  },
  display: {
    id: 'cal-sans',
    name: 'Cal Sans',
    variable: '--font-display',
    fallback: 'system-ui, sans-serif',
    weights: [600],
  },
};

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

export const lineHeights = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
} as const;
