'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface InvoiceUploaderProps {
  onUploadComplete?: (result: any) => void;
}

export default function InvoiceUploader({ onUploadComplete }: InvoiceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 10 MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Échec de l\'analyse OCR');
      }

      const result = await response.json();
      onUploadComplete?.(result);
      setFile(null);
    } catch (err) {
      setError('Erreur lors du traitement de la facture');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto bg-banana-100 rounded-full flex items-center justify-center mb-6">
          <Upload size={64} className="text-banana-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Scanner une Facture</h2>
        <p className="text-gray-600 mb-6">Uploadez une facture PDF ou image pour extraction automatique</p>

        {!file ? (
          <div>
            <input
              type="file"
              id="invoice-upload"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="invoice-upload"
              className="inline-block px-8 py-3 bg-banana-500 text-white rounded-lg hover:bg-banana-600 transition-all shadow-md font-medium cursor-pointer"
            >
              Choisir un Fichier
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="text-banana-600" size={24} />
              <span className="font-medium text-gray-900">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-all"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 py-3 bg-banana-500 text-white rounded-lg hover:bg-banana-600 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Analyse en cours...</span>
                </>
              ) : (
                <span>Analyser la Facture</span>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Formats acceptés: PDF, JPG, PNG (Max 10MB)
        </p>
      </div>
    </div>
  );
}

