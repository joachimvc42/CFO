'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import PurchaseForm from '@/components/purchases/PurchaseForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases');
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = selectedPurchase ? `/api/purchases/${selectedPurchase.id}` : '/api/purchases';
      const method = selectedPurchase ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchPurchases();
        setShowForm(false);
        setSelectedPurchase(null);
      }
    } catch (error) {
      console.error('Error submitting purchase:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) return;

    try {
      const response = await fetch(`/api/purchases/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchPurchases();
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  const filteredPurchases = purchases.filter((p) =>
    p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Achats</h2>
          <button
            onClick={() => {
              setSelectedPurchase(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-banana-500 text-white rounded-lg hover:bg-banana-600 transition-all"
          >
            <Plus size={18} />
            <span>Nouvel Achat</span>
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un achat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-banana-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={18} />
              <span>Filtrer</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : filteredPurchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fournisseur</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">N° Facture</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Montant</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium text-gray-900">{purchase.supplier_name || 'N/A'}</td>
                      <td className="px-4 py-4 text-gray-600">{purchase.invoice_number || '-'}</td>
                      <td className="px-4 py-4 text-gray-600">{purchase.invoice_date}</td>
                      <td className="px-4 py-4 text-right font-semibold text-gray-900">
                        {parseFloat(purchase.total_amount).toFixed(2)} €
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setShowForm(true);
                            }}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            <Edit2 size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(purchase.id)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun achat trouvé</p>
          )}
        </div>
      </div>

      {showForm && (
        <PurchaseForm
          onClose={() => {
            setShowForm(false);
            setSelectedPurchase(null);
          }}
          onSubmit={handleSubmit}
          initialData={selectedPurchase}
        />
      )}
    </div>
  );
}

