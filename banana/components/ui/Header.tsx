'use client';

import React from 'react';
import { Upload, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-white shadow-md border-b-4 border-banana-500">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => router.push('/')}
          >
            <div className="text-5xl">🍌</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Banana</h1>
              <p className="text-sm text-gray-600">Gestion Intelligente de Restaurant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/ocr')}
              className="flex items-center gap-2 px-4 py-2 bg-banana-500 text-white rounded-lg hover:bg-banana-600 transition-all shadow-md"
            >
              <Upload size={18} />
              <span className="font-medium hidden sm:inline">Uploader Facture</span>
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-banana-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

