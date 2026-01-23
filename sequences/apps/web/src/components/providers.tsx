'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext, useEffect, useCallback } from 'react';
import type { ColorPaletteId, FontPairingId, BackgroundPatternId } from '@seq/config';
import { themes, defaultTheme, type ThemeId } from '@seq/config/themes';
import { Toaster } from '@seq/ui';

// ============================================================================
// TYPES
// ============================================================================

interface DesignSystemContextType {
  palette: ColorPaletteId;
  setPalette: (palette: ColorPaletteId) => void;
  fontPairing: FontPairingId;
  setFontPairing: (font: FontPairingId) => void;
  pattern: BackgroundPatternId;
  setPattern: (pattern: BackgroundPatternId) => void;
  isHydrated: boolean;
}

const DesignSystemContext = createContext<DesignSystemContextType | null>(null);

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (!context) throw new Error('useDesignSystem must be used within DesignSystemProvider');
  return context;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VALID_PALETTES: ColorPaletteId[] = ['serenity', 'sage', 'blush', 'ocean', 'sunset', 'earth', 'twilight', 'garden'];
const VALID_FONTS: FontPairingId[] = ['elegant', 'literary', 'airy', 'modern'];
const VALID_PATTERNS: BackgroundPatternId[] = ['none', 'waves', 'botanical', 'grain', 'contour'];

// ============================================================================
// DESIGN SYSTEM PROVIDER
// ============================================================================

function DesignSystemProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<ColorPaletteId>('serenity');
  const [fontPairing, setFontPairingState] = useState<FontPairingId>('elegant');
  const [pattern, setPatternState] = useState<BackgroundPatternId>('none');
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from DOM attributes (set by blocking script) and user settings
  useEffect(() => {
    const html = document.documentElement;
    
    // First check localStorage (from onboarding or settings)
    const savedPalette = localStorage.getItem('seq-palette') as ColorPaletteId;
    const savedFont = localStorage.getItem('seq-font') as FontPairingId;
    const savedPattern = localStorage.getItem('seq-pattern') as BackgroundPatternId;
    
    // Then check DOM attributes (from blocking script)
    const domPalette = html.getAttribute('data-palette') as ColorPaletteId;
    const domFont = html.getAttribute('data-font') as FontPairingId;
    const domPattern = html.getAttribute('data-pattern') as BackgroundPatternId;

    // Use saved values if valid, otherwise use DOM attributes
    const palette = (savedPalette && VALID_PALETTES.includes(savedPalette)) ? savedPalette : (domPalette && VALID_PALETTES.includes(domPalette) ? domPalette : 'serenity');
    const font = (savedFont && VALID_FONTS.includes(savedFont)) ? savedFont : (domFont && VALID_FONTS.includes(domFont) ? domFont : 'elegant');
    const pattern = (savedPattern && VALID_PATTERNS.includes(savedPattern)) ? savedPattern : (domPattern && VALID_PATTERNS.includes(domPattern) ? domPattern : 'none');

    setPaletteState(palette);
    setFontPairingState(font);
    setPatternState(pattern);
    
    // Update DOM attributes
    html.setAttribute('data-palette', palette);
    html.setAttribute('data-font', font);
    html.setAttribute('data-pattern', pattern);

    setIsHydrated(true);
    
    // Enable transitions after hydration
    requestAnimationFrame(() => {
      html.classList.remove('no-transitions');
    });
  }, []);

  const setPalette = useCallback((p: ColorPaletteId) => {
    if (!VALID_PALETTES.includes(p)) return;
    setPaletteState(p);
    document.documentElement.setAttribute('data-palette', p);
    localStorage.setItem('seq-palette', p);
  }, []);

  const setFontPairing = useCallback((f: FontPairingId) => {
    if (!VALID_FONTS.includes(f)) return;
    setFontPairingState(f);
    document.documentElement.setAttribute('data-font', f);
    localStorage.setItem('seq-font', f);
  }, []);

  const setPattern = useCallback((p: BackgroundPatternId) => {
    if (!VALID_PATTERNS.includes(p)) return;
    setPatternState(p);
    document.documentElement.setAttribute('data-pattern', p);
    localStorage.setItem('seq-pattern', p);
  }, []);

  return (
    <DesignSystemContext.Provider value={{ palette, setPalette, fontPairing, setFontPairing, pattern, setPattern, isHydrated }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

// ============================================================================
// THEME INITIALIZER
// ============================================================================

function ThemeInitializer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Initialize theme CSS variables
    const savedThemeId = (localStorage.getItem('seq-theme-id') as ThemeId | null) || defaultTheme;
    const themeId = savedThemeId;
    const selectedTheme = themes[themeId];

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Update when theme changes
    if (resolvedTheme) {
      const isDark = resolvedTheme === 'dark';
      const newThemeId = (localStorage.getItem('seq-theme-id') as ThemeId | null) || (isDark ? 'dark-calm' : 'light-calm');
      const newTheme = themes[newThemeId];
      
      Object.entries(newTheme.colors).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssKey}`, value);
      });
    }
  }, [resolvedTheme]);

  return null;
}

// ============================================================================
// MAIN PROVIDERS
// ============================================================================

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme" disableTransitionOnChange={false}>
        <ThemeInitializer />
        <DesignSystemProvider>
          {children}
          <Toaster position="top-center" richColors />
        </DesignSystemProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
