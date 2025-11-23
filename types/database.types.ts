export type UserRole = 'staff' | 'manager' | 'owner' | 'accountant';
export type InvoiceStatus = 'processing' | 'completed' | 'failed';

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_always_logged_in: boolean;
  requires_biometric: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  image_url: string;
  status: InvoiceStatus;
  webhook_response?: any;
  ocr_data?: any;
  uploaded_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: AppUser;
        Insert: Omit<AppUser, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AppUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
