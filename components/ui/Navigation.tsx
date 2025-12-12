'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DollarSign, Receipt, ShoppingCart, Package, Utensils } from 'lucide-react';

const tabs = [
  { icon: DollarSign, label: 'Dashboard', path: '/' },
  { icon: Receipt, label: 'OCR Factures', path: '/ocr' },
  { icon: ShoppingCart, label: 'Achats', path: '/purchases' },
  { icon: Package, label: 'Ingrédients', path: '/ingredients' },
  { icon: Utensils, label: 'Recettes', path: '/recipes' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex gap-3 mb-8 overflow-x-auto pb-2">
      {tabs.map(({ icon: Icon, label, path }) => (
        <button
          key={path}
          onClick={() => router.push(path)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
            pathname === path
              ? 'bg-banana-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}

