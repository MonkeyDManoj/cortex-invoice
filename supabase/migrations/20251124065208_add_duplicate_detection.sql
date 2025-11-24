/*
  # Add Duplicate Detection System

  ## Overview
  This migration adds duplicate detection support for invoices during the approval process.
  When the webhook returns `{ duplicate: true }`, the system logs the event and requires
  Manager/Owner confirmation to proceed.

  ## New Tables
  
  ### `duplicate_detection_log`
  - `id` (uuid, primary key) - Unique log entry identifier
  - `invoice_id` (uuid, foreign key) - Reference to the invoice
  - `detected_at` (timestamptz) - When duplicate was detected
  - `detected_by` (uuid, foreign key) - User who triggered detection
  - `overridden` (boolean) - Whether duplicate was overridden
  - `overridden_by` (uuid, nullable) - User who overrode the duplicate
  - `overridden_at` (timestamptz, nullable) - When override happened
  - `override_reason` (text, nullable) - Reason for override
  - `created_at` (timestamptz) - Log creation timestamp

  ## Security
  - Enable RLS on `duplicate_detection_log` table
  - Managers and Owners can insert duplicate detection logs
  - Managers and Owners can view duplicate logs
  - Managers and Owners can update logs to mark as overridden

  ## Indexes
  - Index on invoice_id for fast lookups
  - Index on detected_at for chronological queries

  ## Notes
  1. Duplicate detection happens after webhook response
  2. Only Manager and Owner roles can override duplicates
  3. All duplicate events are logged with timestamps
  4. Override requires explicit confirmation from Manager/Owner
*/

CREATE TABLE IF NOT EXISTS duplicate_detection_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  detected_at timestamptz NOT NULL DEFAULT now(),
  detected_by uuid NOT NULL REFERENCES app_users(id),
  overridden boolean DEFAULT false,
  overridden_by uuid REFERENCES app_users(id),
  overridden_at timestamptz,
  override_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE duplicate_detection_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers and owners can insert duplicate logs"
  ON duplicate_detection_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('manager', 'owner')
    )
  );

CREATE POLICY "Managers and owners can view duplicate logs"
  ON duplicate_detection_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('manager', 'owner')
    )
  );

CREATE POLICY "Managers and owners can update duplicate logs"
  ON duplicate_detection_log
  FOR UPDATE
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

CREATE INDEX IF NOT EXISTS idx_duplicate_detection_invoice ON duplicate_detection_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_detection_detected_at ON duplicate_detection_log(detected_at DESC);
