import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import { db } from '@seq/database';
import { authConfig } from './auth.config';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username: string | null;
      locale: string;
      theme: string;
      isAdmin: boolean;
    };
  }
}

/**
 * Creates Google provider if credentials are available
 */
function createGoogleProvider(): ReturnType<typeof Google> | null {
  const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return null;
  }

  return Google({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    allowDangerousEmailAccountLinking: true,
  });
}

// Build providers array
const googleProvider = createGoogleProvider();
const providers = googleProvider ? [googleProvider] : [];

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user && user.id) {
        token.id = user.id;
        
        // Fetch extended user data from database
        try {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: {
              username: true,
              locale: true,
              theme: true,
              isAdmin: true,
            },
          });
          if (dbUser) {
            token.username = dbUser.username;
            token.locale = dbUser.locale;
            token.theme = dbUser.theme;
            token.isAdmin = dbUser.isAdmin;
          }
        } catch (error) {
          console.error('Error fetching user in jwt callback:', error);
          // Set defaults on error
          token.username = null;
          token.locale = 'en';
          token.theme = 'dark-calm';
          token.isAdmin = false;
        }
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
  },
  events: {
    async createUser({ user }) {
      if (user.email && user.id) {
        const baseUsername = user.email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'user';
        let username = baseUsername;
        let counter = 1;

        while (await db.user.findFirst({ where: { username, NOT: { id: user.id } } })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        await db.user.update({
          where: { id: user.id },
          data: { username },
        });

        await db.userSettings.create({
          data: { userId: user.id },
        });
      }
    },
  },
});

// Re-export authConfig for middleware usage
export { authConfig } from './auth.config';
