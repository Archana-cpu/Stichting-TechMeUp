import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sequences',
  description: 'Track your emotional sequences',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
