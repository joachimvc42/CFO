import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Total des achats
    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from('purchases')
      .select('total_amount, invoice_date');

    if (purchasesError) throw purchasesError;

    const totalPurchases = purchases?.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) || 0;

    // Moyenne mensuelle (3 derniers mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentPurchases = purchases?.filter(p => 
      new Date(p.invoice_date) >= threeMonthsAgo
    ) || [];
    
    const monthlyAverage = recentPurchases.length > 0 
      ? recentPurchases.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) / 3
      : 0;

    // Nombre d'ingrédients
    const { count: ingredientsCount } = await supabaseAdmin
      .from('ingredients')
      .select('*', { count: 'exact', head: true });

    // Coût moyen des recettes
    const { data: recipeCosts } = await supabaseAdmin
      .from('recipe_costs')
      .select('total_cost');

    const avgRecipeCost = recipeCosts && recipeCosts.length > 0
      ? recipeCosts.reduce((sum, r) => sum + (parseFloat(r.total_cost) || 0), 0) / recipeCosts.length
      : 0;

    // Achats récents (5 derniers)
    const { data: recentPurchasesData } = await supabaseAdmin
      .from('purchases')
      .select(`
        id,
        invoice_date,
        total_amount,
        suppliers (name)
      `)
      .order('invoice_date', { ascending: false })
      .limit(5);

    const formattedRecentPurchases = recentPurchasesData?.map(p => ({
      id: p.id,
      supplier: p.suppliers?.name || 'N/A',
      date: p.invoice_date,
      amount: parseFloat(p.total_amount),
    })) || [];

    // Alertes de stock bas
    const { data: lowStockData } = await supabaseAdmin
      .from('ingredients')
      .select('id, name, quantity, unit, min_stock')
      .not('min_stock', 'is', null)
      .filter('quantity', 'lt', 'min_stock');

    // Données mensuelles (12 derniers mois)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      const monthPurchases = purchases?.filter(p => {
        const date = new Date(p.invoice_date);
        return date.getMonth() === month.getMonth() && 
               date.getFullYear() === month.getFullYear();
      }) || [];
      return monthPurchases.reduce((sum, p) => sum + parseFloat(p.total_amount), 0);
    });

    // Normaliser pour le graphique (0-100)
    const maxAmount = Math.max(...monthlyData);
    const normalizedMonthlyData = maxAmount > 0 
      ? monthlyData.map(amount => Math.round((amount / maxAmount) * 100))
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    return NextResponse.json({
      success: true,
      data: {
        totalPurchases: totalPurchases.toFixed(2),
        monthlyAverage: monthlyAverage.toFixed(2),
        avgRecipeCost: avgRecipeCost.toFixed(2),
        totalIngredients: ingredientsCount || 0,
        recentPurchases: formattedRecentPurchases,
        lowStockAlerts: lowStockData || [],
        monthlyData: normalizedMonthlyData,
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

