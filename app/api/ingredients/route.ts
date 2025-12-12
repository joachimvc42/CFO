import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabaseAdmin
      .from('ingredients')
      .select(`
        *,
        suppliers (
          id,
          name
        )
      `)
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Formater les données
    const formattedData = data?.map(i => ({
      ...i,
      supplier_name: i.suppliers?.name,
    })) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Ingredients GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('ingredients')
      .insert({
        name: body.name,
        quantity: body.quantity,
        unit: body.unit,
        unit_cost: body.unit_cost,
        supplier_id: body.supplier_id,
        category: body.category,
        min_stock: body.min_stock,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Ingredients POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ingredient' },
      { status: 500 }
    );
  }
}

