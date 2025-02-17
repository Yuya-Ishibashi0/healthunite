/*
  # Initial Schema Setup for Tokyo Medical Facility

  1. New Tables
    - `facilities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `contact_phone` (text)
      - `contact_email` (text)
      - `ppe_stock` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `users` (extends Supabase auth.users)
      - `id` (uuid, primary key, matches auth.users)
      - `email` (text)
      - `role` (text)
      - `facility_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `table_name` (text)
      - `record_id` (uuid)
      - `change_type` (text)
      - `change_detail` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for facilities:
      - Admins can read/write all facilities
      - Staff can read their assigned facility
    - Policies for users:
      - Admins can read/write all users
      - Users can read their own data
    - Policies for audit_logs:
      - Admins can read all logs
      - Users can read logs related to their actions

  3. Functions
    - Trigger function for audit logging
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'viewer');
CREATE TYPE change_type AS ENUM ('insert', 'update', 'delete');

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  contact_phone text,
  contact_email text,
  ppe_stock jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  facility_id uuid REFERENCES facilities(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  change_type change_type NOT NULL,
  change_detail jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for facilities
CREATE POLICY "Admins can do all on facilities"
  ON facilities
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Staff can read assigned facility"
  ON facilities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.facility_id = facilities.id
    )
  );

-- Create policies for users
CREATE POLICY "Admins can do all on users"
  ON users
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for audit_logs
CREATE POLICY "Admins can read all logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ));

CREATE POLICY "Users can read own logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create audit logging function and trigger
CREATE OR REPLACE FUNCTION handle_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    table_name,
    record_id,
    change_type,
    change_detail
  )
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'insert'::change_type
      WHEN TG_OP = 'UPDATE' THEN 'update'::change_type
      WHEN TG_OP = 'DELETE' THEN 'delete'::change_type
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
    END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER facilities_audit
  AFTER INSERT OR UPDATE OR DELETE ON facilities
  FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

CREATE TRIGGER users_audit
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION handle_audit_log();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facilities_name ON facilities(name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_facility ON users(facility_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);