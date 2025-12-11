import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client pour le frontend (utilise la clé anon)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client pour le backend avec privilèges service role
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

// Types TypeScript pour la base de données
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  supplier_id?: string;
  supplier_name?: string;
  category?: string;
  min_stock?: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  supplier_id?: string;
  supplier_name?: string;
  invoice_number?: string;
  invoice_date: string;
  total_amount: number;
  vat_amount?: number;
  status: 'pending' | 'validated' | 'archived';
  ocr_data?: any;
  invoice_file_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  ingredient_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  instructions?: string;
  image_url?: string;
  category?: string;
  total_cost?: number;
  cost_per_serving?: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  quantity: number;
  unit: string;
  created_at: string;
}

