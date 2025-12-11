import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

const endpoint = process.env.AZURE_VISION_ENDPOINT;
const key = process.env.AZURE_VISION_KEY;

if (!endpoint || !key) {
  console.warn('Azure Computer Vision credentials not configured');
}

let client: ComputerVisionClient | null = null;

if (endpoint && key) {
  const credentials = new ApiKeyCredentials({
    inHeader: { 'Ocp-Apim-Subscription-Key': key }
  });
  client = new ComputerVisionClient(credentials, endpoint);
}

export interface OCRResult {
  text: string;
  extractedData: {
    supplier?: string;
    date?: string;
    invoiceNumber?: string;
    totalAmount?: number;
    vatAmount?: number;
    items?: Array<{
      name: string;
      quantity?: number;
      price?: number;
    }>;
  };
  rawText: string;
}

/**
 * Analyse une image/PDF avec Azure Computer Vision OCR
 */
export async function analyzeInvoice(buffer: Buffer): Promise<OCRResult> {
  if (!client) {
    throw new Error('Azure Computer Vision client not initialized');
  }

  try {
    // Lancer l'analyse OCR
    const result = await client.readInStream(buffer);
    
    // Extraire l'ID de l'opération
    const operationLocation = result.operationLocation;
    const operationId = operationLocation.substring(operationLocation.lastIndexOf('/') + 1);
    
    // Attendre les résultats (polling)
    let readResult;
    let attempts = 0;
    const maxAttempts = 30;
    
    do {
      await sleep(1000);
      readResult = await client.getReadResult(operationId);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('OCR timeout - operation took too long');
      }
    } while (readResult.status === 'running' || readResult.status === 'notStarted');

    if (readResult.status === 'failed') {
      throw new Error('OCR analysis failed');
    }

    // Extraire le texte
    const rawText = readResult.analyzeResult?.readResults
      ?.map(page => page.lines.map(line => line.text).join('\n'))
      .join('\n\n') || '';

    // Parser le texte pour extraire les données structurées
    const extractedData = parseInvoiceText(rawText);

    return {
      text: rawText,
      extractedData,
      rawText,
    };
  } catch (error) {
    console.error('Azure OCR Error:', error);
    throw new Error('Failed to analyze invoice with OCR');
  }
}

/**
 * Parse le texte OCR pour extraire les informations structurées
 */
function parseInvoiceText(text: string): OCRResult['extractedData'] {
  const lines = text.split('\n').filter(line => line.trim());
  
  const data: OCRResult['extractedData'] = {
    items: [],
  };

  // Patterns de reconnaissance
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
  const amountPattern = /(\d+[,\.]\d{2})\s*€?/g;
  const invoicePattern = /(facture|invoice|n°|num|#)\s*:?\s*([A-Z0-9\-]+)/i;
  const tvaPattern = /(tva|vat|tax)\s*:?\s*(\d+[,\.]\d{2})/i;

  // Recherche du fournisseur (généralement dans les premières lignes)
  if (lines.length > 0) {
    data.supplier = lines[0].trim();
  }

  // Parcourir les lignes pour extraire les infos
  for (const line of lines) {
    // Date
    const dateMatch = line.match(datePattern);
    if (dateMatch && !data.date) {
      data.date = dateMatch[1];
    }

    // Numéro de facture
    const invoiceMatch = line.match(invoicePattern);
    if (invoiceMatch && !data.invoiceNumber) {
      data.invoiceNumber = invoiceMatch[2];
    }

    // TVA
    const tvaMatch = line.match(tvaPattern);
    if (tvaMatch && !data.vatAmount) {
      data.vatAmount = parseFloat(tvaMatch[2].replace(',', '.'));
    }

    // Montant total (chercher "total", "montant", etc.)
    if (/(total|montant|amount|sum)/i.test(line)) {
      const amounts = Array.from(line.matchAll(amountPattern));
      if (amounts.length > 0) {
        const lastAmount = amounts[amounts.length - 1][1];
        data.totalAmount = parseFloat(lastAmount.replace(',', '.'));
      }
    }

    // Extraire les articles (simplifié)
    // Format typique: "Produit 10 kg 3.50 35.00"
    const itemPattern = /([A-Za-zÀ-ÿ\s]+)\s+(\d+(?:[,\.]\d+)?)\s*(kg|L|unité?s?|g)?\s+(\d+[,\.]\d{2})/;
    const itemMatch = line.match(itemPattern);
    if (itemMatch) {
      data.items?.push({
        name: itemMatch[1].trim(),
        quantity: parseFloat(itemMatch[2].replace(',', '.')),
        price: parseFloat(itemMatch[4].replace(',', '.')),
      });
    }
  }

  return data;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

