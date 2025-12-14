import React, { useState } from 'react';
import { Upload, Receipt, ShoppingCart, Utensils, DollarSign, Package, TrendingUp, AlertCircle, Plus, Edit2, Trash2, Eye, Search, Filter, Calendar, FileText, Database } from 'lucide-react';

const BananaRestaurantDemo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Données de démonstration
  const demoStats = {
    totalPurchases: 45230.50,
    monthlyAverage: 15076.83,
    recipeCost: 12.45,
    ingredients: 156
  };

  const demoInvoices = [
    { id: 1, supplier: 'Metro Cash & Carry', date: '2024-12-05', total: 1250.00, status: 'processed' },
    { id: 2, supplier: 'Sysco France', date: '2024-12-03', total: 890.50, status: 'processed' },
    { id: 3, supplier: 'Rungis International', date: '2024-12-01', total: 2100.00, status: 'pending' }
  ];

  const demoRecipes = [
    { id: 1, name: 'Bouillabaisse Marseillaise', cost: 18.50, ingredients: 12, servings: 4 },
    { id: 2, name: 'Ratatouille Niçoise', cost: 8.20, ingredients: 8, servings: 6 },
    { id: 3, name: 'Tarte Tatin', cost: 6.50, ingredients: 5, servings: 8 }
  ];

  const demoIngredients = [
    { id: 1, name: 'Tomates', quantity: '25 kg', unitCost: 3.50, supplier: 'Rungis' },
    { id: 2, name: 'Huile d\'olive', quantity: '10 L', unitCost: 12.00, supplier: 'Provence Bio' },
    { id: 3, name: 'Farine T55', quantity: '50 kg', unitCost: 0.85, supplier: 'Metro' }
  ];

  const TabButton = ({ icon: Icon, label, tabKey }) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
        activeTab === tabKey
          ? 'bg-yellow-500 text-white shadow-lg'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border-l-4" style={{ borderColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-yellow-500">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🍌</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Banana</h1>
                <p className="text-sm text-gray-600">Gestion Intelligente de Restaurant</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md">
                <Upload size={18} />
                <span className="font-medium">Uploader Facture</span>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <nav className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <TabButton icon={DollarSign} label="Dashboard" tabKey="dashboard" />
          <TabButton icon={Receipt} label="OCR Factures" tabKey="ocr" />
          <TabButton icon={ShoppingCart} label="Achats" tabKey="purchases" />
          <TabButton icon={Package} label="Ingrédients" tabKey="ingredients" />
          <TabButton icon={Utensils} label="Recettes" tabKey="recipes" />
        </nav>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={ShoppingCart}
                label="Achats Totaux"
                value={`${demoStats.totalPurchases.toLocaleString('fr-FR')} €`}
                trend="+12%"
                color="#F59E0B"
              />
              <StatCard
                icon={TrendingUp}
                label="Moyenne Mensuelle"
                value={`${demoStats.monthlyAverage.toLocaleString('fr-FR')} €`}
                color="#10B981"
              />
              <StatCard
                icon={Utensils}
                label="Coût Moyen Recette"
                value={`${demoStats.recipeCost.toFixed(2)} €`}
                color="#8B5CF6"
              />
              <StatCard
                icon={Package}
                label="Ingrédients"
                value={demoStats.ingredients}
                color="#EF4444"
              />
            </div>

            {/* Graphique simplifié */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Évolution des Achats</h3>
              <div className="h-64 flex items-end justify-around gap-2">
                {[65, 45, 80, 60, 90, 70, 85, 75, 95, 88, 78, 92].map((height, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-yellow-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}%` }}></div>
                ))}
              </div>
              <div className="flex justify-around mt-4 text-sm text-gray-600">
                {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
            </div>

            {/* Alertes */}
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-red-900">Alerte Budget</h4>
                <p className="text-red-700 text-sm">Dépassement de 8% sur les achats de légumes ce mois-ci</p>
              </div>
            </div>
          </div>
        )}

        {/* OCR Factures */}
        {activeTab === 'ocr' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-32 h-32 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Upload size={64} className="text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scanner une Facture</h2>
              <p className="text-gray-600 mb-6">Uploadez une facture PDF ou image pour extraction automatique des données</p>
              <button className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all shadow-md font-medium">
                Choisir un Fichier
              </button>
              <p className="text-sm text-gray-500 mt-4">Formats acceptés: PDF, JPG, PNG (Max 10MB)</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Factures Traitées Récemment</h3>
              <div className="space-y-3">
                {demoInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-yellow-600" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{inv.supplier}</p>
                        <p className="text-sm text-gray-600">{inv.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-gray-900">{inv.total.toFixed(2)} €</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${inv.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {inv.status === 'processed' ? 'Traité' : 'En attente'}
                      </span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                        <Eye size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achats */}
        {activeTab === 'purchases' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Achats</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all">
                <Plus size={18} />
                <span>Nouvel Achat</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" placeholder="Rechercher un achat..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter size={18} />
                  <span>Filtrer</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fournisseur</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Montant</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {demoInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-gray-900">{inv.supplier}</td>
                        <td className="px-4 py-4 text-gray-600">{inv.date}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{inv.total.toFixed(2)} €</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                              <Edit2 size={16} className="text-blue-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ingrédients */}
        {activeTab === 'ingredients' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Ingrédients</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all">
                <Plus size={18} />
                <span>Nouvel Ingrédient</span>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoIngredients.map(ing => (
                  <div key={ing.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900">{ing.name}</h3>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 size={14} className="text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantité:</span>
                        <span className="font-medium text-gray-900">{ing.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coût unitaire:</span>
                        <span className="font-medium text-gray-900">{ing.unitCost.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fournisseur:</span>
                        <span className="font-medium text-gray-900">{ing.supplier}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recettes */}
        {activeTab === 'recipes' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Recettes</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all">
                <Plus size={18} />
                <span>Nouvelle Recette</span>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demoRecipes.map(recipe => (
                  <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    <div className="h-32 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Utensils size={48} className="text-white" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">{recipe.name}</h3>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coût total:</span>
                          <span className="font-bold text-yellow-600">{recipe.cost.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ingrédients:</span>
                          <span className="font-medium text-gray-900">{recipe.ingredients}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Portions:</span>
                          <span className="font-medium text-gray-900">{recipe.servings}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-medium text-sm">
                          Voir Détails
                        </button>
                        <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-gray-600">
            🍌 <strong>Banana</strong> - Gestion Intelligente de Restaurant | Powered by Next.js, Supabase & Azure OCR
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Demo UI - Projet complet disponible avec backend, API et base de données
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BananaRestaurantDemo;

