'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import IngredientForm from '@/components/ingredients/IngredientForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const url = selectedIngredient ? `/api/ingredients/${selectedIngredient.id}` : '/api/ingredients';
      const method = selectedIngredient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchIngredients();
        setShowForm(false);
        setSelectedIngredient(null);
      }
    } catch (error) {
      console.error('Error submitting ingredient:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) return;

    try {
      const response = await fetch(`/api/ingredients/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchIngredients();
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Ingrédients</h2>
          <button
            onClick={() => {
              setSelectedIngredient(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-banana-500 text-white rounded-lg hover:bg-banana-600 transition-all"
          >
            <Plus size={18} />
            <span>Nouvel Ingrédient</span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : ingredients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{ingredient.name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedIngredient(ingredient);
                          setShowForm(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit2 size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantité:</span>
                      <span className="font-medium text-gray-900">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coût unitaire:</span>
                      <span className="font-medium text-gray-900">{parseFloat(ingredient.unit_cost).toFixed(2)} €</span>
                    </div>
                    {ingredient.supplier_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fournisseur:</span>
                        <span className="font-medium text-gray-900">{ingredient.supplier_name}</span>
                      </div>
                    )}
                    {ingredient.category && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-banana-100 text-banana-700 rounded text-xs font-medium">
                          {ingredient.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucun ingrédient trouvé</p>
          )}
        </div>
      </div>

      {showForm && (
        <IngredientForm
          onClose={() => {
            setShowForm(false);
            setSelectedIngredient(null);
          }}
          onSubmit={handleSubmit}
          initialData={selectedIngredient}
        />
      )}
    </div>
  );
}

