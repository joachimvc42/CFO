import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('purchases')
      .select(`
        *,
        suppliers (*),
        purchase_items (*)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Purchase GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase' },
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
      .from('purchases')
      .update({
        supplier_id: body.supplier_id,
        invoice_number: body.invoice_number,
        invoice_date: body.invoice_date,
        total_amount: body.total_amount,
        vat_amount: body.vat_amount,
        notes: body.notes,
        status: body.status,
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
    console.error('Purchase PUT Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update purchase' },
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
      .from('purchases')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Purchase deleted successfully',
    });
  } catch (error) {
    console.error('Purchase DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}

