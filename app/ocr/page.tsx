'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle, Clock } from 'lucide-react';
import InvoiceUploader from '@/components/ocr/InvoiceUploader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OCRPage() {
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      const response = await fetch('/api/purchases?status=all&limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (result: any) => {
    console.log('OCR Result:', result);
    fetchRecentInvoices();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <InvoiceUploader onUploadComplete={handleUploadComplete} />

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Factures Traitées Récemment</h3>
        {loading ? (
          <LoadingSpinner />
        ) : recentInvoices.length > 0 ? (
          <div className="space-y-3">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-banana-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-banana-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.supplier_name || 'Fournisseur'}</p>
                    <p className="text-sm text-gray-600">{invoice.invoice_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-gray-900">
                    {parseFloat(invoice.total_amount).toFixed(2)} €
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      invoice.status === 'validated'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {invoice.status === 'validated' ? (
                      <>
                        <CheckCircle size={14} />
                        Validé
                      </>
                    ) : (
                      <>
                        <Clock size={14} />
                        En attente
                      </>
                    )}
                  </span>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                    <Eye size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune facture traitée</p>
        )}
      </div>
    </div>
  );
}

