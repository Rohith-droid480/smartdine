import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SmartDine — Gourmet Dining & AI Concierge',
    template: '%s | SmartDine',
  },
  description:
    'Browse Michelin-grade menus, reserve dining tables, track kitchen orders in real time, and interact with our AI Dining Concierge.',
  keywords: ['restaurant', 'gourmet dining', 'table reservations', 'online ordering', 'voice ai assistant'],
  authors: [{ name: 'SmartDine Innovators' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'SmartDine Gourmet System',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-gray-900 antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
