# FIRESTORE MIGRATION PLAN

**Status**: Awaiting Approval  
**Target**: Phase 9.1  
**Estimated Duration**: 40-50 hours  
**Risk Level**: Low (Isolated persistence layer)  

---

## EXECUTIVE SUMMARY

### What's Happening
Migrating from Prisma/PostgreSQL to Firebase Authentication + Cloud Firestore while keeping all UI, business logic, and API routes unchanged.

### Key Points
✅ **Zero UI Changes** - All 100+ components stay the same  
✅ **Minimal API Changes** - Service interfaces unchanged  
✅ **Isolated Impact** - Only 7 services affected  
✅ **Low Risk** - Modular architecture enables safe migration  
✅ **Backward Compatible** - Services return same types  

### Why Now
- **Free Development**: No database costs during development
- **Scalability**: Firestore auto-scales without configuration
- **Real-time Features**: Built-in subscriptions for future enhancements
- **Global Distribution**: Automatic CDN and multi-region support
- **Simplified Ops**: No database server to manage

---

## PHASE BREAKDOWN

### Phase 9.1.1: Firebase & Firestore Setup
**Duration**: 2-3 hours  
**Objective**: Initialize Firebase project and Firestore

**Tasks**:
1. Create Firebase project configuration file
2. Initialize Firebase Admin SDK
3. Set up Firestore emulator for local development
4. Configure environment variables
5. Test Firebase connection

**Deliverables**:
- `lib/firebase/config.ts` - Firebase initialization
- `lib/firebase/admin.ts` - Admin SDK setup
- `.env.local` updated with Firebase config
- Firestore emulator working locally

**No Code Changes**:
- Services untouched
- APIs untouched
- Components untouched

---

### Phase 9.1.2: Firestore Data Models & Security Rules
**Duration**: 3-4 hours  
**Objective**: Design collections and implement security

**Tasks**:
1. Define Firestore collection structure
2. Create document converters (Firestore → TypeScript)
3. Implement security rules
4. Create composite indexes
5. Document data model

**Deliverables**:
- Firestore collections designed
- Security rules file
- Document converters (reusable)
- Index definitions
- Architecture documentation

**No Service Changes**:
- Services still using Prisma
- APIs still working
- No downtime

---

### Phase 9.1.3: Product Service Migration
**Duration**: 4-6 hours  
**Objective**: Rewrite ProductService to use Firestore

**Current Flow**:
```
ProductService → prisma.product → PostgreSQL
```

**New Flow**:
```
ProductService → firestore.collection('products') → Firestore
```

**Service Interface**:
```typescript
class ProductService {
  createProduct(data): Promise<Product>
  getProductById(id): Promise<Product>
  updateProduct(id, data): Promise<Product>
  deleteProduct(id): Promise<void>
  listProducts(filters): Promise<{ products, pagination }>
  searchProducts(query): Promise<Product[]>
  // ... all methods stay the same
}
```

**Implementation**:
- Replace Prisma calls with Firestore queries
- Use converters for type transformation
- Keep error handling identical
- Maintain filtering/sorting behavior
- Ensure pagination works

**Testing**:
- Unit tests with Firestore emulator
- Query performance verification
- Verify exact same return types

**API Impact**: Zero - ProductService interface unchanged

---

### Phase 9.1.4: Kit Service Migration
**Duration**: 3-4 hours  
**Objective**: Rewrite KitService to use Firestore

**Changes**:
- `prisma.iotKit` → `firestore.collection('iotKits')`
- `prisma.kitProduct` → `iotKits/{id}/components` sub-collection
- Maintain exact same public interface

**Complexity**: Medium (junction tables → sub-collections)

**API Impact**: Zero - KitService interface unchanged

---

### Phase 9.1.5: Order Service Migration
**Duration**: 5-7 hours  
**Objective**: Rewrite OrderService to use Firestore

**Complexity**: High (transactions, relationships)

**Key Features**:
- Atomic order creation (batches)
- Automatic inventory deduction
- Status tracking
- Order history queries

**Firestore Implementation**:
```typescript
// Atomic transaction for order creation
const batch = writeBatch(db);

// 1. Create order document
batch.set(orderRef, orderData);

// 2. Create order items sub-collection
orderItems.forEach(item => {
  batch.set(itemRef, item);
});

// 3. Update product inventory
batch.update(productRef, { stock: increment(-quantity) });

// 4. Add inventory history
batch.set(historyRef, historyData);

await batch.commit(); // All-or-nothing
```

**Testing**:
- Transaction atomicity
- Inventory deduction accuracy
- Order status workflow
- Order history queries

**API Impact**: Zero - OrderService interface unchanged

---

### Phase 9.1.6: Cart Service Migration
**Duration**: 3-4 hours  
**Objective**: Rewrite CartService to use Firestore

**Structure**:
```
carts/{userId}
  └─ items/{itemId}
     ├─ productId or kitId
     └─ quantity
```

**Key Operations**:
- Add to cart
- Remove from cart
- Update quantity
- Calculate totals (cloud function or service)
- Clear cart

**Testing**:
- Cart creation on first use
- Item merging (same product)
- Total calculation accuracy

**API Impact**: Zero - CartService interface unchanged

---

### Phase 9.1.7: Address, Inventory & Wishlist Services
**Duration**: 2-3 hours each
**Objective**: Migrate remaining services

**Services**:
1. **AddressService**
   - `users/{userId}/addresses/{id}` sub-collection
   - Default address management
   - Query optimization

2. **InventoryService**
   - `products/{id}/inventoryHistory/{id}` sub-collection
   - Stock tracking
   - Audit trail queries

3. **WishlistService**
   - `users/{userId}/wishlist/{id}` sub-collection
   - Product & kit support
   - Move to cart operations

**API Impact**: Zero - All interfaces unchanged

---

### Phase 9.1.8: Firebase Authentication Integration
**Duration**: 4-5 hours  
**Objective**: Integrate Firebase Auth

**Current State**:
- User table stores `firebaseUid` field
- Sessions stored in database

**New State**:
- Use Firebase Auth tokens
- Store user profile in Firestore `users` collection
- No session table needed

**Implementation**:
```typescript
// Auth flow
1. User signs up via Firebase Auth
2. Create user profile in Firestore
3. Return Firebase ID token

// Auth flow on login
1. User logs in via Firebase Auth
2. Get Firebase ID token
3. Extract user from Firestore

// Protected route
1. Get ID token from client
2. Verify token via Firebase Admin SDK
3. Extract UID and fetch user from Firestore
```

**API Impact**: 
- Update middleware to verify Firebase tokens
- Update user profile APIs to use Firestore

---

### Phase 9.1.9: API Route Updates
**Duration**: 2-3 hours  
**Objective**: Update API error handling and token verification

**Changes Required**:
- Update middleware to verify Firebase tokens
- Update error responses (Firestore exceptions)
- Update request validation (Zod schemas stay same)
- Verify status codes and error messages

**Files to Update**:
- `app/api/products/route.ts` - No change (just error handling)
- `app/api/admin/products/route.ts` - No change (just auth middleware)
- `app/api/cart/route.ts` - No change (just auth middleware)
- `app/api/orders/route.ts` - No change (just auth middleware)
- `app/api/addresses/route.ts` - No change (just auth middleware)
- All other API routes - Same pattern

**API Request/Response**:
- Input validation: Zod schemas (unchanged)
- Output format: Same TypeScript types (unchanged)
- Error format: Still JSON with error property

---

### Phase 9.1.10: Testing & Verification
**Duration**: 4-6 hours  
**Objective**: Comprehensive testing

**Testing Levels**:

1. **Unit Tests** (Services)
   - Test each service independently
   - Mock Firestore using emulator
   - Verify exact return types

2. **Integration Tests** (APIs)
   - Test API routes end-to-end
   - Use Firestore emulator
   - Verify request/response formats

3. **Manual Testing** (Critical Flows)
   - Product creation and listing
   - Adding to cart
   - Creating orders
   - Authentication flows

4. **Build Verification**
   - `npm run build` - Must pass
   - `npm run lint` - Must pass
   - `npm run type-check` - Must pass

**Test Data**:
- Seed Firestore with test products
- Create test users
- Verify search and filtering work

---

### Phase 9.1.11: Documentation & Cleanup
**Duration**: 2-3 hours  
**Objective**: Update documentation

**Changes**:
- Update CLAUDE.md with Firestore architecture
- Remove Prisma references
- Add Firestore setup guide
- Document migration decisions
- Update environment variables documentation

**Cleanup**:
- Remove Prisma schema file
- Remove `prisma` package
- Remove `@prisma/client` package
- Remove unused PostgreSQL configs
- Remove unused database utilities

**Files to Remove**:
- `prisma/schema.prisma`
- `prisma/migrations/` (keep for history)
- `lib/prisma.ts`
- `.env.local` entries: `DATABASE_URL`, `DATABASE_*`

---

## RISK MITIGATION

### Architectural Decisions
1. ✅ **Keep Service Interface Unchanged** - APIs require zero changes
2. ✅ **Isolated Data Layer** - Only services affected, not UI
3. ✅ **Backward-Compatible Returns** - Services return same types
4. ✅ **Gradual Migration** - One service at a time
5. ✅ **Local Emulator** - Test everything locally first

### Testing Strategy
1. **Unit Tests** - Each service in isolation
2. **Integration Tests** - APIs end-to-end
3. **Manual Tests** - Critical user flows
4. **Smoke Tests** - All pages load

### Rollback Strategy
1. Keep Prisma code until fully migrated
2. Use feature flags if switching providers mid-migration
3. Keep git history (can revert if needed)
4. Database-agnostic service interfaces

---

## DETAILED EXECUTION STEPS

### Step 1: Setup Firebase (2-3 hours)
```bash
# 1. Create Firebase project at console.firebase.google.com
# 2. Get Firebase config
# 3. Create lib/firebase/config.ts
# 4. Create lib/firebase/admin.ts
# 5. npm install firebase firebase-admin
# 6. Start Firestore emulator: firebase emulators:start --only firestore,auth
# 7. Test connection
```

### Step 2: Define Firestore Schema (3-4 hours)
```
1. Create document converters
2. Define security rules
3. Create composite indexes
4. Document collection structure
5. Test with emulator
```

### Step 3-7: Migrate Services One-by-One (18-22 hours)
```
For each service:
1. Open service file
2. Replace Prisma calls with Firestore queries
3. Update converters
4. Run tests
5. Verify behavior
6. Commit
```

### Step 8: Integrate Firebase Auth (4-5 hours)
```
1. Update middleware
2. Update user profile APIs
3. Test authentication
4. Update documentation
```

### Step 9: Update APIs (2-3 hours)
```
1. Review each API route
2. Update error handling
3. Test error cases
4. Verify status codes
```

### Step 10: Testing (4-6 hours)
```
1. Run unit tests
2. Run integration tests
3. Manual testing
4. Build verification
```

### Step 11: Cleanup (2-3 hours)
```
1. Remove Prisma references
2. Remove unused packages
3. Update documentation
4. Final commit
```

---

## DECISION POINTS

### Go/No-Go Criteria
- ✅ Architecture is modular (zero UI changes needed)
- ✅ Services are isolated (easy to swap)
- ✅ Return types can be made compatible
- ✅ Security rules can be implemented
- ✅ All operations can be replicated in Firestore
- ✅ Estimated 40-50 hours of work (manageable)
- ✅ Low risk due to isolation

### Recommendation: **PROCEED**

The existing modular architecture makes this migration safe and low-risk. Service interfaces remain unchanged, so APIs need zero modifications. The isolated data layer means this is purely a persistence layer replacement.

---

## APPROVAL CHECKLIST

Before proceeding, confirm:

- [ ] Audit report reviewed and approved
- [ ] Firestore architecture design reviewed and approved
- [ ] Migration plan reviewed and approved
- [ ] Timeline acceptable (40-50 hours)
- [ ] Risk mitigation strategy acceptable
- [ ] Ready to start Phase 9.1.1 (Firebase Setup)

---

## NEXT STEPS

1. ✅ **Audit Complete** (DONE)
2. ✅ **Architecture Design Complete** (DONE)
3. ✅ **Migration Plan Complete** (DONE)
4. ⏳ **Awaiting Approval** (CURRENT - STOP HERE)
5. ⏳ **Phase 9.1.1: Firebase Setup** (After approval)
6. ⏳ **Phase 9.1.2-11: Service Migration** (After approval)

---

**Status**: Migration plan complete. Awaiting approval before implementation.

**If approved**: Start with Phase 9.1.1 Firebase Setup
**If rejected**: Document feedback and propose alternative approach
