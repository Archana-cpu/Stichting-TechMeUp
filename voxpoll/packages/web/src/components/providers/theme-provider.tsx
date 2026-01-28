'use client'

// ═══════════════════════════════════════════════════════════════════════════════
// VOXPOLL - THEME PROVIDER
// Manages theme style, mode (light/dark), and font preferences
// ═══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ThemeStyle = 'minimal' | 'soft' | 'corporate' | 'vibrant'
type ThemeMode = 'light' | 'dark' | 'system'
type FontPack = 'geometric' | 'humanist' | 'professional' | 'modern' | 'classic' | 'system'

interface ThemeConfig {
  style: ThemeStyle
  font: FontPack
}

interface ThemeContextValue {
  style: ThemeStyle
  setStyle: (style: ThemeStyle) => void
  font: FontPack
  setFont: (font: FontPack) => void
  config: ThemeConfig
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'voxpoll-theme-config'

const DEFAULT_CONFIG: ThemeConfig = {
  style: 'minimal',
  font: 'geometric',
}

const THEME_STYLES: ThemeStyle[] = ['minimal', 'soft', 'corporate', 'vibrant']
const FONT_PACKS: FontPack[] = ['geometric', 'humanist', 'professional', 'modern', 'classic', 'system']

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// ─────────────────────────────────────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────────────────────────────────────

function loadConfig(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (!stored) return DEFAULT_CONFIG

    const parsed = JSON.parse(stored) as Partial<ThemeConfig>

    return {
      style: THEME_STYLES.includes(parsed.style as ThemeStyle) ? (parsed.style as ThemeStyle) : DEFAULT_CONFIG.style,
      font: FONT_PACKS.includes(parsed.font as FontPack) ? (parsed.font as FontPack) : DEFAULT_CONFIG.font,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function saveConfig(config: ThemeConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config))
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Style Provider (Inner)
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeStyleProviderProps {
  children: React.ReactNode
  defaultStyle?: ThemeStyle
  defaultFont?: FontPack
}

function ThemeStyleProvider({
  children,
  defaultStyle,
  defaultFont,
}: ThemeStyleProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [style, setStyleState] = useState<ThemeStyle>(defaultStyle ?? DEFAULT_CONFIG.style)
  const [font, setFontState] = useState<FontPack>(defaultFont ?? DEFAULT_CONFIG.font)

  useEffect(() => {
    setMounted(true)
    const config = loadConfig()
    setStyleState(defaultStyle ?? config.style)
    setFontState(defaultFont ?? config.font)
  }, [defaultStyle, defaultFont])

  useEffect(() => {
    if (!mounted) return

    document.documentElement.setAttribute('data-theme', style)
    document.documentElement.setAttribute('data-font', font)
    saveConfig({ style, font })
  }, [style, font, mounted])

  const setStyle = useCallback((newStyle: ThemeStyle) => {
    if (THEME_STYLES.includes(newStyle)) {
      setStyleState(newStyle)
    }
  }, [])

  const setFont = useCallback((newFont: FontPack) => {
    if (FONT_PACKS.includes(newFont)) {
      setFontState(newFont)
    }
  }, [])

  const value: ThemeContextValue = {
    style,
    setStyle,
    font,
    setFont,
    config: { style, font },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme Provider (Main Export)
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  defaultStyle?: ThemeStyle
  defaultFont?: FontPack
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultStyle,
  defaultFont,
  storageKey = 'voxpoll-theme-mode',
  enableSystem = true,
  disableTransitionOnChange = true,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      <ThemeStyleProvider defaultStyle={defaultStyle} defaultFont={defaultFont}>
        {children}
      </ThemeStyleProvider>
    </NextThemesProvider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

function useThemeStyle() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeStyle must be used within a ThemeProvider')
  }
  return context
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  ThemeProvider,
  useThemeStyle,
  THEME_STYLES,
  FONT_PACKS,
  DEFAULT_CONFIG,
}

export type {
  ThemeStyle,
  ThemeMode,
  FontPack,
  ThemeConfig,
  ThemeContextValue,
  ThemeProviderProps,
}
