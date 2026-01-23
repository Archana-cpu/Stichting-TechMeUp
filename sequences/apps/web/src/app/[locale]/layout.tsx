import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { 
  Playfair_Display, 
  Nunito, 
  Cormorant_Garamond, 
  Lato,
  Josefin_Sans,
  Open_Sans,
  DM_Serif_Display,
  DM_Sans 
} from 'next/font/google';
import '../globals.css';
import { Providers } from '@/components/providers';
import { Navigation } from '@/components/navigation';
import type { Locale } from '@seq/i18n';

// ============================================================================
// ALL FONT PAIRINGS
// ============================================================================

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-elegant-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-elegant-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-literary-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-literary-body',
  display: 'swap',
  weight: ['300', '400', '700'],
});

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-airy-heading',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-airy-body',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-modern-heading',
  display: 'swap',
  weight: ['400'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-modern-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const fontVariables = [
  playfair.variable,
  nunito.variable,
  cormorant.variable,
  lato.variable,
  josefin.variable,
  openSans.variable,
  dmSerif.variable,
  dmSans.variable,
].join(' ');

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'Sequences - Hayat Hikayeni Oluştur',
    template: '%s | Sequences',
  },
  description: 'Duygusal anılarını kaydet, hayat ağacını oluştur.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9fb' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1625' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// ============================================================================
// BLOCKING SCRIPT - Prevents FOUC
// ============================================================================

const themeScript = `
(function() {
  try {
    var html = document.documentElement;
    html.classList.add('no-transitions');
    
    var theme = localStorage.getItem('theme');
    var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      html.classList.add('dark');
    }
    
    var palette = localStorage.getItem('seq-palette') || 'serenity';
    html.setAttribute('data-palette', palette);
    
    var font = localStorage.getItem('seq-font') || 'elegant';
    html.setAttribute('data-font', font);
    
    var pattern = localStorage.getItem('seq-pattern') || 'none';
    html.setAttribute('data-pattern', pattern);
    
    // Initialize theme CSS variables from seq-theme-id if set, otherwise use default
    var themeId = localStorage.getItem('seq-theme-id') || (isDark ? 'dark-calm' : 'light-calm');
    
    // Default theme colors (dark-calm)
    var defaultTheme = {
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
      anticipation: '189 94% 43%'
    };
    
    // Light theme colors
    if (themeId === 'light-calm' || themeId === 'light-warm' || themeId === 'light-nature') {
      if (themeId === 'light-calm') {
        defaultTheme = {
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
          anticipation: '189 94% 43%'
        };
      }
    }
    
    // Apply CSS variables
    Object.keys(defaultTheme).forEach(function(key) {
      var cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      html.style.setProperty('--' + cssKey, defaultTheme[key]);
    });
    
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-palette', 'serenity');
    document.documentElement.setAttribute('data-font', 'elegant');
    document.documentElement.setAttribute('data-pattern', 'none');
  }
})();
`;

// ============================================================================
// LAYOUT
// ============================================================================

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fontVariables} antialiased min-h-screen bg-background text-foreground font-body`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div className="relative flex min-h-screen flex-col overflow-hidden">
              {/* Background orbs */}
              <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
                <div className="floating-orb w-[500px] h-[500px] top-[-100px] left-[-100px]" style={{ opacity: 0.15 }} />
                <div className="floating-orb w-[400px] h-[400px] bottom-[-50px] right-[-50px]" style={{ opacity: 0.1, animationDelay: '-7s' }} />
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-screen overflow-hidden">
                <Navigation />
                <main className="flex-1 w-full overflow-x-auto overflow-y-hidden pb-16 md:pb-0 horizontal-scroll-container" style={{ paddingLeft: 'var(--sidebar-width, 0px)' }}>
                  <div className="h-full w-full overflow-hidden">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'tr' }, { locale: 'nl' }];
}
