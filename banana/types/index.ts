// Types globaux pour l'application

export interface DashboardStats {
  totalPurchases: number;
  monthlyAverage: number;
  avgRecipeCost: number;
  totalIngredients: number;
  recentPurchases: Array<{
    id: string;
    supplier: string;
    date: string;
    amount: number;
  }>;
  lowStockAlerts: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    min_stock: number;
  }>;
  monthlyData: number[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  category?: string;
  supplier_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export type FormMode = 'create' | 'edit' | 'view';

export interface FormProps<T> {
  mode: FormMode;
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

