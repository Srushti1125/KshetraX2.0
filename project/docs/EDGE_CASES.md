# Edge Cases and Failure Handling

## Connectivity Issues

### 1. No Internet During Check-In
**Scenario**: Worker tries to check in without internet connection

**Handling**:
- Record stored in AsyncStorage with `synced: false`
- Visual indicator shows "Offline Mode"
- Record automatically synced when connectivity restored
- Validation runs on server after sync

**User Experience**:
- Clear offline badge displayed
- Check-in succeeds locally
- Notification shown when data syncs

### 2. Connection Lost Mid-Operation
**Scenario**: Internet drops during check-out

**Handling**:
- Operation completes locally
- Added to sync queue
- Retry logic with exponential backoff
- User notified of pending sync

### 3. Sync Conflicts
**Scenario**: Multiple offline records for same worker

**Handling**:
- Server timestamp is source of truth
- Duplicate detection by check-in time
- Records within 1 minute considered duplicates
- Last write wins for simple updates

## Location Issues

### 1. GPS Not Available
**Scenario**: Device GPS disabled or unavailable

**Handling**:
- Permission check before check-in
- Clear error message requesting GPS enable
- Option to retry after enabling
- No fallback to network location (accuracy critical)

**User Message**:
"Location permission required for attendance. Please enable GPS in settings."

### 2. Outside Geofence
**Scenario**: Worker attempts check-in outside site radius

**Handling**:
- Validation fails but allows override
- Record flagged for review
- Trust score penalized (-5 points)
- Contractor notified of anomaly

**User Experience**:
- Distance shown: "You are 250m from site (allowed: 100m)"
- Options: Cancel or Continue Anyway
- If continued, record marked as flagged

### 3. Location Services Timeout
**Scenario**: GPS takes too long to acquire location

**Handling**:
- 30 second timeout
- Retry option provided
- Cached location used if recent (< 1 minute)
- Error logged for diagnostics

## Camera Issues

### 1. Camera Permission Denied
**Scenario**: User denies camera access

**Handling**:
- Clear explanation of why camera needed
- Link to app settings
- Cannot proceed without permission
- No fallback allowed (fraud prevention)

### 2. Photo Capture Fails
**Scenario**: Camera crashes or photo not saved

**Handling**:
- Retry mechanism (up to 3 attempts)
- Error logged with device info
- User can cancel and try again
- Record not created without photo

## Validation Failures

### 1. Multiple Validation Rule Failures
**Scenario**: Record fails multiple validation rules

**Handling**:
- All failures logged separately
- Combined trust score penalty
- Single validation_reason with all issues
- Highlighted in contractor dashboard

**Example**:
```
Status: Flagged
Reason: Outside geofence: 150m from site (allowed: 100m); Same device ID used by multiple workers
Trust Score: 65 → 50 (-15)
```

### 2. Device ID Reuse
**Scenario**: Same device used by multiple workers

**Handling**:
- Check against all historical records
- Both workers flagged
- Trust score penalty (-10 points)
- Admin investigation triggered

### 3. Abnormal Working Hours
**Scenario**: Worker hours < 0.5 or > 16

**Handling**:
- Automatically flagged
- Wage calculation proceeds
- Contractor review required
- Trust score penalty (-3 points)

## Data Integrity

### 1. Missing Check-Out
**Scenario**: Worker forgets to check out

**Handling**:
- Record remains open indefinitely
- Highlighted in worker history
- Cannot check in again at same site
- Manual closure by contractor possible

**Prevention**:
- Notification at end of typical work day
- Warning when checking in with open record

### 2. Future Timestamps
**Scenario**: Device clock incorrect

**Handling**:
- Server timestamp used as authoritative
- Client timestamp validated
- Large discrepancies flagged
- Record rejected if > 24 hours future

### 3. Duplicate Records
**Scenario**: Same check-in synced multiple times

**Handling**:
- Unique constraint on (worker_id, check_in_time)
- Duplicate detection in sync service
- Only first record saved
- Others logged and discarded

## Authentication Issues

### 1. Session Expired
**Scenario**: User session times out

**Handling**:
- Auto-refresh enabled by default
- Graceful redirect to login
- Offline operations still work
- Sync occurs after re-login

### 2. Account Locked
**Scenario**: Too many failed login attempts

**Handling**:
- Supabase rate limiting
- Clear error message
- Wait period before retry
- Admin contact provided

## Database Failures

### 1. RLS Policy Rejection
**Scenario**: User tries to access unauthorized data

**Handling**:
- Empty result set returned
- Error logged for security audit
- User sees "No data available"
- No indication of blocked access

### 2. Constraint Violation
**Scenario**: Insert fails due to constraints

**Handling**:
- User-friendly error message
- Data preserved in offline storage
- Retry after correction
- Admin notified if persistent

## Network Performance

### 1. Slow Network
**Scenario**: Very slow internet connection

**Handling**:
- 30 second timeout for operations
- Loading indicators shown
- Option to cancel and go offline
- Sync resumes when faster

### 2. Partial Data Load
**Scenario**: List loads partially

**Handling**:
- Pagination implemented
- Load more on scroll
- Cached data shown first
- Refresh option always available

## Trust Score Edge Cases

### 1. Score at Boundaries (0 or 100)
**Scenario**: Trust score reaches limits

**Handling**:
- Score clamped to 0-100 range
- Further penalties/rewards logged
- Visual indicators at extremes
- Review triggered at score < 20

### 2. Rapid Score Changes
**Scenario**: Many flagged records in short time

**Handling**:
- All changes logged
- Pattern detection enabled
- Admin alert at > 5 flags/day
- Account suspension at score < 10

## Wage Calculation Issues

### 1. Zero or Negative Hours
**Scenario**: Check-out before check-in (clock issues)

**Handling**:
- Validation rejects negative hours
- Record flagged automatically
- No wage entry created
- Manual correction required

### 2. Extreme Overtime
**Scenario**: > 8 hours overtime in single day

**Handling**:
- Calculation proceeds normally
- Contractor alert generated
- Marked for verification
- Payment held until approved

## System Limits

### 1. Storage Quota Exceeded
**Scenario**: Too many offline records

**Handling**:
- Limit: 100 offline records
- Old synced records purged
- Warning at 80% capacity
- Forced sync attempted

### 2. Rate Limiting
**Scenario**: Too many API requests

**Handling**:
- Exponential backoff
- Queue requests locally
- User notified of delay
- Retry after cooldown

## Recovery Strategies

### General Principles
1. Never lose user data
2. Fail gracefully with clear messages
3. Provide retry mechanisms
4. Log all errors for diagnostics
5. Sync automatically when possible
6. Manual intervention as last resort

### Monitoring & Alerts
- Track validation failure rates
- Monitor offline sync queue size
- Alert on repeated GPS failures
- Flag unusual trust score patterns
- Track device ID anomalies
