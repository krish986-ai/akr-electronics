# A.K.R Electronics - Migration Strategy & Guide

## Overview

This document outlines the migration strategy for setting up and maintaining the A.K.R Electronics database.

---

## Initial Setup (One-time)

### Prerequisites
- PostgreSQL 14+ installed and running
- Node.js 18+ with npm

### Step 1: Create Database
```bash
# Linux/Mac
createdb akr_electronics

# Or via psql
psql -U postgres -c "CREATE DATABASE akr_electronics;"
```

### Step 2: Configure Environment
Create `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/akr_electronics"
```

### Step 3: Initialize Prisma
```bash
# Create migration from schema
npx prisma migrate dev --name init

# This will:
# 1. Create all tables
# 2. Create all indexes
# 3. Create all constraints
# 4. Generate Prisma Client
```

### Step 4: Verify Setup
```bash
# Connect to database
npx prisma studio

# Or check with psql
psql akr_electronics -c "\dt"  # List tables
```

---

## Migration Workflow

### Adding a New Field

```bash
# 1. Update schema.prisma
# Add new field to model

# 2. Create migration
npx prisma migrate dev --name add_field_name

# 3. Review generated migration file
# Located in: prisma/migrations/[timestamp]_add_field_name/migration.sql

# 4. Deploy to production
npx prisma migrate deploy
```

### Modifying a Relationship

```bash
# 1. Update relation in schema.prisma

# 2. Create migration
npx prisma migrate dev --name update_relationship_name

# 3. Prisma handles the migration

# 4. Regenerate Prisma Client
npx prisma generate
```

### Adding a New Table

```bash
# 1. Add model to schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_model_name

# 3. Verify migration
npx prisma db push

# 4. Regenerate client
npx prisma generate
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations created and tested locally
- [ ] Database backup created
- [ ] Migration rollback plan documented
- [ ] Team notified
- [ ] Maintenance window scheduled (if needed)

### Deployment Steps

```bash
# 1. Run pending migrations
npx prisma migrate deploy

# 2. Verify migration status
npx prisma migrate status

# 3. Check data integrity
npx prisma db validate

# 4. Update application code (if needed)
npm run build
npm run start
```

### Rollback Procedure

If migration fails:

```bash
# 1. Check migration status
npx prisma migrate status

# 2. Resolve issue (fix in migration file or code)

# 3. If migration file incorrect:
#    - Update prisma/migrations/[timestamp]_name/migration.sql
#    - Run: npx prisma migrate deploy

# 4. If schema change needed:
#    - Update schema.prisma
#    - Run: npx prisma migrate dev --name fix_name
```

---

## Common Migrations

### 1. Adding Audit Logging to Existing Table

```prisma
// Before
model Product {
  id String @id @default(cuid())
  name String
  // ...
}

// After
model Product {
  id String @id @default(cuid())
  name String
  // ...
  createdBy String?
  updatedBy String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Making Field Optional

```prisma
// Before
model Product {
  sku String
}

// After
model Product {
  sku String?
}
```

### 3. Adding Soft Delete

```prisma
// Before
model Product {
  id String @id @default(cuid())
  name String
}

// After
model Product {
  id String @id @default(cuid())
  name String
  isDeleted Boolean @default(false)
  deletedAt DateTime?
}
```

### 4. Adding Index for Performance

```prisma
// Before
model Product {
  id String @id @default(cuid())
  categoryId String
  category Category @relation(fields: [categoryId], references: [id])
}

// After
model Product {
  id String @id @default(cuid())
  categoryId String
  category Category @relation(fields: [categoryId], references: [id])
  
  @@index([categoryId])
}
```

---

## Data Migration Examples

### Example 1: Migrate Product Prices to Decimal

**Scenario**: Prices stored as Float, need Decimal for accuracy

```typescript
// Migration script (prisma/migrations/add_decimal_prices/script.ts)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    // Get all products
    const products = await prisma.product.findMany();
    
    // Update with rounded prices
    for (const product of products) {
      const basePrice = parseFloat(product.basePrice.toString());
      const salePrice = product.salePrice ? parseFloat(product.salePrice.toString()) : null;
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: new Decimal(basePrice),
          salePrice: salePrice ? new Decimal(salePrice) : null,
        },
      });
    }
    
    console.log('Price migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

### Example 2: Populate Slugs for Existing Products

```typescript
import slug from 'slug';

async function migrateProductSlugs() {
  const products = await prisma.product.findMany();
  
  for (const product of products) {
    const newSlug = slug(product.name, { lower: true });
    
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: newSlug },
    });
  }
}
```

---

## Backup & Recovery

### Backup Database

```bash
# Create backup
pg_dump akr_electronics > backup.sql

# Or with compression
pg_dump akr_electronics | gzip > backup.sql.gz
```

### Restore Database

```bash
# From backup
psql akr_electronics < backup.sql

# Or from compressed
gunzip -c backup.sql.gz | psql akr_electronics
```

### Automated Backups

```bash
# Cron job for daily backups (Linux/Mac)
0 2 * * * pg_dump akr_electronics | gzip > ~/backups/akr_$(date +\%Y\%m\%d).sql.gz
```

---

## Version Control

### Track Migrations in Git

```bash
# Migrations are in: prisma/migrations/
# All migration files are tracked in git

git add prisma/migrations/
git commit -m "Add migration: describe change"
```

### Team Workflow

```
1. Developer updates schema.prisma
2. Developer runs: npx prisma migrate dev --name change_name
3. Migration file auto-created in prisma/migrations/
4. Developer commits schema.prisma + migration files
5. Other developers pull and run: npx prisma migrate dev
   (This applies pending migrations and generates client)
```

---

## Monitoring Migrations

### Check Pending Migrations

```bash
npx prisma migrate status
```

### Validate Schema

```bash
npx prisma db validate
```

### View Migration History

```bash
# In Prisma Studio
npx prisma studio
# Then check _prisma_migrations table

# Or in psql
psql akr_electronics -c "SELECT * FROM \"_prisma_migrations\";"
```

---

## Troubleshooting

### Migration Failed

```bash
# 1. Check what went wrong
npx prisma migrate status

# 2. Fix schema or migration file

# 3. If migration file needs edit:
#    - Edit: prisma/migrations/[timestamp]_name/migration.sql
#    - Run: npx prisma migrate deploy --skip-generate

# 4. Regenerate client
npx prisma generate
```

### Cannot Connect to Database

```bash
# 1. Verify database exists
psql -U postgres -l | grep akr_electronics

# 2. Verify DATABASE_URL in .env.local

# 3. Verify PostgreSQL is running
pg_isready -h localhost -p 5432

# 4. Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Foreign Key Constraint Error

```bash
# Ensure referenced record exists before inserting

# Check existing constraints
psql akr_electronics -c "\d product"  # Shows table structure

# Disable constraint temporarily (not recommended)
ALTER TABLE product DISABLE TRIGGER ALL;
# ... insert data ...
ALTER TABLE product ENABLE TRIGGER ALL;
```

---

## Best Practices

1. **Always backup before migrations**
   ```bash
   pg_dump akr_electronics > backup.sql
   ```

2. **Test migrations locally first**
   - Run on dev database
   - Verify data integrity
   - Check performance

3. **Create separate migrations for each change**
   - One file per logical change
   - Easier to revert specific changes
   - Better git history

4. **Document complex migrations**
   - Add comments in migration files
   - Include rollback instructions
   - Explain why the migration was needed

5. **Use transactions for data migrations**
   ```typescript
   const result = await prisma.$transaction(async (tx) => {
     // All operations succeed or all fail
     await tx.product.update(...);
     await tx.order.update(...);
   });
   ```

6. **Monitor migration impact**
   - Check query performance after
   - Monitor database size
   - Check index usage

---

## Production Considerations

### Downtime Minimization

- Use `NOT NULL DEFAULT` for new fields
- Add indexes after data migration (if large table)
- Test on production backup first

### Zero-Downtime Deployments

1. Add new column (nullable)
2. Deploy code to populate/use column
3. Remove old code references
4. Drop old column (in future release)

### Connection Pooling

With Prisma and Render PostgreSQL:
```bash
# Use connection pooling
DATABASE_URL="postgresql://user:pass@host/db?schema=public"
```

---

## Conclusion

This migration strategy ensures:
- ✓ Data integrity
- ✓ Zero data loss
- ✓ Easy rollback
- ✓ Team collaboration
- ✓ Production safety

**Always backup before migrating.**
