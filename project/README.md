# KshetraX - Construction Operations Platform

An offline-first workforce and site operations platform for the construction sector. KshetraX reduces fraud, improves transparency, and ensures operational reliability through GPS geofencing, device fingerprinting, and rule-based validation.

## Features

### Worker Mobile App
- GPS-based geofencing for attendance verification
- Selfie capture for visual verification
- Offline-first with automatic sync
- Real-time trust score tracking
- Transparent wage calculation
- Attendance history
- Wage breakdown

### Validation & Rule Engine
- Geofence validation (GPS-based)
- Device ID anomaly detection
- Working hours validation
- Automated flagging system
- Explainable validation reasons

### Trust Score System
- Dynamic score (0-100)
- Increases with validated attendance
- Decreases with flagged records
- Historical tracking
- Transparent to workers

### Wage Ledger
- Automatic wage calculation
- Hourly and overtime rates
- Deductions support
- Payment status tracking
- Detailed breakdowns

### Role-Based Access
- **Worker**: Own attendance, trust score, wages
- **Contractor**: Site attendance, flagged records
- **Admin**: Full system access, analytics

## Technology Stack

- **Frontend**: React Native Expo 54
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Offline Storage**: AsyncStorage
- **Location**: expo-location
- **Camera**: expo-camera
- **Network Detection**: NetInfo

## Project Structure

```
KshetraX/
├── app/
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── index.tsx        # Check-in/check-out screen
│   │   ├── history.tsx      # Attendance history
│   │   ├── wages.tsx        # Wage information
│   │   ├── profile.tsx      # Worker profile
│   │   └── _layout.tsx      # Tab layout configuration
│   ├── auth/
│   │   ├── login.tsx        # Login screen
│   │   └── signup.tsx       # Signup screen
│   ├── index.tsx            # App entry point
│   └── _layout.tsx          # Root layout with providers
├── components/              # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── StatusBadge.tsx
│   └── TrustScoreDisplay.tsx
├── contexts/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   └── OfflineContext.tsx   # Offline sync management
├── services/                # Business logic services
│   ├── geofence.service.ts  # GPS validation
│   ├── validation.service.ts # Rule engine
│   └── offline.service.ts   # Offline data management
├── lib/
│   └── supabase.ts          # Supabase client
├── types/
│   ├── database.ts          # TypeScript types
│   └── env.d.ts             # Environment types
└── docs/                    # Documentation
    ├── ARCHITECTURE.md      # System architecture
    ├── API_CONTRACTS.md     # API documentation
    ├── EDGE_CASES.md        # Edge case handling
    └── HACKATHON_PITCH.md   # Pitch deck
```

## Database Schema

### Tables
- **workers**: User profiles with trust scores
- **sites**: Construction sites with geofence data
- **attendance_records**: Check-in/check-out records
- **wage_entries**: Calculated wages
- **validation_logs**: Rule engine results
- **trust_score_history**: Trust score changes

### Functions
- `update_worker_trust_score()`: Updates trust score with history
- `calculate_wage_entry()`: Calculates wages from attendance

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### 1. Clone Repository
```bash
git clone <repository-url>
cd kshetrax
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase

The Supabase database is already configured in the `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=https://wgfeywiqylfbcgoftlyi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

The database schema has already been created with the migration file.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Run on Device
- Install Expo Go app on your mobile device
- Scan the QR code from terminal
- App will load on your device

## Usage Guide

### First Time Setup

1. **Create Account**
   - Open app
   - Click "Create Account"
   - Enter name, phone, email, password
   - Account created with default trust score of 50

2. **Create Test Site** (Admin/Contractor)
   - Use Supabase dashboard
   - Insert site with GPS coordinates
   - Set geofence radius (e.g., 100 meters)

### Worker Flow

1. **Check In**
   - Open app at construction site
   - Select site from list
   - Grant location and camera permissions
   - System validates GPS location
   - Take selfie photo
   - Attendance recorded

2. **Check Out**
   - Open app at end of day
   - Click "Check Out" button
   - GPS captured automatically
   - Hours calculated
   - Wage entry generated

3. **View History**
   - Navigate to History tab
   - See all past attendance records
   - View validation status
   - Check reasons for flagged records

4. **View Wages**
   - Navigate to Wages tab
   - See total pending and paid wages
   - View detailed wage breakdowns
   - Track payment status

5. **Check Profile**
   - Navigate to Profile tab
   - View trust score
   - See personal information
   - Check sync status
   - Sign out

### Offline Mode

1. **Working Offline**
   - App automatically detects connectivity
   - "Offline Mode" badge displayed
   - Attendance recorded locally
   - Data saved to device storage

2. **Automatic Sync**
   - When internet restored
   - App automatically syncs pending records
   - Validation runs on server
   - Trust score updated
   - Wages calculated

3. **Manual Sync**
   - Go to Profile tab
   - View pending sync count
   - Click "Sync Now" button
   - All data synced immediately

## Validation Rules

### 1. Geofence Validation
- **Rule**: Worker must be within site radius
- **Pass**: Inside geofence → Trust +2
- **Fail**: Outside geofence → Trust -5, Flagged

### 2. Device ID Anomaly
- **Rule**: Device ID must be unique per worker
- **Pass**: Unique device → No penalty
- **Fail**: Reused device → Trust -10, Flagged

### 3. Working Hours
- **Rule**: Hours worked must be 0.5-16 hours
- **Pass**: Normal hours → No penalty
- **Fail**: Abnormal hours → Trust -3, Flagged

## Trust Score Guide

- **90-100**: Excellent - Consistent validated attendance
- **70-89**: Good - Mostly validated with few issues
- **50-69**: Average - Some flagged records
- **30-49**: Poor - Many flagged records
- **0-29**: Critical - Requires investigation

## Wage Calculation

### Regular Hours (First 8 hours)
```
regular_amount = hours × hourly_wage
```

### Overtime (Beyond 8 hours)
```
overtime_amount = (hours - 8) × hourly_wage × 1.5
```

### Total
```
total = regular_amount + overtime_amount - deductions
```

### Example
- Hourly wage: ₹150
- Hours worked: 10 hours
- Regular: 8 × ₹150 = ₹1,200
- Overtime: 2 × ₹150 × 1.5 = ₹450
- Total: ₹1,650

## Security

### Row Level Security (RLS)
- Workers can only access own data
- Contractors can view their site data
- Admins have full system access
- All policies enforced at database level

### Authentication
- Email/password authentication
- Secure session management
- Automatic token refresh
- Device-specific sessions

### Data Privacy
- Location captured only during work hours
- Photos stored securely
- Data encrypted in transit
- No third-party sharing

## Testing

### Test Scenarios

1. **Valid Check-In**
   - Be within 100m of site location
   - Check in normally
   - Verify status is "Validated"
   - Trust score increases

2. **Outside Geofence**
   - Be >100m from site
   - Try to check in
   - See distance warning
   - Continue anyway
   - Verify status is "Flagged"

3. **Offline Check-In**
   - Enable airplane mode
   - Check in as normal
   - Verify "Offline Mode" badge
   - Disable airplane mode
   - Wait for auto-sync

4. **Check-Out**
   - Check in first
   - Wait a few minutes
   - Check out
   - Verify hours calculated
   - Check wage entry created

## Troubleshooting

### Location Not Working
- Ensure GPS is enabled
- Grant location permission
- Try restarting app
- Check device location settings

### Camera Not Working
- Grant camera permission
- Close other apps using camera
- Restart device if needed
- Check camera in other apps

### Offline Sync Failing
- Ensure internet connection
- Check pending count in Profile
- Try manual sync
- Check Supabase status

### Trust Score Not Updating
- Wait for validation to complete
- Check validation logs
- Ensure record is synced
- Contact admin if persistent

## API Documentation

See [API_CONTRACTS.md](docs/API_CONTRACTS.md) for detailed API documentation.

## Architecture

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system architecture details.

## Edge Cases

See [EDGE_CASES.md](docs/EDGE_CASES.md) for edge case handling strategies.

## Hackathon Pitch

See [HACKATHON_PITCH.md](docs/HACKATHON_PITCH.md) for the complete pitch deck.

## Development

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Build for Web
```bash
npm run build:web
```

## Future Enhancements

### Phase 2
- Material tracking
- Equipment management
- Site photos
- Progress reports

### Phase 3
- Advanced analytics
- Predictive insights
- Performance metrics
- Custom reports

### Phase 4
- Payroll integration
- Bank transfers
- Tax calculations
- Compliance reporting

### Phase 5
- Industry-wide network
- Transferable reputation
- Microfinance integration
- Insurance eligibility

## Contributing

This is a hackathon prototype. Contributions welcome!

## License

MIT License

## Support

For questions or issues:
- Create an issue on GitHub
- Email: support@kshetrax.com
- Documentation: /docs folder

## Acknowledgments

Built for construction workers and contractors who deserve transparency and fair treatment.

---

**KshetraX** - Transforming Construction Operations
