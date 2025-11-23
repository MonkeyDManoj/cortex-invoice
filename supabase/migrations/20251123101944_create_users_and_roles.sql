/*
  # Invoice Manager - Users and Roles Schema

  ## Overview
  This migration creates the core user management system for the Invoice Manager app,
  supporting four distinct roles: Staff, Manager, Owner, and Accountant.

  ## New Tables
  
  ### `app_users`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text, unique, not null) - User's email address
  - `full_name` (text) - User's display name
  - `role` (text, not null) - One of: staff, manager, owner, accountant
  - `is_always_logged_in` (boolean, default false) - Staff members stay logged in
  - `requires_biometric` (boolean, default false) - Manager/Owner require biometric/PIN
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile
  - Users can update their own non-critical fields
  - Role-based access control for sensitive operations

  ## Notes
  1. Staff role has is_always_logged_in enabled by default
  2. Manager and Owner roles require biometric/PIN unlock
  3. All roles are restrictive - users only see their own data by default
*/

-- Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('staff', 'manager', 'owner', 'accountant')),
  is_always_logged_in boolean DEFAULT false,
  requires_biometric boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON app_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own non-role fields
CREATE POLICY "Users can update own profile"
  ON app_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM app_users WHERE id = auth.uid()));

-- Insert policy for initial user creation
CREATE POLICY "Users can insert own profile"
  ON app_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);

-- Function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on app_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_app_users_updated_at'
  ) THEN
    CREATE TRIGGER update_app_users_updated_at
      BEFORE UPDATE ON app_users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;