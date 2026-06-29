# A.K.R Electronics - Installation & Setup Guide

**Version**: 1.0.0  
**Last Updated**: 2026-06-29  
**Status**: Production Ready

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Firebase Setup](#firebase-setup)
6. [Development](#development)
7. [Production Build](#production-build)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

- **Node.js**: 18.17.0 or later (LTS recommended)
- **npm**: 9.0.0 or later
- **PostgreSQL**: 14.0 or later (for local development)
- **Git**: 2.0 or later
- **RAM**: 4GB minimum
- **Disk Space**: 2GB free space

### Recommended Setup

- **Node.js**: 20.x LTS or later
- **npm**: 10.x or later
- **PostgreSQL**: 15.x
- **RAM**: 8GB+
- **macOS/Linux** or **Windows 11** with WSL2

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/akr-electronics/akr-electronics.git
cd akr-electronics
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required npm packages including:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase SDKs
- And all other dependencies

### 3. Create Environment File

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your configuration (see [Environment Configuration](#environment-configuration)).

### 4. Verify Installation

```bash
npm run type-check
npm run lint
npm run build
```

All commands should complete without errors.

---

## Environment Configuration

### `.env.local` File

Copy `.env.example` to `.env.local` and configure the following:

#### Database

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/akr_electronics"
```

#### Firebase (Client-side)

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

#### Firebase (Server-side - Secure)

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_PROJECT_ID="your-project-id"
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
```

#### Session & Security

```env
SESSION_SECRET="your-random-secret-key-min-32-characters"
SESSION_EXPIRY_MS="2592000000"  # 30 days in milliseconds
```

#### Razorpay (Payment)

```env
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_SECRET_KEY="your-razorpay-secret-key"
```

#### Application

```env
NEXT_PUBLIC_APP_NAME="A.K.R Electronics"
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # or production URL
NODE_ENV="development"  # or "production"
ADMIN_EMAIL="admin@akrelectronics.com"
```

---

## Database Setup

### PostgreSQL Installation

#### macOS

```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows

Download and install from https://www.postgresql.org/download/windows/

### Create Database

```bash
createdb akr_electronics
```

Or using psql:

```bash
psql -U postgres
CREATE DATABASE akr_electronics;
\q
```

### Run Prisma Migrations

First, install Prisma CLI globally (optional):

```bash
npm install -g prisma
```

Then run migrations:

```bash
npx prisma migrate dev
```

This will:
- Create all database tables
- Generate Prisma client
- Prompt to create a new migration if needed

### Verify Database Connection

```bash
npx prisma db push
npx prisma studio  # Opens Prisma Studio GUI
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name: "akr-electronics-dev"
4. Enable Google Analytics (optional)
5. Create the project

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Enable "Google" OAuth provider (recommended)

### 3. Create Web App

1. In Project Settings, click "Add App"
2. Select "Web" platform
3. Register app
4. Copy the Firebase config and add to `.env.local`

### 4. Create Service Account

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the credentials and add to `.env.local` as:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`

### 5. Enable Firestore Database (Optional)

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose development mode or set security rules

---

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Check TypeScript types |
| `npx prisma migrate dev` | Create database migration |
| `npx prisma db push` | Sync database schema |
| `npx prisma studio` | Open Prisma Studio GUI |

### Useful Development Features

#### Hot Reload

Changes to files are automatically reflected in the browser.

#### Prisma Studio

View and manage database records:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

#### TypeScript Compilation

Check for type errors:

```bash
npm run type-check
```

#### Code Formatting

Format all code with Prettier:

```bash
npm run format
```

---

## Production Build

### Build Steps

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Build Output

Production build generates:

- `.next/` - Optimized Next.js build
- `.next/static/` - Compiled JavaScript and CSS
- `.next/server/` - Server-side code

### Environment for Production

Create `.env.production` with production values:

```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://akr-electronics.com"
DATABASE_URL="your-production-database-url"
SESSION_SECRET="your-production-secret-key"
# ... other production values
```

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Firebase Hosting deployment instructions.

---

## Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

#### 2. PostgreSQL Connection Error

Verify connection string in `.env.local`:

```bash
psql $DATABASE_URL
```

Should connect without errors.

#### 3. Prisma Client Generation Error

```bash
rm -rf node_modules/.prisma
npx prisma generate
```

#### 4. Firebase Credentials Invalid

1. Verify `.env.local` has correct Firebase config
2. Check Firebase credentials in Firebase Console
3. Ensure service account key is valid JSON

#### 5. Dependencies Installation Failed

```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 6. TypeScript Errors After Update

```bash
npm run type-check
# Resolve errors as shown
```

#### 7. Database Migration Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually reset
dropdb akr_electronics
createdb akr_electronics
npx prisma migrate dev
```

---

## Next Steps

After successful installation:

1. **Start Development Server**: `npm run dev`
2. **Access Dashboard**: Open `http://localhost:3000`
3. **Read Documentation**: Check [README.md](./README.md)
4. **Review Architecture**: See `.ai/architecture.md`
5. **Set Up Admin Account**: Create admin user through API
6. **Add Sample Data**: Use sample data scripts

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [README.md](./README.md)
3. Check project documentation in `.ai/` directory
4. Create an issue on GitHub

---

**Installation Guide Version**: 1.0.0  
**Last Updated**: 2026-06-29
