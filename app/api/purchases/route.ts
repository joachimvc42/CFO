import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let query = supabaseAdmin
      .from('purchases')
      .select(`
        *,
        suppliers (
          id,
          name,
          contact
        )
      `)
      .order('invoice_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) throw error;

    // Formater les données
    const formattedData = data?.map(p => {
      // Handle both array and object cases for suppliers
      const supplier = Array.isArray(p.suppliers) 
        ? p.suppliers[0]?.name 
        : (p.suppliers as any)?.name;
      
      return {
        ...p,
        supplier_name: supplier,
      };
    }) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Purchases GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('purchases')
      .insert({
        supplier_id: body.supplier_id,
        invoice_number: body.invoice_number,
        invoice_date: body.invoice_date,
        total_amount: body.total_amount,
        vat_amount: body.vat_amount,
        notes: body.notes,
        status: body.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Purchases POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}

