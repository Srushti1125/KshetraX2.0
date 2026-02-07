export type UserRole = 'worker' | 'contractor' | 'admin';
export type AttendanceStatus = 'pending' | 'validated' | 'flagged';
export type PaymentStatus = 'pending' | 'paid';
export type RuleResult = 'pass' | 'fail';

export interface Worker {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  device_id: string | null;
  trust_score: number;
  hourly_wage: number;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  contractor_id: string | null;
  active: boolean;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  worker_id: string;
  site_id: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat: number | null;
  check_out_lng: number | null;
  check_in_photo_url: string | null;
  check_out_photo_url: string | null;
  device_id: string;
  status: AttendanceStatus;
  validation_reason: string | null;
  synced: boolean;
  hours_worked: number;
  created_at: string;
}

export interface WageEntry {
  id: string;
  worker_id: string;
  attendance_id: string;
  regular_hours: number;
  overtime_hours: number;
  regular_amount: number;
  overtime_amount: number;
  deductions: number;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface ValidationLog {
  id: string;
  attendance_id: string;
  rule_name: string;
  rule_result: RuleResult;
  details: Record<string, any>;
  created_at: string;
}

export interface TrustScoreHistory {
  id: string;
  worker_id: string;
  old_score: number;
  new_score: number;
  reason: string;
  created_at: string;
}

export interface OfflineAttendanceRecord {
  localId: string;
  worker_id: string;
  site_id: string;
  check_in_time: string;
  check_in_lat: number;
  check_in_lng: number;
  check_in_photo_base64: string;
  device_id: string;
  synced: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeofenceValidation {
  isWithinGeofence: boolean;
  distance: number;
}
