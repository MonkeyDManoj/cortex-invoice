export type UserRole = 'staff' | 'manager' | 'owner' | 'accountant';
export type InvoiceStatus = 'processing' | 'completed' | 'failed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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
  approval_status: ApprovalStatus;
  webhook_response?: any;
  ocr_data?: any;
  uploaded_at: string;
  processed_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceAuditLog {
  id: string;
  invoice_id: string;
  user_id: string;
  user_name: string;
  action: 'created' | 'edited' | 'approved' | 'rejected';
  changes?: any;
  comment?: string;
  created_at: string;
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
      invoice_audit_log: {
        Row: InvoiceAuditLog;
        Insert: Omit<InvoiceAuditLog, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
