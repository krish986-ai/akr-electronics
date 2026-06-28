# FIRESTORE ARCHITECTURE DESIGN

**Status**: Design Phase (Not Implemented)  
**Target Implementation**: Phase 9.1  
**Architecture Pattern**: Collection per Entity + Sub-collections for Relations

---

## CORE PRINCIPLES

1. **Compatibility**: Firestore documents map 1:1 to Prisma models
2. **Query Efficiency**: Indexes for all filtering/sorting operations
3. **Security**: Collection-level and document-level access controls
4. **Consistency**: Denormalization where queries require it
5. **Scalability**: Sharding strategies for high-volume collections

---

## FIRESTORE COLLECTIONS DESIGN

### ROOT COLLECTIONS (Top-Level)

#### 1. `users` Collection
**Firestore**: Collection at `users/{userId}`

```firestore
Document Fields:
  id: string (document ID = Firebase UID)
  email: string @unique
  name: string
  phone: string | null
  image: string | null
  role: 'ADMIN' | 'CUSTOMER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'
  emailVerified: boolean
  verifiedAt: timestamp | null
  lastLoginAt: timestamp | null
  loginCount: number
  failedLoginAttempts: number
  lastFailedLoginAt: timestamp | null
  isDeleted: boolean
  deletedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp

Indexes Required:
  - email (for unique lookup)
  - role (for admin queries)
  - status (for user lists)
  - isDeleted (for soft deletes)
  - createdAt (for sorting)

Sub-collections:
  - orders (user's orders)
  - addresses (user's addresses)
  - cart (user's shopping cart)
  - wishlist (user's wishlist)
  - reviews (user's reviews)
```

#### 2. `products` Collection
**Firestore**: Collection at `products/{productId}`

```firestore
Document Fields:
  id: string (document ID)
  name: string
  slug: string @unique
  sku: string @unique
  description: string
  shortDescription: string | null
  thumbnailImage: string | null
  basePrice: decimal (use string for precision)
  salePrice: decimal | null
  discountPercent: number | null
  stock: number
  reservedStock: number
  lowStockLimit: number
  weight: decimal | null
  dimensions: { length, width, height, unit } | null
  specifications: { key: string } | null
  categoryId: string (reference to categories)
  brandId: string | null (reference to brands)
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK'
  isFeatured: boolean
  isNewArrival: boolean
  isBestseller: boolean
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'DRAFT'
  displayOrder: number
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  viewCount: number
  isDeleted: boolean
  deletedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp

Indexes Required:
  - slug
  - sku
  - categoryId + createdAt
  - brandId + createdAt
  - status + createdAt
  - isFeatured + createdAt
  - visibility + createdAt
  - isDeleted
  - basePrice (for range queries)

Sub-collections:
  - images (product images)
  - reviews (product reviews)
  - inventoryHistory (stock tracking)
```

#### 3. `categories` Collection
**Firestore**: Collection at `categories/{categoryId}`

```firestore
Document Fields:
  id: string
  name: string
  slug: string @unique
  description: string | null
  image: string | null
  icon: string | null
  parentId: string | null (reference to parent category)
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  isFeatured: boolean
  displayOrder: number
  isDeleted: boolean
  deletedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp

Indexes:
  - slug
  - parentId + displayOrder
  - status + displayOrder
  - isFeatured + displayOrder
  - isDeleted
```

#### 4. `brands` Collection
**Firestore**: Collection at `brands/{brandId}`

```firestore
Document Fields:
  id: string
  name: string
  slug: string @unique
  logo: string | null
  description: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
  isFeatured: boolean
  isDeleted: boolean
  deletedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp

Indexes:
  - slug
  - status
  - isFeatured
```

#### 5. `iotKits` Collection
**Firestore**: Collection at `iotKits/{kitId}`

```firestore
Document Fields:
  id: string
  name: string
  slug: string @unique
  description: string
  shortDescription: string | null
  thumbnailImage: string | null
  basePrice: decimal (string)
  salePrice: decimal | null
  discountPercent: number | null
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  isFeatured: boolean
  visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'DRAFT'
  displayOrder: number
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  viewCount: number
  isDeleted: boolean
  deletedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp

Sub-collections:
  - components (kit products with quantities)
  - images (kit images)
```

#### 6. `orders` Collection
**Firestore**: Collection at `orders/{orderId}`

```firestore
Document Fields:
  id: string
  orderNumber: string @unique
  userId: string (reference to users)
  shippingAddressId: string | null
  billingAddressId: string | null
  orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  shippingStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  paymentMethod: string | null
  paymentId: string | null
  transactionId: string | null
  subtotal: decimal (string)
  tax: decimal (string)
  shippingCost: decimal (string)
  total: decimal (string) [computed: subtotal + tax + shippingCost]
  notes: string | null
  createdAt: timestamp
  updatedAt: timestamp

Indexes:
  - userId + createdAt (for user's orders)
  - orderStatus + createdAt
  - paymentStatus + createdAt
  - createdAt (for recent orders)
  - orderNumber (for lookup)

Sub-collections:
  - items (order line items)
```

#### 7. `carts` Collection
**Firestore**: Collection at `carts/{userId}` (userId as document ID)

```firestore
Document Fields:
  userId: string (document ID = user's ID)
  createdAt: timestamp
  updatedAt: timestamp

Sub-collections:
  - items (cart line items)
```

#### 8. `addresses` Collection
**Firestore**: Sub-collection at `users/{userId}/addresses/{addressId}`

```firestore
Document Fields:
  id: string (document ID)
  name: string
  phone: string
  email: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  type: 'HOME' | 'OFFICE' | 'OTHER'
  isDefault: boolean
  createdAt: timestamp
  updatedAt: timestamp
```

#### 9. `wishlist` Collection
**Firestore**: Sub-collection at `users/{userId}/wishlist/{itemId}`

```firestore
Document Fields:
  id: string
  productId: string | null (reference to products)
  kitId: string | null (reference to iotKits)
  priority: number
  createdAt: timestamp

Constraint: Either productId OR kitId must be set (not both null)
```

#### 10. `reviews` Collection
**Firestore**: Sub-collection at `products/{productId}/reviews/{reviewId}`

```firestore
Document Fields:
  id: string
  userId: string (reference to users)
  productId: string (reference via path)
  rating: number (1-5)
  title: string | null
  content: string | null
  helpful: number
  unhelpful: number
  isVerifiedPurchase: boolean
  createdAt: timestamp
  updatedAt: timestamp
```

#### 11. `inventoryHistory` Collection
**Firestore**: Sub-collection at `products/{productId}/inventoryHistory/{historyId}`

```firestore
Document Fields:
  id: string
  productId: string (reference via path)
  quantityChange: number (can be negative)
  previousStock: number
  newStock: number
  reason: 'INITIAL_STOCK' | 'PURCHASE' | 'RETURN' | 'DAMAGE' | 'LOST' | 'ADJUSTMENT' | 'KIT_ASSEMBLY' | 'KIT_DISASSEMBLY' | 'PROMOTION' | 'CORRECTION'
  notes: string | null
  orderId: string | null
  referenceId: string | null
  createdAt: timestamp
```

#### 12. Additional Collections (As Needed)

**coupons**:
```firestore
- id, code, discountType, value, minAmount
- expiryDate, usageLimit, usedCount, status
- createdAt, updatedAt
```

**shipping**:
```firestore
- id, zone, baseCost, deliveryDays, isActive
```

**website_config**:
```firestore
- siteName, logo, favicon, currency, taxRate
- maintenanceMode, createdAt, updatedAt
```

---

## FIRESTORE SECURITY RULES

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /products/{productId} {
      allow read: if resource.data.visibility == 'PUBLIC' && !resource.data.isDeleted;
      allow write: if request.auth.token.isAdmin == true;
      
      match /images/{imageId} {
        allow read: if get(/databases/$(database)/documents/products/$(productId)).data.visibility == 'PUBLIC';
        allow write: if request.auth.token.isAdmin == true;
      }
      
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth.uid != null;
        allow update, delete: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin == true;
      }
      
      match /inventoryHistory/{historyId} {
        allow read: if request.auth.token.isAdmin == true;
        allow write: if request.auth.token.isAdmin == true;
      }
    }

    // User data - own data or admin
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.token.isAdmin == true;
      allow write: if request.auth.uid == userId || request.auth.token.isAdmin == true;
      
      match /addresses/{addressId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /cart/{cartId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /wishlist/{itemId} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /orders/{orderId} {
        allow read: if request.auth.uid == userId || request.auth.token.isAdmin == true;
        allow write: if request.auth.token.isAdmin == true;
        
        match /items/{itemId} {
          allow read: if request.auth.uid == userId || request.auth.token.isAdmin == true;
        }
      }
    }

    // Categories, brands - public read, admin write
    match /categories/{categoryId} {
      allow read: if !resource.data.isDeleted;
      allow write: if request.auth.token.isAdmin == true;
    }

    match /brands/{brandId} {
      allow read: if !resource.data.isDeleted;
      allow write: if request.auth.token.isAdmin == true;
    }

    // Orders - user's own or admin
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin == true;
      allow write: if request.auth.token.isAdmin == true;
    }

    // Admin only
    match /coupons/{couponId} {
      allow read, write: if request.auth.token.isAdmin == true;
    }

    match /shipping/{shippingId} {
      allow read: if true; // Public shipping rates
      allow write: if request.auth.token.isAdmin == true;
    }

    match /website_config/{configId} {
      allow read: if true;
      allow write: if request.auth.token.isAdmin == true;
    }
  }
}
```

---

## CONVERSION CONVERTERS

Each service will include converters to transform Firestore documents to/from TypeScript types:

```typescript
// Example: ProductConverter
class ProductConverter {
  toFirestore(product: Product): DocumentData {
    return {
      ...product,
      basePrice: product.basePrice.toString(), // Decimal → string
      salePrice: product.salePrice?.toString() || null,
      updatedAt: FieldValue.serverTimestamp()
    };
  }

  fromFirestore(doc: DocumentSnapshot): Product {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      basePrice: new Decimal(data.basePrice),
      salePrice: data.salePrice ? new Decimal(data.salePrice) : null,
    } as Product;
  }
}
```

---

## INDEXES REQUIRED

Firestore will need composite indexes for:

1. **Product queries**:
   - `categoryId + createdAt DESC`
   - `status + createdAt DESC`
   - `basePrice ASC/DESC + createdAt DESC`
   - `isFeatured + createdAt DESC`

2. **User queries**:
   - `role + createdAt DESC`
   - `status + createdAt DESC`

3. **Order queries**:
   - `userId + createdAt DESC`
   - `paymentStatus + createdAt DESC`
   - `orderStatus + createdAt DESC`

4. **Category queries**:
   - `parentId + displayOrder ASC`
   - `status + displayOrder ASC`

Firestore will auto-suggest these when queries are attempted.

---

## PAGINATION & QUERYING STRATEGY

### Offset-based Pagination
```typescript
// First page
query(products).where('status', '==', 'ACTIVE').orderBy('createdAt', 'desc').limit(20)

// Next pages
query(products).where('status', '==', 'ACTIVE')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20)
```

### Full-Text Search
Firestore doesn't have built-in full-text search. Strategy:
- Use Algolia or Elasticsearch for search (free tier available)
- OR implement denormalization + filtering
- OR implement search via Cloud Functions

**Recommendation**: Implement simple substring matching initially, upgrade to Algolia if needed.

---

## TRANSACTION STRATEGY

For multi-document operations:

```typescript
// Example: Create order (atomic transaction)
const batch = writeBatch(db);

// Deduct inventory
const productRef = doc(db, 'products', productId);
batch.update(productRef, { stock: increment(-quantity) });

// Create order
const orderRef = doc(collection(db, 'orders'));
batch.set(orderRef, orderData);

// Create order items
orderItems.forEach(item => {
  const itemRef = doc(collection(orderRef, 'items'));
  batch.set(itemRef, item);
});

await batch.commit();
```

---

## FIRESTORE EMULATOR (Development)

For local development:

```bash
firebase emulators:start --only firestore,auth
```

Services will auto-detect emulator and use local Firestore during development.

---

## MIGRATION MAPPING

| Prisma Model | Firestore Collection | Notes |
|---|---|---|
| User | users/{id} | Firebase Auth handles auth fields |
| Session | (Firebase Auth) | Removed - use Firebase sessions |
| PasswordReset | (Firebase Auth) | Removed - use Firebase reset |
| Product | products/{id} | 1:1 mapping |
| ProductImage | products/{id}/images/{id} | Sub-collection |
| Category | categories/{id} | 1:1 mapping |
| Brand | brands/{id} | 1:1 mapping |
| IotKit | iotKits/{id} | 1:1 mapping |
| KitImage | iotKits/{id}/images/{id} | Sub-collection |
| KitProduct | iotKits/{id}/components/{id} | Sub-collection |
| Cart | carts/{userId} | Document ID = userID |
| CartItem | carts/{userId}/items/{id} | Sub-collection |
| Order | orders/{id} | 1:1 mapping |
| OrderItem | orders/{id}/items/{id} | Sub-collection |
| Address | users/{userId}/addresses/{id} | Sub-collection |
| WishlistItem | users/{userId}/wishlist/{id} | Sub-collection |
| Review | products/{id}/reviews/{id} | Sub-collection |
| InventoryHistory | products/{id}/inventoryHistory/{id} | Sub-collection |
| Others | Respective collections | Coupons, shipping, config |

---

## NEXT STEPS

1. ✅ **Audit Complete** (Current step)
2. 🔄 **Design Complete** (Current step)
3. ⏳ **Firebase Setup** (Phase 9.1.1)
4. ⏳ **Service Migration** (Phase 9.1.2-9)
5. ⏳ **API Updates** (Phase 9.1.10)
6. ⏳ **Testing & Verification** (Phase 9.1.11)

---

**Status**: Architecture design complete - Awaiting approval to proceed with Firebase Setup and Service Migration
