# API Contracts

## Supabase Database Operations

### Workers Table

#### Get Worker Profile
```typescript
const { data, error } = await supabase
  .from('workers')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "John Doe",
  "phone": "+91234567890",
  "device_id": "device-uuid",
  "trust_score": 75,
  "hourly_wage": 150,
  "role": "worker",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Sites Table

#### Get Active Sites
```typescript
const { data, error } = await supabase
  .from('sites')
  .select('*')
  .eq('active', true);
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Construction Site A",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "radius_meters": 100,
    "contractor_id": "uuid",
    "active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Attendance Records Table

#### Create Check-In Record
```typescript
const { data, error } = await supabase
  .from('attendance_records')
  .insert({
    worker_id: workerId,
    site_id: siteId,
    check_in_time: new Date().toISOString(),
    check_in_lat: latitude,
    check_in_lng: longitude,
    device_id: deviceId,
    synced: true,
  })
  .select()
  .single();
```

**Request Body:**
```json
{
  "worker_id": "uuid",
  "site_id": "uuid",
  "check_in_time": "2024-01-01T09:00:00Z",
  "check_in_lat": 12.9716,
  "check_in_lng": 77.5946,
  "device_id": "device-uuid",
  "synced": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "worker_id": "uuid",
  "site_id": "uuid",
  "check_in_time": "2024-01-01T09:00:00Z",
  "check_out_time": null,
  "check_in_lat": 12.9716,
  "check_in_lng": 77.5946,
  "check_out_lat": null,
  "check_out_lng": null,
  "check_in_photo_url": null,
  "check_out_photo_url": null,
  "device_id": "device-uuid",
  "status": "pending",
  "validation_reason": null,
  "synced": true,
  "hours_worked": 0,
  "created_at": "2024-01-01T09:00:00Z"
}
```

#### Update Check-Out Record
```typescript
const { error } = await supabase
  .from('attendance_records')
  .update({
    check_out_time: new Date().toISOString(),
    check_out_lat: latitude,
    check_out_lng: longitude,
    hours_worked: hoursWorked,
  })
  .eq('id', attendanceId);
```

**Request Body:**
```json
{
  "check_out_time": "2024-01-01T17:30:00Z",
  "check_out_lat": 12.9716,
  "check_out_lng": 77.5946,
  "hours_worked": 8.5
}
```

#### Get Worker Attendance History
```typescript
const { data, error } = await supabase
  .from('attendance_records')
  .select('*, sites(*)')
  .eq('worker_id', workerId)
  .order('check_in_time', { ascending: false })
  .limit(50);
```

**Response:**
```json
[
  {
    "id": "uuid",
    "worker_id": "uuid",
    "site_id": "uuid",
    "check_in_time": "2024-01-01T09:00:00Z",
    "check_out_time": "2024-01-01T17:30:00Z",
    "check_in_lat": 12.9716,
    "check_in_lng": 77.5946,
    "check_out_lat": 12.9716,
    "check_out_lng": 77.5946,
    "device_id": "device-uuid",
    "status": "validated",
    "validation_reason": "All validation checks passed",
    "synced": true,
    "hours_worked": 8.5,
    "created_at": "2024-01-01T09:00:00Z",
    "sites": {
      "id": "uuid",
      "name": "Construction Site A",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "radius_meters": 100
    }
  }
]
```

### Wage Entries Table

#### Get Worker Wages
```typescript
const { data, error } = await supabase
  .from('wage_entries')
  .select('*')
  .eq('worker_id', workerId)
  .order('created_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "worker_id": "uuid",
    "attendance_id": "uuid",
    "regular_hours": 8,
    "overtime_hours": 0.5,
    "regular_amount": 1200,
    "overtime_amount": 112.5,
    "deductions": 0,
    "total_amount": 1312.5,
    "payment_status": "pending",
    "created_at": "2024-01-01T18:00:00Z"
  }
]
```

### Database Functions

#### Update Trust Score
```typescript
await supabase.rpc('update_worker_trust_score', {
  p_worker_id: workerId,
  p_new_score: newScore,
  p_reason: reason,
});
```

**Parameters:**
```json
{
  "p_worker_id": "uuid",
  "p_new_score": 80,
  "p_reason": "Attendance validation: validated"
}
```

#### Calculate Wage Entry
```typescript
await supabase.rpc('calculate_wage_entry', {
  p_attendance_id: attendanceId,
});
```

**Parameters:**
```json
{
  "p_attendance_id": "uuid"
}
```

**Returns:** UUID of created wage entry

### Validation Logs Table

#### Get Attendance Validation Logs
```typescript
const { data, error } = await supabase
  .from('validation_logs')
  .select('*')
  .eq('attendance_id', attendanceId)
  .order('created_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "attendance_id": "uuid",
    "rule_name": "Geofence Validation",
    "rule_result": "pass",
    "details": {
      "distance": 45,
      "allowed_radius": 100
    },
    "created_at": "2024-01-01T09:01:00Z"
  },
  {
    "id": "uuid",
    "attendance_id": "uuid",
    "rule_name": "Device ID Anomaly Check",
    "rule_result": "pass",
    "details": {
      "device_id": "device-uuid",
      "multiple_workers": false
    },
    "created_at": "2024-01-01T09:01:00Z"
  }
]
```

### Trust Score History Table

#### Get Worker Trust History
```typescript
const { data, error } = await supabase
  .from('trust_score_history')
  .select('*')
  .eq('worker_id', workerId)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response:**
```json
[
  {
    "id": "uuid",
    "worker_id": "uuid",
    "old_score": 75,
    "new_score": 77,
    "reason": "Attendance validation: validated",
    "created_at": "2024-01-01T18:00:00Z"
  }
]
```

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
});
```

### Sign In
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```
