'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, TrendingUp, Utensils, Package, AlertCircle } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ShoppingCart}
          label="Achats Totaux"
          value={`${(stats?.totalPurchases || 0).toLocaleString('fr-FR')} €`}
          trend="+12%"
          color="#F59E0B"
        />
        <StatCard
          icon={TrendingUp}
          label="Moyenne Mensuelle"
          value={`${(stats?.monthlyAverage || 0).toLocaleString('fr-FR')} €`}
          color="#10B981"
        />
        <StatCard
          icon={Utensils}
          label="Coût Moyen Recette"
          value={`${(stats?.avgRecipeCost || 0).toFixed(2)} €`}
          color="#8B5CF6"
        />
        <StatCard
          icon={Package}
          label="Ingrédients"
          value={stats?.totalIngredients || 0}
          color="#EF4444"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg animate-slide-up">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Évolution des Achats (12 mois)</h3>
        <div className="h-64 flex items-end justify-around gap-2">
          {(stats?.monthlyData || [65, 45, 80, 60, 90, 70, 85, 75, 95, 88, 78, 92]).map((height: number, i: number) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-banana-500 to-orange-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
              style={{ height: `${height}%` }}
              title={`Mois ${i + 1}: ${height}%`}
            />
          ))}
        </div>
        <div className="flex justify-around mt-4 text-sm text-gray-600">
          {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Achats Récents</h3>
          <div className="space-y-3">
            {(stats?.recentPurchases || []).map((purchase: any) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{purchase.supplier}</p>
                  <p className="text-sm text-gray-600">{purchase.date}</p>
                </div>
                <span className="font-bold text-lg text-gray-900">{purchase.amount} €</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Alertes Stock</h3>
          {(stats?.lowStockAlerts || []).length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-gray-900">{alert.name}</p>
                    <p className="text-sm text-gray-600">Stock: {alert.quantity} {alert.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune alerte de stock</p>
          )}
        </div>
      </div>
    </div>
  );
}

