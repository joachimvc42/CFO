import React from 'react';
import './globals.css';
import Header from '@/components/ui/Header';
import Navigation from '@/components/ui/Navigation';

export const metadata = {
  title: 'Banana - Gestion Restaurant',
  description: 'Gestion intelligente de restaurant avec OCR',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gradient-to-br from-banana-50 via-orange-50 to-red-50">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Navigation />
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center">
            <p className="text-gray-600">
              🍌 <strong>Banana</strong> - Gestion Intelligente de Restaurant
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Powered by Next.js, Supabase & Azure OCR
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

