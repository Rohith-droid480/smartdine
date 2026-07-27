import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartDine - Staff & Operations Dashboard',
  description: 'AI-Powered Smart Restaurant Management System Staff Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
