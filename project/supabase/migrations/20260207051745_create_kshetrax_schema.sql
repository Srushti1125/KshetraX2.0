/*
  # KshetraX Database Schema

  ## Overview
  Complete database schema for KshetraX construction operations platform supporting
  offline-first workforce management, attendance tracking, and wage calculation.

  ## New Tables
  
  ### 1. `workers`
  Stores worker profiles and trust scores
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, worker full name)
  - `phone` (text, contact number)
  - `device_id` (text, app-generated UUID)
  - `trust_score` (integer, 0-100 range)
  - `hourly_wage` (numeric, wage rate)
  - `role` (text, worker/contractor/admin)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `sites`
  Construction site information with geofencing
  - `id` (uuid, primary key)
  - `name` (text, site name)
  - `latitude` (numeric, site center coordinates)
  - `longitude` (numeric, site center coordinates)
  - `radius_meters` (integer, geofence radius)
  - `contractor_id` (uuid, references workers)
  - `active` (boolean, site operational status)
  - `created_at` (timestamptz)

  ### 3. `attendance_records`
  Worker check-in/check-out records
  - `id` (uuid, primary key)
  - `worker_id` (uuid, references workers)
  - `site_id` (uuid, references sites)
  - `check_in_time` (timestamptz)
  - `check_out_time` (timestamptz, nullable)
  - `check_in_lat` (numeric)
  - `check_in_lng` (numeric)
  - `check_out_lat` (numeric, nullable)
  - `check_out_lng` (numeric, nullable)
  - `check_in_photo_url` (text, selfie URL)
  - `check_out_photo_url` (text, nullable)
  - `device_id` (text)
  - `status` (text, pending/validated/flagged)
  - `validation_reason` (text)
  - `synced` (boolean, offline sync status)
  - `hours_worked` (numeric, calculated)
  - `created_at` (timestamptz)

  ### 4. `wage_entries`
  Calculated wage records
  - `id` (uuid, primary key)
  - `worker_id` (uuid, references workers)
  - `attendance_id` (uuid, references attendance_records)
  - `regular_hours` (numeric)
  - `overtime_hours` (numeric)
  - `regular_amount` (numeric)
  - `overtime_amount` (numeric)
  - `deductions` (numeric)
  - `total_amount` (numeric)
  - `payment_status` (text, pending/paid)
  - `created_at` (timestamptz)

  ### 5. `validation_logs`
  Rule engine validation results
  - `id` (uuid, primary key)
  - `attendance_id` (uuid, references attendance_records)
  - `rule_name` (text)
  - `rule_result` (text, pass/fail)
  - `details` (jsonb, additional info)
  - `created_at` (timestamptz)

  ### 6. `trust_score_history`
  Historical trust score changes
  - `id` (uuid, primary key)
  - `worker_id` (uuid, references workers)
  - `old_score` (integer)
  - `new_score` (integer)
  - `reason` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Workers can only view/update their own data
  - Contractors can view their site data
  - Admins have full access
*/

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  device_id text,
  trust_score integer DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  hourly_wage numeric DEFAULT 0 CHECK (hourly_wage >= 0),
  role text DEFAULT 'worker' CHECK (role IN ('worker', 'contractor', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  radius_meters integer DEFAULT 100 CHECK (radius_meters > 0),
  contractor_id uuid REFERENCES workers(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  check_in_lat numeric NOT NULL,
  check_in_lng numeric NOT NULL,
  check_out_lat numeric,
  check_out_lng numeric,
  check_in_photo_url text,
  check_out_photo_url text,
  device_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'flagged')),
  validation_reason text,
  synced boolean DEFAULT false,
  hours_worked numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create wage_entries table
CREATE TABLE IF NOT EXISTS wage_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  attendance_id uuid NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
  regular_hours numeric DEFAULT 0,
  overtime_hours numeric DEFAULT 0,
  regular_amount numeric DEFAULT 0,
  overtime_amount numeric DEFAULT 0,
  deductions numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  created_at timestamptz DEFAULT now()
);

-- Create validation_logs table
CREATE TABLE IF NOT EXISTS validation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  rule_result text NOT NULL CHECK (rule_result IN ('pass', 'fail')),
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create trust_score_history table
CREATE TABLE IF NOT EXISTS trust_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  old_score integer NOT NULL,
  new_score integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_device_id ON workers(device_id);
CREATE INDEX IF NOT EXISTS idx_attendance_worker_id ON attendance_records(worker_id);
CREATE INDEX IF NOT EXISTS idx_attendance_site_id ON attendance_records(site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_wage_entries_worker_id ON wage_entries(worker_id);
CREATE INDEX IF NOT EXISTS idx_validation_logs_attendance_id ON validation_logs(attendance_id);

-- Enable Row Level Security
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workers table
CREATE POLICY "Workers can view own profile"
  ON workers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Workers can update own profile"
  ON workers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all workers"
  ON workers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

CREATE POLICY "Contractors can view their site workers"
  ON workers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      JOIN sites s ON s.contractor_id = w.id
      JOIN attendance_records ar ON ar.site_id = s.id AND ar.worker_id = workers.id
      WHERE w.user_id = auth.uid() AND w.role = 'contractor'
    )
  );

-- RLS Policies for sites table
CREATE POLICY "Anyone authenticated can view active sites"
  ON sites FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Contractors can view their sites"
  ON sites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = sites.contractor_id
    )
  );

CREATE POLICY "Admins can manage all sites"
  ON sites FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

-- RLS Policies for attendance_records table
CREATE POLICY "Workers can view own attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = attendance_records.worker_id
    )
  );

CREATE POLICY "Workers can insert own attendance"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = attendance_records.worker_id
    )
  );

CREATE POLICY "Workers can update own attendance"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = attendance_records.worker_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = attendance_records.worker_id
    )
  );

CREATE POLICY "Contractors can view site attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      JOIN sites s ON s.contractor_id = w.id
      WHERE w.user_id = auth.uid() AND s.id = attendance_records.site_id
    )
  );

CREATE POLICY "Admins can view all attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

-- RLS Policies for wage_entries table
CREATE POLICY "Workers can view own wages"
  ON wage_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = wage_entries.worker_id
    )
  );

CREATE POLICY "Contractors can view site worker wages"
  ON wage_entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      JOIN sites s ON s.contractor_id = w.id
      JOIN attendance_records ar ON ar.site_id = s.id AND ar.id = wage_entries.attendance_id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all wages"
  ON wage_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

-- RLS Policies for validation_logs table
CREATE POLICY "Workers can view own validation logs"
  ON validation_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      JOIN attendance_records ar ON ar.worker_id = w.id
      WHERE w.user_id = auth.uid() AND ar.id = validation_logs.attendance_id
    )
  );

CREATE POLICY "Contractors can view site validation logs"
  ON validation_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      JOIN sites s ON s.contractor_id = w.id
      JOIN attendance_records ar ON ar.site_id = s.id
      WHERE w.user_id = auth.uid() AND ar.id = validation_logs.attendance_id
    )
  );

CREATE POLICY "Admins can view all validation logs"
  ON validation_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

-- RLS Policies for trust_score_history table
CREATE POLICY "Workers can view own trust history"
  ON trust_score_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.id = trust_score_history.worker_id
    )
  );

CREATE POLICY "Admins can view all trust history"
  ON trust_score_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

-- Function to update worker trust score
CREATE OR REPLACE FUNCTION update_worker_trust_score(
  p_worker_id uuid,
  p_new_score integer,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_score integer;
BEGIN
  -- Get current trust score
  SELECT trust_score INTO v_old_score
  FROM workers
  WHERE id = p_worker_id;

  -- Update worker trust score
  UPDATE workers
  SET trust_score = p_new_score,
      updated_at = now()
  WHERE id = p_worker_id;

  -- Log the change
  INSERT INTO trust_score_history (worker_id, old_score, new_score, reason)
  VALUES (p_worker_id, v_old_score, p_new_score, p_reason);
END;
$$;

-- Function to calculate wage entry
CREATE OR REPLACE FUNCTION calculate_wage_entry(
  p_attendance_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_worker_id uuid;
  v_hourly_wage numeric;
  v_hours_worked numeric;
  v_regular_hours numeric;
  v_overtime_hours numeric;
  v_regular_amount numeric;
  v_overtime_amount numeric;
  v_total_amount numeric;
  v_wage_entry_id uuid;
BEGIN
  -- Get attendance details
  SELECT 
    ar.worker_id,
    w.hourly_wage,
    ar.hours_worked
  INTO 
    v_worker_id,
    v_hourly_wage,
    v_hours_worked
  FROM attendance_records ar
  JOIN workers w ON w.id = ar.worker_id
  WHERE ar.id = p_attendance_id;

  -- Calculate regular and overtime hours (8 hours threshold)
  IF v_hours_worked <= 8 THEN
    v_regular_hours := v_hours_worked;
    v_overtime_hours := 0;
  ELSE
    v_regular_hours := 8;
    v_overtime_hours := v_hours_worked - 8;
  END IF;

  -- Calculate amounts (overtime = 1.5x)
  v_regular_amount := v_regular_hours * v_hourly_wage;
  v_overtime_amount := v_overtime_hours * v_hourly_wage * 1.5;
  v_total_amount := v_regular_amount + v_overtime_amount;

  -- Insert wage entry
  INSERT INTO wage_entries (
    worker_id,
    attendance_id,
    regular_hours,
    overtime_hours,
    regular_amount,
    overtime_amount,
    deductions,
    total_amount
  ) VALUES (
    v_worker_id,
    p_attendance_id,
    v_regular_hours,
    v_overtime_hours,
    v_regular_amount,
    v_overtime_amount,
    0,
    v_total_amount
  )
  RETURNING id INTO v_wage_entry_id;

  RETURN v_wage_entry_id;
END;
$$;