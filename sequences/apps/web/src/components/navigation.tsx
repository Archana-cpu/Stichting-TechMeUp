import Link from 'next/link';
import { auth } from '@seq/auth';
import { Button } from '@seq/ui';
import { Settings, Plus, User, BookOpen, Users, MessageCircle } from 'lucide-react';
import { UserMenu } from './user-menu';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeSwitcher } from './theme-switcher';
import { BrandLogo } from './brand-logo';
import { NavigationClient } from './navigation-client';

export async function Navigation() {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error('Auth error in Navigation:', error);
  }

  return <NavigationClient session={session} />;
}
