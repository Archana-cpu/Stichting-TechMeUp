export type ThemeId =
  | 'light-calm'
  | 'light-warm'
  | 'light-nature'
  | 'dark-calm'
  | 'dark-warm'
  | 'dark-nature';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  id: ThemeId;
  name: string;
  mode: ThemeMode;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    joy: string;
    trust: string;
    fear: string;
    surprise: string;
    sadness: string;
    disgust: string;
    anger: string;
    anticipation: string;
  };
};

export const themes: Record<ThemeId, Theme> = {
  'light-calm': {
    id: 'light-calm',
    name: 'Calm',
    mode: 'light',
    colors: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '221 83% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '220 14% 96%',
      secondaryForeground: '220 9% 46%',
      muted: '220 14% 96%',
      mutedForeground: '220 9% 46%',
      accent: '220 14% 96%',
      accentForeground: '220 9% 46%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '221 83% 53%',
      joy: '142 71% 45%',
      trust: '217 91% 60%',
      fear: '271 81% 56%',
      surprise: '38 92% 50%',
      sadness: '239 84% 67%',
      disgust: '84 81% 44%',
      anger: '0 72% 51%',
      anticipation: '189 94% 43%',
    },
  },
  'light-warm': {
    id: 'light-warm',
    name: 'Warm',
    mode: 'light',
    colors: {
      background: '36 39% 97%',
      foreground: '36 45% 11%',
      card: '36 46% 97%',
      cardForeground: '36 45% 11%',
      popover: '0 0% 100%',
      popoverForeground: '36 45% 11%',
      primary: '24 95% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '36 33% 90%',
      secondaryForeground: '36 45% 25%',
      muted: '36 33% 90%',
      mutedForeground: '36 45% 35%',
      accent: '36 64% 57%',
      accentForeground: '36 45% 11%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '36 30% 85%',
      input: '36 30% 85%',
      ring: '24 95% 53%',
      joy: '48 96% 53%',
      trust: '199 89% 48%',
      fear: '280 87% 65%',
      surprise: '32 98% 50%',
      sadness: '221 83% 53%',
      disgust: '142 71% 45%',
      anger: '0 91% 71%',
      anticipation: '173 80% 40%',
    },
  },
  'light-nature': {
    id: 'light-nature',
    name: 'Nature',
    mode: 'light',
    colors: {
      background: '138 16% 97%',
      foreground: '138 25% 11%',
      card: '138 20% 98%',
      cardForeground: '138 25% 11%',
      popover: '0 0% 100%',
      popoverForeground: '138 25% 11%',
      primary: '142 72% 29%',
      primaryForeground: '0 0% 100%',
      secondary: '138 20% 90%',
      secondaryForeground: '138 25% 25%',
      muted: '138 20% 90%',
      mutedForeground: '138 25% 35%',
      accent: '142 50% 45%',
      accentForeground: '0 0% 100%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      border: '138 15% 85%',
      input: '138 15% 85%',
      ring: '142 72% 29%',
      joy: '84 81% 44%',
      trust: '173 80% 40%',
      fear: '262 83% 58%',
      surprise: '45 93% 47%',
      sadness: '213 94% 68%',
      disgust: '25 95% 53%',
      anger: '0 72% 51%',
      anticipation: '199 89% 48%',
    },
  },
  'dark-calm': {
    id: 'dark-calm',
    name: 'Calm',
    mode: 'dark',
    colors: {
      background: '224 71% 4%',
      foreground: '213 31% 91%',
      card: '224 71% 4%',
      cardForeground: '213 31% 91%',
      popover: '224 71% 4%',
      popoverForeground: '213 31% 91%',
      primary: '217 91% 60%',
      primaryForeground: '0 0% 100%',
      secondary: '215 28% 17%',
      secondaryForeground: '213 31% 91%',
      muted: '215 28% 17%',
      mutedForeground: '217 10% 64%',
      accent: '215 28% 17%',
      accentForeground: '213 31% 91%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '215 28% 17%',
      input: '215 28% 17%',
      ring: '217 91% 60%',
      joy: '142 71% 45%',
      trust: '217 91% 60%',
      fear: '271 81% 56%',
      surprise: '38 92% 50%',
      sadness: '239 84% 67%',
      disgust: '84 81% 44%',
      anger: '0 72% 51%',
      anticipation: '189 94% 43%',
    },
  },
  'dark-warm': {
    id: 'dark-warm',
    name: 'Warm',
    mode: 'dark',
    colors: {
      background: '20 14% 4%',
      foreground: '60 9% 98%',
      card: '20 14% 4%',
      cardForeground: '60 9% 98%',
      popover: '20 14% 4%',
      popoverForeground: '60 9% 98%',
      primary: '24 95% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '12 6% 15%',
      secondaryForeground: '60 9% 98%',
      muted: '12 6% 15%',
      mutedForeground: '24 6% 64%',
      accent: '12 6% 15%',
      accentForeground: '60 9% 98%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '12 6% 15%',
      input: '12 6% 15%',
      ring: '24 95% 53%',
      joy: '48 96% 53%',
      trust: '199 89% 48%',
      fear: '280 87% 65%',
      surprise: '32 98% 50%',
      sadness: '221 83% 53%',
      disgust: '142 71% 45%',
      anger: '0 91% 71%',
      anticipation: '173 80% 40%',
    },
  },
  'dark-nature': {
    id: 'dark-nature',
    name: 'Nature',
    mode: 'dark',
    colors: {
      background: '150 20% 4%',
      foreground: '138 16% 95%',
      card: '150 20% 4%',
      cardForeground: '138 16% 95%',
      popover: '150 20% 4%',
      popoverForeground: '138 16% 95%',
      primary: '142 72% 40%',
      primaryForeground: '0 0% 100%',
      secondary: '150 10% 12%',
      secondaryForeground: '138 16% 95%',
      muted: '150 10% 12%',
      mutedForeground: '138 10% 60%',
      accent: '150 10% 12%',
      accentForeground: '138 16% 95%',
      destructive: '0 63% 31%',
      destructiveForeground: '0 0% 100%',
      border: '150 10% 12%',
      input: '150 10% 12%',
      ring: '142 72% 40%',
      joy: '84 81% 44%',
      trust: '173 80% 40%',
      fear: '262 83% 58%',
      surprise: '45 93% 47%',
      sadness: '213 94% 68%',
      disgust: '25 95% 53%',
      anger: '0 72% 51%',
      anticipation: '199 89% 48%',
    },
  },
};

export const defaultTheme: ThemeId = 'dark-calm';

export function getTheme(id: ThemeId): Theme {
  return themes[id];
}

export function getThemesByMode(mode: ThemeMode): Theme[] {
  return Object.values(themes).filter((t) => t.mode === mode);
}

export function generateCssVariables(theme: Theme): string {
  const vars = Object.entries(theme.colors)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `--${cssKey}: ${value};`;
    })
    .join('\n    ');
  return vars;
}
