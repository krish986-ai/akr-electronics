# A.K.R Electronics - Deployment Guide

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2026-06-29

---

## Overview

A.K.R Electronics is optimized for deployment on Firebase Hosting with Firebase Authentication and Firestore (or PostgreSQL backend). This guide covers production deployment steps.

---

## Pre-Deployment Checklist

- [ ] All environment variables configured in `.env.production`
- [ ] Database migrations completed
- [ ] Firebase project created and configured
- [ ] Admin user account created
- [ ] Build passes all tests and linting (`npm run build`)
- [ ] TypeScript compilation without errors (`npm run type-check`)
- [ ] Sample data loaded (if needed)
- [ ] Firebase security rules configured
- [ ] CORS settings configured
- [ ] CDN/Caching strategy planned

---

## Firebase Hosting Deployment

### Prerequisites

1. **Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Account**: Create account at https://firebase.google.com

3. **Firebase Project**: Create project in Firebase Console

### Step 1: Initialize Firebase

```bash
firebase login
firebase init hosting
```

When prompted:
- Select your Firebase project
- Set public directory to: `.next`
- Configure as SPA: Select "No"
- Set GitHub deploys: Optional

### Step 2: Configure Production Environment

Create `.env.production.local`:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=your-production-database-url
FIREBASE_ADMIN_PRIVATE_KEY=your-firebase-private-key
# ... other production variables
```

### Step 3: Build for Production

```bash
npm run build
```

Ensure no errors in output.

### Step 4: Deploy

```bash
firebase deploy
```

Or with specific targets:

```bash
firebase deploy --only hosting
```

### Step 5: Verify Deployment

1. Check Firebase Console for deployment status
2. Visit your live URL
3. Test core functionality
4. Monitor error logs

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://user:password@postgres:5432/akr
      FIREBASE_ADMIN_PROJECT_ID: your-project
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: akr
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Build and Run

```bash
docker-compose up -d
```

---

## Environment Variables for Production

### Database

```env
# PostgreSQL (with connection pooling recommended)
DATABASE_URL="postgresql://user:password@prod-db.example.com:5432/akr_electronics?pool=10"
```

### Firebase

```env
FIREBASE_ADMIN_PROJECT_ID=your-production-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

### Security

```env
SESSION_SECRET=your-secure-random-key-min-32-chars
SESSION_EXPIRY_MS=2592000000
```

### Application

```env
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=A.K.R Electronics
NEXT_PUBLIC_APP_URL=https://akr-electronics.com
ADMIN_EMAIL=admin@akr-electronics.com
```

---

## Firestore Security Rules

Create/update `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - Only own documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if hasRole('ADMIN');
    }

    // Products - Public read, Admin write
    match /products/{productId} {
      allow read: if resource.data.visibility == 'PUBLIC';
      allow write: if hasRole('ADMIN');
    }

    // Orders - User owns or Admin
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId || hasRole('ADMIN');
      allow create: if request.auth != null;
    }

    // Helper function
    function hasRole(role) {
      return request.auth != null && 
             request.auth.token.customClaims.role == role;
    }
  }
}
```

Deploy rules:

```bash
firebase deploy --only firestore:rules
```

---

## Performance Optimization

### Image Optimization

- Use Next.js Image component for automatic optimization
- Configure image domains in `next.config.ts`
- Use WebP format with fallbacks

### Caching Strategy

```typescript
// In next.config.ts
headers: async () => {
  return [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600' },
      ],
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ];
}
```

### Database Optimization

- Enable query indexing in PostgreSQL
- Use connection pooling
- Implement caching layer (Redis)
- Regular VACUUM and ANALYZE

---

## Monitoring & Logging

### Firebase Console

Monitor in Firebase Console:
- Cloud Functions logs
- Authentication metrics
- Firestore usage
- Performance monitoring

### Application Logging

Implement logging:

```typescript
// Example: Log important events
async function logEvent(event: string, data: any) {
  console.log(`[${new Date().toISOString()}] ${event}`, data);
  // Send to logging service (Sentry, LogRocket, etc.)
}
```

### Error Tracking

Set up error tracking:

```typescript
// Example with Sentry
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## SSL/HTTPS

- Firebase Hosting provides automatic SSL
- Custom domains configured in Firebase Console
- DNS records point to Firebase servers

### Custom Domain Setup

1. In Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps
4. Configure DNS records as shown
5. Automatic SSL provisioning (typically within 24 hours)

---

## Backup & Recovery

### Database Backups

#### PostgreSQL

```bash
# Full backup
pg_dump dbname > backup.sql

# Restore
psql dbname < backup.sql

# Automated backup (cron)
0 2 * * * pg_dump mydb > /backups/$(date +\%Y-\%m-\%d).sql
```

#### Firestore

- Enable automatic backups in Firebase Console
- Configure retention policy
- Test restore procedures

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        run: npx firebase-tools deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Rollback Procedure

### Firebase Hosting

1. In Firebase Console → Hosting
2. Click "Deployments" tab
3. Select previous version
4. Click "Promote to Live"

### Database

For failed migrations:

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    firebase: await checkFirebase(),
    timestamp: new Date().toISOString(),
  };

  return Response.json(checks);
}
```

Monitor with:
```bash
curl https://your-domain.com/api/health
```

---

## Troubleshooting

### Deployment Issues

**Firebase Login Required**:
```bash
firebase logout
firebase login
```

**Build Failures**:
```bash
npm cache clean --force
rm -rf node_modules .next
npm install
npm run build
```

**Firebase Deploy Errors**:
```bash
firebase deploy --debug
# Check detailed error messages
```

---

## Scaling Considerations

- **Database**: Use connection pooling
- **Storage**: Configure CDN
- **API**: Implement rate limiting
- **Frontend**: Use code splitting and lazy loading
- **Caching**: Redis for frequently accessed data

---

## Support

For deployment issues:
1. Check Firebase Console logs
2. Review `INSTALLATION.md`
3. Check deployment script output
4. Enable debug logging with `--debug` flag

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: 2026-06-29
