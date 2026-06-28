# A.K.R Electronics - Database Design (Phase 2)

## Database Engine

**PostgreSQL 14+** - Production grade, free, open-source
- Free and open-source
- Robust with ACID compliance
- Excellent for relational data
- JSON support for flexible fields
- Full-text search ready

## Schema Overview

**Schema Version**: 2.0 (Phase 2 - Production Grade)  
**Total Models**: 30  
**Total Enums**: 11  
**Total Foreign Keys**: 40+  
**Total Indexes**: 80+

### Comprehensive Model List

#### 1. User Management (1 model)
- User (with comprehensive fields, soft delete, role-based access)

#### 2. Products & Catalog (8 models)
- Brand, Category, Product, ProductImage
- IotKit, KitImage, KitProduct

#### 3. Inventory (1 model)
- InventoryHistory (complete audit trail)

#### 4. Shopping & Orders (5 models)
- Cart, CartItem, Order, OrderItem, WishlistItem

#### 5. Addresses (1 model)
- Address (multiple types, soft delete)

#### 6. Discounts (2 models)
- Coupon, UserCouponUsage

#### 7. Reviews (1 model)
- Review (with moderation)

#### 8. Website Configuration (3 models)
- WebsiteSettings, HomepageSection, Banner, Announcement

#### 9. Audit (1 model)
- AuditLog (compliance tracking)

---

## Detailed Model Descriptions

### User
Stores customer and admin users with comprehensive fields.

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String
  image     String?
  role      UserRole   @default(CUSTOMER)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

enum UserRole {
  ADMIN
  CUSTOMER
}
```

**Indexes**:
- PK: id
- UK: email
- Index: role (for admin queries)

#### Product
IoT components and kits.

```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  description   String
  price         Float
  stock         Int
  categoryId    String
  image         String?
  images        String[]
  specification Json?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Indexes**:
- PK: id
- FK: categoryId
- Index: isActive (for active products queries)
- Fulltext: name, description

**Notes**:
- `specification` stores JSON for flexibility
- `images` array for multiple product photos
- `isActive` for soft deletes

#### Category
Product categories.

```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  image       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Indexes**:
- PK: id
- UK: name

#### Cart & CartItem
Shopping cart.

```prisma
model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String   @id @default(cuid())
  cartId    String
  productId String
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, productId])
}
```

**Indexes**:
- PK: id
- UK: userId (one cart per user)
- Composite UK: cartId + productId

#### Order & OrderItem
Customer orders.

```prisma
model Order {
  id              String       @id @default(cuid())
  orderNumber     String       @unique
  userId          String
  items           OrderItem[]
  status          OrderStatus  @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  subtotal        Float
  tax             Float
  shipping        Float
  total           Float
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float   // Price at time of order
}

enum OrderStatus {
  PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
}

enum PaymentStatus {
  PENDING, COMPLETED, FAILED, REFUNDED
}
```

**Indexes**:
- PK: id
- UK: orderNumber
- FK: userId, orderId, productId
- Composite: userId + status (for user's orders by status)
- Index: createdAt (for date range queries)

#### Address
Shipping and billing addresses.

```prisma
model Address {
  id        String   @id @default(cuid())
  userId    String
  type      AddressType
  fullName  String
  phone     String
  email     String
  street    String
  city      String
  state     String
  zipCode   String
  country   String
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AddressType {
  SHIPPING, BILLING, BOTH
}
```

**Indexes**:
- PK: id
- FK: userId
- Index: type (for filtering by type)
- Index: isDefault (for finding default address)

#### WishlistItem
Saved products for later.

```prisma
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}
```

**Indexes**:
- PK: id
- Composite UK: userId + productId

#### Review
Product reviews and ratings.

```prisma
model Review {
  id        String   @id @default(cuid())
  productId String
  rating    Int      // 1-5
  title     String
  content   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Indexes**:
- PK: id
- FK: productId
- Index: rating (for sorting by rating)

## Indexing Strategy

### High-Priority Indexes
- Foreign keys (automatic in Prisma)
- Unique constraints
- Frequently searched fields (userId, email, orderNumber)
- Date ranges (createdAt for recent queries)

### Query-Specific Indexes
- Product: categoryId (for browsing by category)
- Order: userId + status (user's orders in specific status)
- Address: userId + isDefault (find user's default address)

### Composite Indexes
```sql
-- For user's orders by status
CREATE INDEX idx_order_user_status ON "Order"(userId, status);

-- For product reviews and ratings
CREATE INDEX idx_review_product_rating ON "Review"(productId, rating DESC);
```

## Data Integrity

### Relationships
- User → Order (1:N)
- User → Cart (1:1)
- User → Address (1:N)
- Order → OrderItem (1:N)
- Product → OrderItem (1:N)
- Product → CartItem (1:N)
- Category → Product (1:N)

### Cascading Deletes
- Delete user → delete orders, cart, addresses
- Delete order → delete order items
- Delete product → delete cart items, order items

### Constraints
- Email unique across system
- Order number unique
- One cart per user
- One default address preference per user
- Product stock >= 0

## Data Types

### Identifiers
- `String @id @default(cuid())` for distributed IDs
- `String @unique` for business keys

### Monetary Values
- `Float` for price, total (typically use Decimal for production)
- Note: Switch to Decimal in Phase 2 for accuracy

### Timestamps
- `DateTime @default(now())` for createdAt
- `DateTime @updatedAt` for updatedAt

### Complex Data
- `Json` for flexible fields (specifications)
- `String[]` for arrays (images)

## Migration Strategy

### Development
```bash
npx prisma migrate dev --name add_model_name
```

### Production
```bash
npx prisma migrate deploy
```

## Backup Strategy

### PostgreSQL Backups
- Regular automated backups (Phase 2)
- Point-in-time recovery capability
- Off-site backup storage

### Disaster Recovery
- Backup retention: 30 days minimum
- RTO: 1 hour
- RPO: 15 minutes

## Performance Optimization

### Query Optimization
- Eager load relationships in Prisma
- Pagination for large result sets
- Select specific fields when possible

### Connection Pooling
- PgBouncer ready for Phase 2
- Maximum connections: 100 (development) → 1000 (production)

### Caching
- Redis integration ready for Phase 2
- Cache frequently accessed data (categories, featured products)

## Monitoring

### Metrics
- Query performance (slow query log)
- Connection pool usage
- Disk space usage

### Tools
- Prisma Studio for development
- PostgreSQL pg_stat_statements for query analysis

---

**Schema Version**: 1.0
**Last Updated**: Phase 0 Initialization
**Status**: Ready for implementation
