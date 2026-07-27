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
    default: 'SmartDine — Smart Restaurant Experience',
    template: '%s | SmartDine',
  },
  description:
    'Browse menus, make reservations, track orders live, and enjoy seamless restaurant dining — all in one place.',
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
