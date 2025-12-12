'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Utensils } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Recettes</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-banana-500 text-white rounded-lg hover:bg-banana-600 transition-all">
            <Plus size={18} />
            <span>Nouvelle Recette</span>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-32 bg-gradient-to-br from-banana-400 to-orange-500 flex items-center justify-center">
                    <Utensils size={48} className="text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">{recipe.name}</h3>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coût total:</span>
                        <span className="font-bold text-banana-600">
                          {recipe.total_cost ? parseFloat(recipe.total_cost).toFixed(2) : '0.00'} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Portions:</span>
                        <span className="font-medium text-gray-900">{recipe.servings}</span>
                      </div>
                      {recipe.cost_per_serving && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coût/portion:</span>
                          <span className="font-medium text-gray-900">
                            {parseFloat(recipe.cost_per_serving).toFixed(2)} €
                          </span>
                        </div>
                      )}
                    </div>
                    <button className="w-full px-3 py-2 bg-banana-50 text-banana-600 rounded-lg hover:bg-banana-100 transition-all font-medium text-sm">
                      Voir Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune recette trouvée</p>
          )}
        </div>
      </div>
    </div>
  );
}

