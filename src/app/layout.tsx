import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import Header from '@/components/Header';

const inter = localFont({
  src: '../assets/fonts/Inter-Variable.woff2',
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'After Hours Studio',
  description: 'Crafting immersive digital experiences.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
