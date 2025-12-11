import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('ingredients')
      .select(`
        *,
        suppliers (*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Ingredient GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ingredient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('ingredients')
      .update({
        name: body.name,
        quantity: body.quantity,
        unit: body.unit,
        unit_cost: body.unit_cost,
        supplier_id: body.supplier_id,
        category: body.category,
        min_stock: body.min_stock,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Ingredient PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ingredient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('ingredients')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Ingredient deleted successfully',
    });
  } catch (error) {
    console.error('Ingredient DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ingredient' },
      { status: 500 }
    );
  }
}

