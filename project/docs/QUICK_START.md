# Quick Start Guide

Get KshetraX running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Smartphone with Expo Go app
- Internet connection

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

This installs all required packages including React Native, Expo, and Supabase.

## Step 2: Database Setup (Already Done!)

The database is already configured and migrated. You don't need to do anything!

**Supabase URL**: Already in `.env` file
**Database Schema**: Already created with migration

## Step 3: Create Sample Data (2 minutes)

### Option A: Using Supabase Dashboard

1. Go to https://wgfeywiqylfbcgoftlyi.supabase.co
2. Navigate to SQL Editor
3. Run this SQL:

```sql
-- Create a sample site
INSERT INTO sites (name, latitude, longitude, radius_meters, active)
VALUES
  ('Construction Site Alpha', 12.9716, 77.5946, 100, true),
  ('Construction Site Beta', 13.0827, 80.2707, 150, true);
```

### Option B: Use the App
Sites can also be managed through the app once you have an admin account.

## Step 4: Start the App (30 seconds)

```bash
npm run dev
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## Step 5: Open on Your Phone (1 minute)

1. Open **Expo Go** app on your smartphone
2. Scan the QR code from your terminal
3. Wait for app to load (first time may take 30 seconds)

## Step 6: Create Your Account (30 seconds)

1. Tap "Create Account"
2. Fill in:
   - Name: Your Name
   - Phone: Your Phone Number
   - Email: your@email.com
   - Password: ********
3. Tap "Sign Up"

You're now logged in with a trust score of 50!

## Step 7: Test Check-In Flow (1 minute)

### Testing Inside Geofence
If you're at the test site location (12.9716°N, 77.5946°E):
1. Select "Construction Site Alpha"
2. Tap "Check In"
3. Grant location permission
4. Grant camera permission
5. Take selfie
6. Check-in recorded!

### Testing Outside Geofence (Anywhere)
1. Select "Construction Site Alpha"
2. Tap "Check In"
3. You'll see: "Outside geofence: XXXm from site"
4. Tap "Continue Anyway"
5. Take selfie
6. Check-in recorded as FLAGGED

## Step 8: Explore Other Features

### View History
1. Tap "History" tab
2. See your check-in record
3. Note the status badge (Validated or Flagged)

### Check-Out
1. Go back to "Check-In" tab
2. Tap "Check Out"
3. Hours calculated automatically
4. Wage entry created!

### View Wages
1. Tap "Wages" tab
2. See pending wage
3. View breakdown (regular + overtime)

### Check Profile
1. Tap "Profile" tab
2. See your trust score
3. View personal info
4. Check sync status

## Testing Offline Mode

### Enable Offline Mode
1. Put phone in Airplane Mode
2. Try to check in
3. See "Offline Mode" badge
4. Check-in saves locally

### Sync Data
1. Disable Airplane Mode
2. Data syncs automatically OR
3. Go to Profile → Tap "Sync Now"

## Common Test Scenarios

### Scenario 1: Valid Worker
```
Check-In → Inside Geofence → Check-Out after 8 hours
Result: Status = Validated, Trust Score +2, Wage = ₹1200
```

### Scenario 2: Outside Geofence
```
Check-In → Outside Geofence → Continue Anyway → Check-Out
Result: Status = Flagged, Trust Score -5, Reason = "Outside geofence"
```

### Scenario 3: Short Shift
```
Check-In → Check-Out after 15 minutes
Result: Status = Flagged, Trust Score -3, Reason = "Abnormal working hours"
```

### Scenario 4: Overtime
```
Check-In → Check-Out after 10 hours
Result: Wage = ₹1200 (regular) + ₹450 (OT) = ₹1650
```

## Creating Multiple Test Users

### Worker Account
```
Role: worker
Default trust score: 50
Can: Check-in, view own data
```

### Contractor Account
```typescript
// After signup, manually update in Supabase:
UPDATE workers SET role = 'contractor' WHERE email = 'contractor@example.com';
```

### Admin Account
```typescript
// After signup, manually update in Supabase:
UPDATE workers SET role = 'admin' WHERE email = 'admin@example.com';
```

## Troubleshooting Quick Fixes

### App Won't Load
```bash
# Clear Expo cache
npx expo start -c
```

### Location Not Working
- Enable GPS on phone
- Grant location permission when prompted
- Ensure you're testing outdoors (GPS works better)

### Camera Not Working
- Grant camera permission
- Close other apps using camera
- Restart Expo Go app

### Can't Sign In
- Check email/password
- Ensure internet connection
- Check Supabase is running (green status)

### No Sites Showing
- Verify sites inserted in database
- Check `active = true`
- Refresh app (shake phone → Reload)

## Quick Database Queries

### View All Workers
```sql
SELECT id, name, trust_score, role FROM workers;
```

### View Recent Attendance
```sql
SELECT w.name, s.name as site, ar.status, ar.check_in_time
FROM attendance_records ar
JOIN workers w ON w.id = ar.worker_id
JOIN sites s ON s.id = ar.site_id
ORDER BY ar.check_in_time DESC
LIMIT 10;
```

### View Wage Summary
```sql
SELECT w.name, SUM(we.total_amount) as total_wages, COUNT(*) as records
FROM wage_entries we
JOIN workers w ON w.id = we.worker_id
GROUP BY w.name;
```

### Check Trust Scores
```sql
SELECT name, trust_score
FROM workers
ORDER BY trust_score DESC;
```

## Development Tips

### Hot Reload
- Shake your phone
- Tap "Reload"
- Changes apply instantly

### Debug Console
- Shake phone
- Tap "Debug Remote JS"
- Open Chrome DevTools

### View Logs
Terminal shows:
- Network requests
- Console logs
- Error messages
- Build warnings

## Next Steps

1. **Customize Sites**
   - Add your actual construction sites
   - Set appropriate geofence radius
   - Assign contractors

2. **Adjust Wages**
   - Update hourly_wage in workers table
   - Set different rates per worker
   - Add deduction rules

3. **Test Validation**
   - Try different scenarios
   - Check validation logs
   - Verify trust score changes

4. **Explore Role-Based Access**
   - Create contractor account
   - View site-wide attendance
   - Test permissions

5. **Add More Workers**
   - Create multiple accounts
   - Test same device detection
   - Verify RLS policies

## Support

- **Documentation**: `/docs` folder
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Reference**: `docs/API_CONTRACTS.md`
- **Edge Cases**: `docs/EDGE_CASES.md`

## Production Deployment

When ready for production:

1. **Update Environment**
   - Use production Supabase project
   - Update .env file
   - Enable email verification

2. **Configure Expo**
   - Set up EAS Build
   - Configure app signing
   - Submit to app stores

3. **Security Hardening**
   - Enable rate limiting
   - Add fraud detection
   - Set up monitoring

4. **Testing**
   - Test on multiple devices
   - Verify offline sync
   - Load test database

---

**You're all set! Start building the future of construction operations.**

Need help? Check the docs folder or create an issue on GitHub.
