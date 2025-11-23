export type UserRole = 'staff' | 'manager' | 'owner' | 'accountant';

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

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: AppUser;
        Insert: Omit<AppUser, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AppUser, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
