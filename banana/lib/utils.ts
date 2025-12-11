import { type ClassValue, clsx } from 'clsx';

/**
 * Utilitaire pour combiner des classes CSS (compatible avec Tailwind)
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formate un nombre en devise EUR
 */
export function formatCurrency(amount: number | string, locale = 'fr-FR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0,00 €';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

/**
 * Formate une date au format local
 */
export function formatDate(date: string | Date, locale = 'fr-FR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Formate une date au format court (JJ/MM/AAAA)
 */
export function formatDateShort(date: string | Date, locale = 'fr-FR'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * Convertit une date en format ISO (YYYY-MM-DD) pour les inputs
 */
export function toISODate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Calcule le pourcentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Tronque un texte avec ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Génère un ID unique (simple)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Convertit les bytes en format lisible
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Vérifie si un fichier est une image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

/**
 * Vérifie si un fichier est un PDF
 */
export function isPdfFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

/**
 * Calcule le coût total d'une recette
 */
export function calculateRecipeCost(
  ingredients: Array<{ quantity: number; unit_cost: number }>
): number {
  return ingredients.reduce((total, ing) => total + (ing.quantity * ing.unit_cost), 0);
}

/**
 * Calcule la TVA
 */
export function calculateVAT(amount: number, vatRate = 0.20): number {
  return amount * vatRate;
}

/**
 * Calcule le montant HT à partir du TTC
 */
export function calculateAmountWithoutVAT(totalAmount: number, vatRate = 0.20): number {
  return totalAmount / (1 + vatRate);
}

/**
 * Parse un montant depuis un string (gère "1 234,56 €" ou "1,234.56")
 */
export function parseAmount(value: string): number {
  // Enlever les espaces et le symbole €
  let cleaned = value.replace(/\s/g, '').replace('€', '');
  
  // Détecter le format (virgule ou point pour les décimales)
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  
  if (hasComma && hasDot) {
    // Format: 1.234,56 (européen)
    cleaned = cleaned.replace('.', '').replace(',', '.');
  } else if (hasComma) {
    // Format: 1234,56
    cleaned = cleaned.replace(',', '.');
  }
  // Sinon format américain avec point uniquement
  
  return parseFloat(cleaned) || 0;
}

/**
 * Obtient la couleur en fonction du statut
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'yellow',
    validated: 'green',
    archived: 'gray',
    low_stock: 'red',
    in_stock: 'green',
  };
  return colors[status] || 'gray';
}

/**
 * Groupe un tableau par clé
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Trie un tableau par date
 */
export function sortByDate<T extends { created_at?: string; date?: string }>(
  array: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return array.sort((a, b) => {
    const dateA = new Date(a.created_at || a.date || 0).getTime();
    const dateB = new Date(b.created_at || b.date || 0).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filtre un tableau par recherche textuelle
 */
export function searchFilter<T extends Record<string, any>>(
  array: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item =>
    fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(term);
      }
      if (typeof value === 'number') {
        return value.toString().includes(term);
      }
      return false;
    })
  );
}

