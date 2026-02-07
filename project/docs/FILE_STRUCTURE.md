# Complete File Structure

## Overview
This document lists all files in the KshetraX project with descriptions.

## Project Root
```
KshetraX/
├── .env                     # Environment variables (Supabase credentials)
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier code formatting config
├── app.json                # Expo app configuration
├── package.json            # Node dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── tsconfig.json           # TypeScript configuration
├── README.md               # Main project documentation
```

## App Directory (`/app`)
Main application screens and navigation.

```
app/
├── _layout.tsx             # Root layout with Auth & Offline providers
├── index.tsx               # Entry point (redirects to auth/tabs)
├── +not-found.tsx          # 404 error screen
│
├── auth/                   # Authentication screens
│   ├── login.tsx           # Login screen with email/password
│   └── signup.tsx          # Signup screen for new workers
│
└── (tabs)/                 # Main tab-based navigation
    ├── _layout.tsx         # Tab layout configuration
    ├── index.tsx           # Check-in/check-out screen (Home)
    ├── history.tsx         # Attendance history screen
    ├── wages.tsx           # Wage information screen
    └── profile.tsx         # Worker profile screen
```

## Components Directory (`/components`)
Reusable UI components used across screens.

```
components/
├── Button.tsx              # Primary button component with variants
├── Card.tsx                # Card container component
├── StatusBadge.tsx         # Attendance status badge (validated/flagged/pending)
└── TrustScoreDisplay.tsx   # Trust score visualization component
```

## Contexts Directory (`/contexts`)
React Context providers for global state management.

```
contexts/
├── AuthContext.tsx         # Authentication state management
│                           # - Session management
│                           # - User profile
│                           # - Sign in/up/out functions
│
└── OfflineContext.tsx      # Offline data sync management
                            # - Network status monitoring
                            # - Pending sync count
                            # - Auto/manual sync functions
```

## Services Directory (`/services`)
Business logic and data operations.

```
services/
├── geofence.service.ts     # GPS geofencing logic
│                           # - Haversine distance calculation
│                           # - Geofence validation
│
├── validation.service.ts   # Attendance validation rule engine
│                           # - Geofence validation
│                           # - Device ID anomaly detection
│                           # - Working hours validation
│                           # - Trust score updates
│
└── offline.service.ts      # Offline data management
                            # - Local storage operations
                            # - Sync queue management
                            # - Conflict resolution
```

## Library Directory (`/lib`)
Third-party library configurations.

```
lib/
└── supabase.ts             # Supabase client initialization
                            # - Database connection
                            # - Auth configuration
                            # - AsyncStorage integration
```

## Types Directory (`/types`)
TypeScript type definitions.

```
types/
├── database.ts             # Database table types
│                           # - Worker, Site, AttendanceRecord
│                           # - WageEntry, ValidationLog
│                           # - TrustScoreHistory
│                           # - Helper types
│
└── env.d.ts                # Environment variable types
```

## Hooks Directory (`/hooks`)
Custom React hooks.

```
hooks/
└── useFrameworkReady.ts    # Framework initialization hook (REQUIRED)
```

## Documentation Directory (`/docs`)
Comprehensive project documentation.

```
docs/
├── ARCHITECTURE.md         # System architecture overview
│                           # - High-level design
│                           # - Data flow diagrams
│                           # - Component interactions
│                           # - Technology stack
│
├── API_CONTRACTS.md        # API endpoint documentation
│                           # - Supabase queries
│                           # - Request/response formats
│                           # - Database functions
│                           # - Authentication APIs
│
├── EDGE_CASES.md           # Edge case handling strategies
│                           # - Connectivity issues
│                           # - Location problems
│                           # - Validation failures
│                           # - Recovery strategies
│
├── HACKATHON_PITCH.md      # Hackathon presentation deck
│                           # - Problem statement
│                           # - Solution overview
│                           # - Demo scenarios
│                           # - Business impact
│
└── FILE_STRUCTURE.md       # This file - complete file listing
```

## Assets Directory (`/assets`)
Static assets (images, fonts, etc.)

```
assets/
└── images/
    ├── icon.png            # App icon
    └── favicon.png         # Web favicon
```

## Database Migrations
Applied directly to Supabase (not stored in project files).

```
Migration: create_kshetrax_schema
├── workers table           # User profiles with trust scores
├── sites table             # Construction sites with geofences
├── attendance_records      # Check-in/check-out data
├── wage_entries           # Calculated wages
├── validation_logs        # Rule engine results
├── trust_score_history    # Trust score changes
├── Indexes                # Performance optimization
├── RLS Policies           # Row-level security
└── Functions              # update_worker_trust_score, calculate_wage_entry
```

## Key Files Explained

### Core Application Files

#### `/app/_layout.tsx`
Root layout that wraps the entire app with:
- AuthProvider: Manages authentication state
- OfflineProvider: Handles offline sync
- Stack Navigator: Manages screen navigation
- CRITICAL: Contains useFrameworkReady() hook (DO NOT REMOVE)

#### `/app/index.tsx`
App entry point that:
- Checks authentication status
- Redirects to login if not authenticated
- Redirects to tabs if authenticated
- Shows loading spinner during check

#### `/app/(tabs)/index.tsx`
Main check-in/check-out screen:
- Site selection
- GPS location capture
- Camera integration
- Geofence validation
- Offline mode support
- Active attendance display

#### `/app/(tabs)/history.tsx`
Attendance history display:
- Paginated record list
- Status badges
- Hours worked calculation
- Validation reasons
- Site information

#### `/app/(tabs)/wages.tsx`
Wage information screen:
- Total pending/paid summary
- Wage entry list
- Detailed breakdowns
- Regular/overtime hours
- Deductions display

#### `/app/(tabs)/profile.tsx`
Worker profile screen:
- Trust score display
- Personal information
- Sync status
- Pending sync count
- Sign out functionality

### Context Files

#### `/contexts/AuthContext.tsx`
Manages authentication:
- Session state
- User profile
- Worker profile
- Sign in/up/out functions
- Auto-refresh tokens
- Profile loading

#### `/contexts/OfflineContext.tsx`
Handles offline operations:
- Network status monitoring
- Pending sync count
- Auto-sync on connectivity
- Manual sync trigger
- Sync status updates

### Service Files

#### `/services/geofence.service.ts`
GPS validation:
- Haversine formula for distance
- Geofence boundary checking
- Distance calculations
- Location comparison

#### `/services/validation.service.ts`
Rule engine implementation:
- Geofence validation
- Device ID checking
- Working hours validation
- Trust score calculation
- Validation logging
- Wage entry triggering

#### `/services/offline.service.ts`
Offline data management:
- Save records to AsyncStorage
- Retrieve pending records
- Sync with server
- Clear synced records
- Count pending items

### Component Files

#### `/components/Button.tsx`
Reusable button with:
- Primary, secondary, danger variants
- Loading state
- Disabled state
- Custom styling support

#### `/components/Card.tsx`
Container component with:
- Consistent styling
- Shadow/elevation
- Padding
- Border radius

#### `/components/StatusBadge.tsx`
Status indicator with:
- Color-coded badges
- Validated (green)
- Flagged (red)
- Pending (yellow)

#### `/components/TrustScoreDisplay.tsx`
Trust score visualization:
- Circular display
- Color-coded (green/yellow/red)
- Small and large variants
- Score label

### Configuration Files

#### `/.env`
Environment variables:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- Already configured with credentials

#### `/package.json`
Project configuration:
- Dependencies list
- Scripts (dev, build, lint)
- Project metadata
- Version information

#### `/tsconfig.json`
TypeScript configuration:
- Path aliases (@/*)
- Strict mode enabled
- Expo TypeScript base

#### `/app.json`
Expo configuration:
- App name and slug
- Version number
- Platform settings
- Plugin configuration

## File Count Summary

- **Total Files**: ~35 code files
- **Screens**: 7 (login, signup, 4 tabs, index, 404)
- **Components**: 4 reusable components
- **Contexts**: 2 providers
- **Services**: 3 business logic modules
- **Types**: 2 type definition files
- **Documentation**: 5 markdown files
- **Configuration**: 5 config files

## Code Statistics

- **TypeScript Files**: ~30
- **Lines of Code**: ~3,000+ (excluding docs)
- **Database Tables**: 6
- **Database Functions**: 2
- **RLS Policies**: ~20
- **API Endpoints**: All via Supabase client

## Import Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
// Instead of: ../../components/Button
import { Button } from '@/components/Button';

// Instead of: ../../../contexts/AuthContext
import { useAuth } from '@/contexts/AuthContext';

// Instead of: ../../services/geofence.service
import { GeofenceService } from '@/services/geofence.service';
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Critical Files (DO NOT DELETE)

1. `/app/_layout.tsx` - Contains required useFrameworkReady() hook
2. `/hooks/useFrameworkReady.ts` - Framework initialization
3. `/.env` - Supabase credentials
4. `/lib/supabase.ts` - Database client
5. `/types/database.ts` - Core type definitions

## Generated Files (Git Ignored)

```
node_modules/           # NPM dependencies
.expo/                 # Expo build cache
dist/                  # Build output
.DS_Store             # macOS system file
*.log                 # Log files
```

## Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Type Checking**
   ```bash
   npm run typecheck
   ```

3. **Build for Web**
   ```bash
   npm run build:web
   ```

4. **Run Linter**
   ```bash
   npm run lint
   ```

## File Naming Conventions

- **Screens**: PascalCase with `.tsx` (e.g., `LoginScreen.tsx`)
- **Components**: PascalCase (e.g., `Button.tsx`)
- **Services**: camelCase with `.service.ts` (e.g., `geofence.service.ts`)
- **Contexts**: PascalCase with `Context` suffix (e.g., `AuthContext.tsx`)
- **Types**: camelCase with `.ts` (e.g., `database.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useFrameworkReady.ts`)

## Code Organization Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Separation of Concerns**: UI, logic, and data layers separated
3. **Reusability**: Common components extracted
4. **Type Safety**: TypeScript for all code
5. **Modularity**: Services are independent modules
6. **Context for State**: Global state via Context API
7. **Service Layer**: Business logic separate from UI

---

This file structure is designed for:
- Easy navigation
- Clear separation of concerns
- Scalability
- Maintainability
- Team collaboration
