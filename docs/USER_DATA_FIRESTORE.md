# User Data & Activity Logging in Firestore

This document describes how user data and activity logging are implemented in the PrimeFit application.

## Overview

All user data and activities are now stored in Firestore database, ensuring:

- User profiles are automatically created when users sign up
- All authentication activities are logged
- User role changes and updates are tracked
- Complete audit trail of system activities

## User Profile Management

### Automatic Profile Creation

When a user signs up (via email/password or Google OAuth), their profile is automatically created in Firestore:

**Location**: `apps/web/src/lib/userService.ts`

```typescript
createUserProfile(firebaseUser, additionalData?)
```

**Profile Data Stored**:

- `uid` - Firebase Authentication UID
- `email` - User email address
- `role` - User role (default: 'user')
- `fullname` - Full name
- `username` - Username
- `phone` - Phone number
- `isActive` - Account status (default: true)
- `status` - Account status enum (default: 'active')
- `lastLogin` - Last login timestamp
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp
- Additional optional fields (height, weight, age, gender, address)

### AuthContext Integration

**Location**: `apps/web/src/providers/AuthContext.tsx`

The `AuthContext` handles:

1. **On User Sign Up/Login**:

   - Checks if user profile exists in Firestore
   - If not exists, creates profile automatically
   - Logs the user creation activity
   - Updates last login timestamp for existing users

2. **Real-time Profile Sync**:

   - Listens to user profile changes in Firestore
   - Updates local state when profile changes
   - Syncs role to cookies for authorization

3. **Activity Logging**:
   - Logs all authentication events (login, signup)
   - Tracks authentication method (email, Google)

## Activity Logging

### What Gets Logged

All activities are stored in the `activity-logs` collection:

**Logged Activities**:

- ✅ User signup (both email and Google)
- ✅ User login (both email and Google)
- ✅ User profile updates
- ✅ Role changes by admins
- ✅ User creation by admins

### Activity Log Schema

**Location**: `packages/shared/src/schemas/activity-log.ts`

```typescript
{
  id: string
  userId: string           // User who performed the action
  action: 'create' | 'update' | 'delete' | 'login' | 'other'
  resourceType: 'workout-plan' | 'user' | 'profile' | 'system'
  resourceId?: string      // ID of the affected resource
  details?: Record<string, any>  // Additional context
  timestamp: Date
}
```

### Activity Logging Function

**Location**: `apps/web/src/lib/activity.ts`

```typescript
logActivity(userId, action, resourceType, resourceId?, details?)
```

**Usage Examples**:

```typescript
// Log user signup
await logActivity(userId, 'create', 'user', userId, {
  email: user.email,
  method: 'google',
})

// Log user update
await logActivity(adminId, 'update', 'user', targetUserId, {
  updates: { role: 'admin' },
  updatedBy: adminId,
})

// Log login
await logActivity(userId, 'login', 'system', undefined, {
  method: 'email',
  email: user.email,
})
```

## Firestore Security Rules

**Location**: `firestore.rules`

### User Collection Rules

- **Read**: Users can read their own profile, admins/coaches can read all
- **Create**: Only authenticated users can create their own profile (uid must match auth)
- **Update**: Users can update their own profile (except role/uid), admins can update any
- **Delete**: Only admins can delete users

### Activity Logs Rules

- **Read**: Admins can read all logs, users can read their own logs
- **Create**: Authenticated users can create logs for their own actions
- **Update**: Logs are immutable (no updates allowed)
- **Delete**: Only admins can delete logs

## Implementation Checklist

- [x] Created `userService.ts` for user profile management
- [x] Updated `AuthContext.tsx` to auto-create user profiles on signup
- [x] Added activity logging for authentication events
- [x] Updated `useUsers.ts` hooks to track authenticated user in logs
- [x] Ensured all user operations log activities
- [x] Security rules properly configured for users and activity logs

## Key Functions

### User Service (`apps/web/src/lib/userService.ts`)

| Function                | Description                          |
| ----------------------- | ------------------------------------ |
| `createUserProfile()`   | Creates user profile in Firestore    |
| `updateUserLastLogin()` | Updates user's last login timestamp  |
| `updateUserProfile()`   | Updates user profile with validation |

### User Hooks (`apps/web/src/hooks/useUsers.ts`)

| Hook              | Description                            |
| ----------------- | -------------------------------------- |
| `useUsers()`      | Fetches all users (admin only)         |
| `useUser(id)`     | Fetches single user by ID              |
| `useCreateUser()` | Creates new user profile               |
| `useUpdateUser()` | Updates user profile and logs activity |

## Data Flow

### User Signup Flow

```
User Signs Up
    ↓
Firebase Auth Creates User
    ↓
onAuthStateChanged Triggered
    ↓
Check if Profile Exists in Firestore
    ↓
NO → Create Profile + Log Activity
YES → Update Last Login
    ↓
Listen to Profile Changes
    ↓
Update Local State & Cookies
```

### User Login Flow

```
User Logs In
    ↓
Firebase Auth Authenticates
    ↓
Log Login Activity
    ↓
onAuthStateChanged Triggered
    ↓
Update Last Login Timestamp
    ↓
Listen to Profile Changes
    ↓
Update Local State & Cookies
```

## Testing

To verify the implementation:

1. **Sign up a new user**: Check Firestore for user document
2. **Check activity logs**: Verify signup activity was logged
3. **Login existing user**: Verify login activity and lastLogin update
4. **Update user role**: Verify activity log captures admin action
5. **View activity logs**: Check admin dashboard shows all activities

## Future Enhancements

- Add activity log filtering by user, date, or action type
- Implement activity log export functionality
- Add more granular activity tracking for other resources
- Implement activity log retention policies
- Add real-time activity notifications for admins
