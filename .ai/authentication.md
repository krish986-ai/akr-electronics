# Authentication Architecture - Phase 3

## Overview

Production-ready authentication system using Firebase Authentication with session management, role-based access control, and comprehensive security features.

---

## Architecture

### Firebase Integration

**Client-Side Firebase**
- Uses NEXT_PUBLIC_FIREBASE_* environment variables
- Initialized in `lib/firebase/config.ts`
- Available globally for client components
- Handles user authentication & OAuth

**Server-Side Integration**
- Session validation via database
- Token verification for API routes
- User management & profile updates
- Password reset flows

### Three-Layer Auth System

```
1. Firebase Auth (Identity Provider)
   ├─ Email/password registration
   ├─ Email/password login
   ├─ Google OAuth
   └─ Password reset emails

2. Session Management (Database)
   ├─ Session tokens
   ├─ Expiry validation
   ├─ Activity tracking
   └─ Multi-device support

3. API Middleware (Route Protection)
   ├─ requireAuth
   ├─ requireAdmin
   ├─ requireCustomer
   └─ Token extraction
```

---

## User Flow

### Registration Flow

```
1. User → POST /api/auth/register
   {email, password, name, phone}

2. Firebase creates user account
   → firebaseAuthService.registerWithEmail()

3. Database creates User record
   → userService.createUserFromFirebase()

4. Session token generated
   → sessionToken = generateSessionToken()

5. Session stored in database
   → userService.createSession()

6. Response sent with token + cookie
   → Set-Cookie: auth-token
   → Token in response body

7. User logged in automatically
```

### Login Flow

```
1. User → POST /api/auth/login
   {email, password}

2. User found in database
   → userService.getUserByEmail()

3. Firebase authenticates credentials
   → firebaseAuthService.loginWithEmail()

4. Login tracking updated
   → userService.updateLoginTracking(true)

5. Session token created
   → generateSessionToken()

6. Session stored in database
   → userService.createSession()

7. Response with token + cookie
```

### Protected Route Flow

```
1. Client sends request to protected endpoint
   → Authorization: Bearer {token}
   OR Cookie: auth-token={token}

2. Middleware extracts token
   → getTokenFromRequest()

3. Session validated
   → verifySession()
   → Check expiry
   → Check isValid

4. User & role verified
   → requireAuth / requireAdmin / requireCustomer

5. Request processed with auth context
6. Response sent
```

---

## Database Models

### User Model

```prisma
User {
  id              String @id @default(cuid())
  email           String @unique
  firebaseUid     String @unique?     // Firebase user ID
  name            String
  phone           String?
  image           String?
  role            UserRole (ADMIN|CUSTOMER)
  status          UserStatus
  emailVerified   Boolean @default(false)
  verifiedAt      DateTime?
  lastLoginAt     DateTime?
  loginCount      Int @default(0)
  failedLoginAttempts Int @default(0)
  lastFailedLoginAt DateTime?
  isDeleted       Boolean @default(false)
  deletedAt       DateTime?
  
  // Relations
  sessions        Session[]
  passwordReset   PasswordReset[]
  orders          Order[]
  addresses       Address[]
  // ... other relations
}
```

### Session Model

```prisma
Session {
  id              String @id @default(cuid())
  userId          String (FK)
  user            User
  token           String @unique
  expiresAt       DateTime
  createdAt       DateTime
  updatedAt       DateTime
  ipAddress       String?
  userAgent       String?
  lastActivityAt  DateTime
  isValid         Boolean @default(true)
}
```

### PasswordReset Model

```prisma
PasswordReset {
  id              String @id @default(cuid())
  userId          String (FK)
  user            User
  token           String @unique
  expiresAt       DateTime
  usedAt          DateTime?
  createdAt       DateTime
}
```

---

## Services

### firebaseAuthService

Located: `lib/auth/firebase.ts`

**Methods:**
- `registerWithEmail(email, password)` → FirebaseUser
- `loginWithEmail(email, password)` → FirebaseUser
- `loginWithGoogle()` → FirebaseUser
- `sendPasswordReset(email)` → void
- `confirmPasswordReset(code, newPassword)` → void
- `logout()` → void
- `getCurrentUser()` → FirebaseUser | null
- `getIdToken()` → string | null

**Error Handling:**
- Custom FirebaseAuthError class
- User-friendly error messages
- Error code mapping

### userService

Located: `lib/auth/user-service.ts`

**Methods:**
- `getUserByEmail(email)` → User | null
- `getUserByFirebaseUid(uid)` → User | null
- `getUserById(id)` → User | null
- `createUserFromFirebase(email, uid, name, phone?, image?)` → User
- `updateUserProfile(userId, data)` → User
- `verifyEmail(userId)` → User
- `createSession(userId, token, expiresAt, ip?, agent?)` → Session
- `getValidSession(token)` → Session | null
- `invalidateSession(token)` → Session
- `createPasswordReset(userId, expiresIn?)` → PasswordReset
- `getPasswordReset(token)` → PasswordReset | null
- `usePasswordReset(token)` → PasswordReset
- `updateLoginTracking(userId, success)` → User
- `toAuthUser(user)` → AuthUser (safe user data)
- `getUserProfile(userId)` → UserProfile | null
- `isAdmin(user)` → boolean
- `isActive(user)` → boolean

---

## Middleware

Located: `lib/auth/middleware.ts`

### Core Functions

**verifySession(token)**
- Retrieves session from database
- Checks validity flag
- Validates expiry time
- Invalidates expired sessions
- Returns session or null

**getTokenFromRequest(request)**
- Checks Authorization header
- Checks auth-token cookie
- Returns token or null

**requireAuth(request)**
- Extracts token
- Verifies session
- Returns { user, session } or { error, status }

**requireAdmin(request)**
- Requires authentication
- Checks role === ADMIN
- Returns { user, session } or { error, status }

**requireCustomer(request)**
- Requires authentication
- Checks role === CUSTOMER
- Returns { user, session } or { error, status }

### Helpers

**generateSessionToken()** → string
- Creates unique session token
- Base64 encoded JSON with timestamp & random value

**authErrorResponse(error, status)** → NextResponse
- JSON error response
- Sets HTTP status code
- { success: false, error }

**authSuccessResponse(data, status)** → NextResponse
- JSON success response
- Spreads data into response
- { success: true, ...data }

---

## API Endpoints

### Authentication

#### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "User Name",
  "phone": "+91-XXXXXXXXXX"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CUSTOMER",
    "emailVerified": false
  },
  "token": "..."
}
```

**Errors:**
- 400: Invalid input
- 409: Email already registered
- 500: Server error

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {...},
  "token": "..."
}
```

**Errors:**
- 400: Invalid input
- 401: Invalid credentials
- 403: Account not active
- 500: Server error

#### POST /api/auth/google
**Request:**
```json
{
  "idToken": "firebase-id-token"
}
```

**Response (200):** Same as login

#### POST /api/auth/logout
**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/password-reset/request
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

#### POST /api/auth/password-reset/confirm
**Request:**
```json
{
  "code": "reset-code",
  "newPassword": "new-password",
  "confirmPassword": "new-password"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

#### GET /api/auth/verify
**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {...},
  "authenticated": true
}
```

**Errors:**
- 401: Not authenticated

### User Profile

#### GET /api/users/profile
**Response (200):**
```json
{
  "success": true,
  "profile": {
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+91-XXXXXXXXXX",
    "image": "https://...",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "emailVerified": true,
    "createdAt": "2026-06-28T..."
  }
}
```

#### PUT /api/users/profile
**Request:**
```json
{
  "name": "Updated Name",
  "phone": "+91-XXXXXXXXXX",
  "image": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {...}
}
```

---

## Validation Schemas

Located: `lib/auth/validation.ts`

### Schemas (Zod)

- **emailSchema** - Valid email format
- **passwordSchema** - 8+ characters
- **nameSchema** - 2+ characters
- **phoneSchema** - Valid phone format (optional)
- **registerSchema** - Full registration validation
- **loginSchema** - Email + password
- **passwordResetRequestSchema** - Email only
- **passwordResetConfirmSchema** - Code + matching passwords
- **profileUpdateSchema** - Optional name, phone, image

---

## Security Features

### Authentication Security

✅ **Firebase Credential Management**
- Passwords hashed by Firebase
- No plaintext storage
- OAuth support
- Email verification

✅ **Session Security**
- Secure tokens (random + timestamp)
- 30-day expiry
- Single-use password reset tokens
- Multi-device support

✅ **Cookie Security**
- httpOnly flag (no JS access)
- secure flag (HTTPS only in production)
- sameSite=lax (CSRF protection)
- 30-day max-age

✅ **Input Validation**
- Zod schema validation
- Type-safe database queries
- Email uniqueness checks
- Password requirements

✅ **Error Handling**
- No credential leakage
- Generic error messages for failed logins
- Email enumeration protection
- Detailed server-side logging

✅ **Role-Based Access**
- ADMIN and CUSTOMER roles
- Middleware enforcement
- Database-backed roles
- Secure role checking

---

## Configuration

### Environment Variables

**Client (NEXT_PUBLIC_*)**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Server (Private)**
```
FIREBASE_ADMIN_PRIVATE_KEY
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
SESSION_SECRET
SESSION_EXPIRY_MS
ADMIN_EMAIL
```

### Firebase Setup

1. Create Firebase project at console.firebase.google.com
2. Enable Authentication > Email/Password
3. Enable Authentication > Google Sign-In
4. Copy Web config to .env.local
5. Create service account for admin SDK (Phase 4)

---

## Testing Endpoints

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test User",
    "phone": "+91-9999999999"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Verify Session
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer {token}"
```

---

## Future Enhancements

### Phase 4
- User interface (login, register, profile pages)
- Google OAuth flow UI
- Password reset UI
- Email verification UI
- Admin panel access

### Phase 5
- Two-factor authentication
- Session management UI
- Device management
- Login history
- Security audit log

### Maintenance
- Session cleanup (expired tokens)
- Failed login throttling
- Account lockout after N failures
- Suspicious login alerts
