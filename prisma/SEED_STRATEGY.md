# A.K.R Electronics - Database Seeding Strategy

## Overview

Database seeding populates initial data for development, testing, and production initialization.

---

## Seeding Levels

### Level 1: Production Initialization
Minimal data for live system launch.

**Data to seed:**
- WebsiteSettings (store configuration)
- Initial Brands (3-5)
- Root Categories
- Homepage Configuration
- Admin User

### Level 2: Development
Realistic data for feature development.

**Includes Level 1 plus:**
- 50+ Products
- 10+ IoT Kits
- Test Users (customers)
- Sample Orders

### Level 3: Testing
Comprehensive data for QA.

**Includes Level 2 plus:**
- 100+ Products with variations
- Complex Category hierarchy
- Multiple Coupons (active, expired, exhausted)
- User with addresses and order history
- Inventory history data

### Level 4: Load Testing
Large datasets for performance testing.

**Includes Level 3 plus:**
- 10K+ Products
- 100K+ Orders
- 50K+ Users
- Large inventory history

---

## Seeding Structure

### File Organization

```
prisma/
├── seed.ts              # Main seed script
├── seeds/
│   ├── brands.ts
│   ├── categories.ts
│   ├── products.ts
│   ├── kits.ts
│   ├── users.ts
│   ├── homepage.ts
│   ├── settings.ts
│   └── coupons.ts
└── SEED_STRATEGY.md     # This file
```

### Seeding Order

```
1. WebsiteSettings          (Must be first)
2. Brands                   (No dependencies)
3. Categories               (Uses parentId for hierarchy)
4. Products                 (Uses categoryId, brandId)
5. ProductImages            (Uses productId)
6. IotKits                  (No dependencies)
7. KitProducts              (Uses kitId, productId)
8. HomepageConfiguration    (No dependencies)
9. Banners & Announcements  (No dependencies)
10. Admin User              (Creates first admin)
11. Test Users              (For development)
12. Addresses               (Uses userId)
13. Coupons                 (No dependencies)
14. Orders & OrderItems     (Uses userId, productId, couponId)
15. Reviews                 (Uses userId, productId)
16. InventoryHistory        (Uses productId)
17. WishlistItems           (Uses userId, productId)
```

---

## Implementation Examples

### Website Settings

```typescript
// prisma/seeds/settings.ts

export async function seedSettings(prisma: PrismaClient) {
  const settings = await prisma.websiteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'A.K.R Electronics',
      storeDescription: 'Premium IoT Components & Kits',
      phone: '+91-XXXX-XXXX-XX',
      email: 'support@akrelectronics.com',
      taxRate: new Decimal('18.00'),
      defaultShippingCost: new Decimal('50.00'),
      freeshippingThreshold: new Decimal('500.00'),
      primaryColor: '#0066FF',
      secondaryColor: '#FF6B35',
      accentColor: '#00D9FF',
      seoDefaultTitle: 'A.K.R Electronics - Premium IoT Solutions',
      seoDefaultDescription: 'Shop premium IoT components and kits',
      enableReviews: true,
      enableWishlist: true,
      enableNewsletter: true,
    },
  });

  return settings;
}
```

### Brands

```typescript
// prisma/seeds/brands.ts

const brandsData = [
  {
    name: 'Arduino',
    slug: 'arduino',
    description: 'Arduino is an open-source electronics platform',
  },
  {
    name: 'Raspberry Pi',
    slug: 'raspberry-pi',
    description: 'Raspberry Pi single-board computers',
  },
  {
    name: 'ESP32',
    slug: 'esp32',
    description: 'WiFi and Bluetooth microcontroller',
  },
];

export async function seedBrands(prisma: PrismaClient) {
  const brands = await Promise.all(
    brandsData.map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: brand,
        create: {
          ...brand,
          status: 'ACTIVE',
        },
      })
    )
  );

  return brands;
}
```

### Categories (Hierarchical)

```typescript
// prisma/seeds/categories.ts

const categoriesData = [
  {
    name: 'Microcontrollers',
    slug: 'microcontrollers',
    children: [
      { name: 'Arduino', slug: 'arduino' },
      { name: 'Raspberry Pi', slug: 'raspberry-pi' },
      { name: 'ESP32', slug: 'esp32' },
    ],
  },
  {
    name: 'Sensors',
    slug: 'sensors',
    children: [
      { name: 'Temperature', slug: 'temperature' },
      { name: 'Motion', slug: 'motion' },
      { name: 'Light', slug: 'light' },
    ],
  },
  {
    name: 'Components',
    slug: 'components',
    children: [
      { name: 'Resistors', slug: 'resistors' },
      { name: 'Capacitors', slug: 'capacitors' },
      { name: 'LEDs', slug: 'leds' },
    ],
  },
];

export async function seedCategories(prisma: PrismaClient) {
  for (const parentCat of categoriesData) {
    // Create parent category
    const parent = await prisma.category.upsert({
      where: { slug: parentCat.slug },
      update: {},
      create: {
        name: parentCat.name,
        slug: parentCat.slug,
        status: 'ACTIVE',
      },
    });

    // Create child categories
    if (parentCat.children) {
      await Promise.all(
        parentCat.children.map((child) =>
          prisma.category.upsert({
            where: { slug_parentId: { slug: child.slug, parentId: parent.id } },
            update: {},
            create: {
              name: child.name,
              slug: child.slug,
              parentId: parent.id,
              status: 'ACTIVE',
            },
          })
        )
      );
    }
  }
}
```

### Products

```typescript
// prisma/seeds/products.ts

const productsData = [
  {
    name: 'Arduino Uno R3',
    slug: 'arduino-uno-r3',
    sku: 'ARDUINO-UNO-R3-001',
    description: 'The Arduino Uno is a microcontroller board...',
    basePrice: new Decimal('450.00'),
    salePrice: new Decimal('399.00'),
    stock: 100,
    categorySlug: 'arduino',
    brandSlug: 'arduino',
  },
  {
    name: 'DHT22 Temperature Sensor',
    slug: 'dht22-temperature-sensor',
    sku: 'DHT22-TEMP-001',
    description: 'Digital temperature and humidity sensor...',
    basePrice: new Decimal('250.00'),
    stock: 50,
    categorySlug: 'temperature',
    brandSlug: null,
  },
];

export async function seedProducts(prisma: PrismaClient) {
  for (const product of productsData) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });

    const brand = product.brandSlug
      ? await prisma.brand.findUnique({
          where: { slug: product.brandSlug },
        })
      : null;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        categoryId: category!.id,
        brandId: brand?.id,
        status: 'ACTIVE',
        visibility: 'PUBLIC',
      },
    });
  }
}
```

### IoT Kits

```typescript
// prisma/seeds/kits.ts

const kitsData = [
  {
    name: 'Beginner Arduino Starter Kit',
    slug: 'beginner-arduino-kit',
    description: 'Everything you need to start with Arduino',
    basePrice: new Decimal('1500.00'),
    salePrice: new Decimal('1299.00'),
    products: [
      { productSlug: 'arduino-uno-r3', quantity: 1 },
      { productSlug: 'dht22-temperature-sensor', quantity: 1 },
    ],
  },
];

export async function seedKits(prisma: PrismaClient) {
  for (const kit of kitsData) {
    const createdKit = await prisma.iotKit.upsert({
      where: { slug: kit.slug },
      update: {},
      create: {
        name: kit.name,
        slug: kit.slug,
        description: kit.description,
        basePrice: kit.basePrice,
        salePrice: kit.salePrice,
        status: 'ACTIVE',
        visibility: 'PUBLIC',
      },
    });

    // Add products to kit
    for (const kitProduct of kit.products) {
      const product = await prisma.product.findUnique({
        where: { slug: kitProduct.productSlug },
      });

      await prisma.kitProduct.upsert({
        where: {
          kitId_productId: {
            kitId: createdKit.id,
            productId: product!.id,
          },
        },
        update: {},
        create: {
          kitId: createdKit.id,
          productId: product!.id,
          quantity: kitProduct.quantity,
        },
      });
    }
  }
}
```

### Admin User

```typescript
// prisma/seeds/users.ts

import bcrypt from 'bcrypt';

export async function seedAdminUser(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@akrelectronics.com' },
    update: {},
    create: {
      email: 'admin@akrelectronics.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log('✓ Admin user created:', admin.email);
  return admin;
}
```

### Homepage Configuration

```typescript
// prisma/seeds/homepage.ts

export async function seedHomepage(prisma: PrismaClient) {
  await prisma.homepageSection.upsert({
    where: { type: 'HERO_BANNER' },
    update: {},
    create: {
      type: 'HERO_BANNER',
      title: 'Welcome to A.K.R Electronics',
      subtitle: 'Premium IoT Components & Kits',
      displayOrder: 1,
      isVisible: true,
      content: {
        imageUrl: 'https://example.com/hero.jpg',
        linkUrl: '/shop',
        linkText: 'Shop Now',
      },
    },
  });

  await prisma.homepageSection.upsert({
    where: { type: 'FEATURED_PRODUCTS' },
    update: {},
    create: {
      type: 'FEATURED_PRODUCTS',
      title: 'Featured Products',
      displayOrder: 2,
      isVisible: true,
      content: {
        productCount: 6,
      },
    },
  });
}
```

### Main Seed Script

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as seeds from './seeds';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    console.log('📝 Seeding website settings...');
    await seeds.seedSettings(prisma);

    console.log('🏷️  Seeding brands...');
    await seeds.seedBrands(prisma);

    console.log('📂 Seeding categories...');
    await seeds.seedCategories(prisma);

    console.log('🛍️  Seeding products...');
    await seeds.seedProducts(prisma);

    console.log('📦 Seeding IoT kits...');
    await seeds.seedKits(prisma);

    console.log('🏠 Seeding homepage...');
    await seeds.seedHomepage(prisma);

    console.log('👤 Seeding admin user...');
    await seeds.seedAdminUser(prisma);

    console.log('\n✨ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

### Package.json Script

```json
{
  "scripts": {
    "db:seed": "ts-node prisma/seed.ts",
    "db:push": "prisma db push",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  }
}
```

---

## Running Seeds

### Development Setup

```bash
# Initialize database
npx prisma migrate dev --name init

# Seed with initial data
npm run db:seed

# Or reset (deletes all data, reapplies migrations, runs seed)
npm run db:reset
```

### Production Setup

```bash
# Apply migrations only (no seed)
npx prisma migrate deploy

# If production seeding needed:
npm run db:seed -- --production
```

---

## Best Practices

1. **Idempotent Seeding**: Use `upsert` to handle re-running seeds
2. **Seed Order Matters**: Dependencies must be seeded first
3. **Use Transactions**: Wrap related operations
4. **Add Logging**: Show progress of seeding
5. **Separate by Level**: Create seeds for dev, test, production
6. **Use Realistic Data**: Make development data resemble production
7. **Hash Passwords**: Never store plain text passwords

---

## Seed Levels Usage

```bash
# Development (full data)
npm run db:seed

# Production (minimal)
npm run db:seed -- --level=1

# Testing (comprehensive)
npm run db:seed -- --level=3

# Load testing (large)
npm run db:seed -- --level=4
```

---

## Cleanup

### Clear All Data

```typescript
// prisma/cleanup.ts

export async function cleanupDatabase(prisma: PrismaClient) {
  // Delete in reverse order of dependencies
  await prisma.auditLog.deleteMany({});
  await prisma.inventoryHistory.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.userCouponUsage.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.kitProduct.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.iotKit.deleteMany({});
  await prisma.kitImage.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.homepageSection.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.websiteSettings.deleteMany({});

  console.log('✓ Database cleaned');
}
```

---

## Conclusion

A well-structured seed strategy:
- ✓ Enables rapid development
- ✓ Provides realistic test data
- ✓ Simplifies setup
- ✓ Ensures consistency
- ✓ Supports different environments

**Always use idempotent operations to safely re-seed.**
