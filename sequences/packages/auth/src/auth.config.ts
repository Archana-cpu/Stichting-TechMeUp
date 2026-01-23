import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-compatible auth configuration
 * This config is used in middleware and doesn't include database access
 * For full auth with adapter, use the main auth.ts
 */
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [], // Providers are defined in auth.ts
  callbacks: {
    authorized({ auth }) {
      // Route protection is handled in middleware.ts
      // This callback only determines if the request should proceed
      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token.id as string) ?? '';
        session.user.username = (token.username as string) ?? null;
        session.user.locale = (token.locale as string) ?? 'en';
        session.user.theme = (token.theme as string) ?? 'dark-calm';
        session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - user data comes from provider
      if (user) {
        token.id = user.id;
        // Extended user data will be added by the full auth.ts
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        if (session.username !== undefined) token.username = session.username;
        if (session.locale !== undefined) token.locale = session.locale;
        if (session.theme !== undefined) token.theme = session.theme;
        if (session.isAdmin !== undefined) token.isAdmin = session.isAdmin;
      }

      return token;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
