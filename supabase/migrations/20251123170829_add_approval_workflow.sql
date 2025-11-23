/*
  # Add Approval Workflow

  ## Overview
  This migration adds approval workflow support for Manager and Owner roles to review, edit, and approve/reject invoices.

  ## Table Modifications
  
  ### `invoices` table - New columns
  - `approval_status` (text) - pending, approved, rejected
  - `approved_by` (uuid) - User who approved/rejected
  - `approved_at` (timestamptz) - When approval/rejection happened
  - `rejection_comment` (text) - Required comment when rejecting

  ## New Tables

  ### `invoice_audit_log`
  - `id` (uuid, primary key)
  - `invoice_id` (uuid, foreign key to invoices)
  - `user_id` (uuid, foreign key to app_users)
  - `user_name` (text) - Full name of user who made the change
  - `action` (text) - created, edited, approved, rejected
  - `changes` (jsonb) - Details of what changed
  - `comment` (text) - Optional comment
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all new tables
  - Managers and Owners can update invoice approval status
  - All authenticated users can read audit logs for visibility

  ## Notes
  1. Audit log tracks all changes to invoices
  2. Username and timestamp logged for accountability
  3. Rejection requires a comment
  4. Approval status separate from processing status
*/

-- Add approval columns to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE invoices ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE invoices ADD COLUMN approved_by uuid REFERENCES app_users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE invoices ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'rejection_comment'
  ) THEN
    ALTER TABLE invoices ADD COLUMN rejection_comment text;
  END IF;
END $$;

-- Create invoice audit log table
CREATE TABLE IF NOT EXISTS invoice_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users(id),
  user_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('created', 'edited', 'approved', 'rejected')),
  changes jsonb,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoice_audit_log ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read audit logs
CREATE POLICY "Authenticated users can read audit logs"
  ON invoice_audit_log FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert audit logs
CREATE POLICY "Users can create audit logs"
  ON invoice_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add policy for managers to update invoice approval status
CREATE POLICY "Managers can update invoice approval"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('manager', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('manager', 'owner')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS invoice_audit_log_invoice_id_idx ON invoice_audit_log(invoice_id);
CREATE INDEX IF NOT EXISTS invoice_audit_log_created_at_idx ON invoice_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS invoices_approval_status_idx ON invoices(approval_status);
