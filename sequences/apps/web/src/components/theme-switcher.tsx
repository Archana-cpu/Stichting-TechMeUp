'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@seq/ui';
import { Moon, Sun, Monitor } from 'lucide-react';
import { themes, type ThemeId } from '@seq/config/themes';

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" suppressHydrationWarning>
        <Monitor className="h-5 w-5" suppressHydrationWarning />
      </Button>
    );
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    // Force immediate update
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} suppressHydrationWarning>
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" suppressHydrationWarning />
      ) : (
        <Moon className="h-5 w-5" suppressHydrationWarning />
      )}
    </Button>
  );
}

export function ThemeSelector() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('dark-calm');

  useEffect(() => {
    setMounted(true);
    
    // Initialize theme on mount
    const savedThemeId = localStorage.getItem('seq-theme-id') as ThemeId | null;
    const themeId = savedThemeId || 'dark-calm';
    const selectedTheme = themes[themeId];
    
    // Set dark/light mode
    setTheme(selectedTheme.mode);
    document.documentElement.classList.toggle('dark', selectedTheme.mode === 'dark');
    
    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
    
    setCurrentTheme(themeId);
  }, [setTheme]);

  if (!mounted) {
    return null;
  }

  const handleThemeChange = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    const selectedTheme = themes[themeId];
    setTheme(selectedTheme.mode);
    
    // Update dark class
    document.documentElement.classList.toggle('dark', selectedTheme.mode === 'dark');

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(selectedTheme.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
    
    // Save theme preference
    localStorage.setItem('seq-theme-id', themeId);
  };

  return (
    <Select value={currentTheme} onValueChange={(v) => handleThemeChange(v as ThemeId)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([id, theme]) => (
          <SelectItem key={id} value={id}>
            {theme.mode === 'dark' ? '🌙' : '☀️'} {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
