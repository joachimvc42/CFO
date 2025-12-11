import { NextRequest, NextResponse } from 'next/server';
import { analyzeInvoice } from '@/lib/azure-ocr';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Analyser avec Azure OCR
    const result = await analyzeInvoice(buffer);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

