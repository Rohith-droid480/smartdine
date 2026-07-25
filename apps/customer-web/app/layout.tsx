import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SmartDine — Smart Restaurant Experience',
    template: '%s | SmartDine',
  },
  description:
    'Browse menus, make reservations, track orders, and get AI-powered dining recommendations — all in one place.',
  keywords: ['restaurant', 'food', 'reservations', 'online ordering', 'menu'],
  authors: [{ name: 'SmartDine' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SmartDine',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
