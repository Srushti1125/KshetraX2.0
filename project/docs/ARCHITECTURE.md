# KshetraX System Architecture

## Overview
KshetraX is an offline-first construction operations platform built with React Native Expo and Supabase. The system uses a mobile-first approach with GPS geofencing, rule-based validation, and transparent wage calculation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Application                    │
│                    (React Native Expo)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Check-In   │  │   History    │  │    Wages     │  │
│  │   Screen     │  │   Screen     │  │    Screen    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Auth & Offline Context Providers         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Services (Geofence, Validation, Offline Sync)   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
                          ↓↑
                   Network Layer
                          ↓↑
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │     RLS      │  │
│  │   Database   │  │   Service    │  │   Policies   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Database Functions (Trust Score, Wage Calc)     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Mobile Application Layer

#### Screens
- **Check-In Screen**: Worker attendance with GPS validation and camera capture
- **History Screen**: Past attendance records with status badges
- **Wages Screen**: Calculated wages with breakdown
- **Profile Screen**: Worker information and trust score

#### Context Providers
- **AuthContext**: Manages authentication state and user sessions
- **OfflineContext**: Handles offline data storage and sync

#### Services
- **GeofenceService**: GPS-based location validation
- **ValidationService**: Rule engine for attendance validation
- **OfflineService**: Local storage and sync management

### 2. Backend Layer (Supabase)

#### Database Tables
- **workers**: User profiles with trust scores
- **sites**: Construction sites with geofence parameters
- **attendance_records**: Check-in/check-out data
- **wage_entries**: Calculated wage information
- **validation_logs**: Rule engine results
- **trust_score_history**: Trust score changes over time

#### Database Functions
- **update_worker_trust_score()**: Updates trust score with history
- **calculate_wage_entry()**: Computes wages from attendance

## Data Flow

### Check-In Flow
1. Worker opens app and selects site
2. App requests location permission
3. App captures current GPS coordinates
4. GeofenceService validates location against site radius
5. If valid (or override), camera opens for selfie
6. Attendance record created (online or offline)
7. If online, validation runs automatically
8. Trust score updated based on validation results

### Check-Out Flow
1. Worker clicks check-out on active attendance
2. App captures current GPS coordinates
3. Hours worked calculated
4. Attendance record updated
5. Validation runs with complete data
6. Wage entry generated automatically
7. Trust score adjusted

### Offline Sync Flow
1. User performs action while offline
2. Data stored in AsyncStorage
3. NetInfo detects connectivity change
4. OfflineService syncs pending records
5. Validation runs on server
6. Local storage cleared

## Rule Engine

### Validation Rules

1. **Geofence Validation**
   - Check if worker location is within site radius
   - Flag: Outside geofence
   - Trust Score Impact: -5

2. **Device ID Anomaly**
   - Check if device ID used by multiple workers
   - Flag: Same device for multiple workers
   - Trust Score Impact: -10

3. **Working Hours Validation**
   - Check if hours worked are reasonable (0.5-16 hours)
   - Flag: Abnormal working hours
   - Trust Score Impact: -3

4. **Positive Validation**
   - All checks pass
   - Trust Score Impact: +2

## Trust Score System

- Range: 0-100
- Initial Score: 50
- Increases with validated attendance
- Decreases with flagged records
- History tracked for transparency

## Wage Calculation

### Regular Hours
- First 8 hours at base rate
- Formula: `hours × hourly_wage`

### Overtime
- Hours beyond 8 at 1.5x rate
- Formula: `(hours - 8) × hourly_wage × 1.5`

### Total Calculation
```
total_amount = regular_amount + overtime_amount - deductions
```

## Security

### Row Level Security (RLS)
- Workers: Can only access own data
- Contractors: Can view site workers and attendance
- Admins: Full access to all data

### Authentication
- Supabase Auth with email/password
- Session management with AsyncStorage
- Automatic token refresh

## Offline-First Strategy

### Data Storage
- AsyncStorage for pending records
- Local cache for frequently accessed data
- Sync queue with retry logic

### Conflict Resolution
- Last write wins for simple fields
- Server validation always runs
- Duplicate detection by timestamp

## Technology Stack

- **Frontend**: React Native Expo 54
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Context API
- **Offline Storage**: AsyncStorage
- **Location**: expo-location
- **Camera**: expo-camera
- **Network**: NetInfo
