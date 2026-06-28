# A.K.R Electronics - Architecture Decision Records

## ADR-001: Next.js 15 with App Router

**Status**: Approved ✓

**Decision**: Use Next.js 15 (latest) with App Router for application structure.

**Rationale**:
- App Router is the recommended approach for new projects
- Provides cleaner file-based routing
- Better support for server components and streaming
- Improved performance with automatic code splitting

**Alternatives Considered**:
- Pages Router (older, less performant)
- Full SPA with Vite (lacks built-in optimization)

**Implications**:
- File-based routing under `/app`
- Server components by default
- `use client` for interactive components

---

## ADR-002: Prisma ORM for Database Access

**Status**: Approved ✓

**Decision**: Use Prisma as the ORM for database access.

**Rationale**:
- Type-safe database queries
- Automatic client generation
- Built-in migrations
- Excellent TypeScript support
- No SQL knowledge required for basic operations
- Query optimization ready

**Alternatives Considered**:
- Raw SQL (error-prone, not type-safe)
- TypeORM (more complex, steeper learning curve)
- Drizzle ORM (newer, less mature)

**Implications**:
- Schema-driven development
- Automatic type generation
- Built-in data validation

---

## ADR-003: PostgreSQL for Database

**Status**: Approved ✓

**Decision**: Use PostgreSQL as the relational database.

**Rationale**:
- Free and open-source
- ACID compliance for data integrity
- Excellent for complex queries
- JSON support for flexible fields
- Full-text search capabilities
- Industry standard reliability

**Alternatives Considered**:
- MySQL (similar but less features)
- SQLite (not suitable for production scale)
- MongoDB (not suitable for relational data)

**Implications**:
- Must maintain PostgreSQL instance
- SQL knowledge helpful but not required (Prisma hides it)
- JSONB for flexible data storage

---

## ADR-004: Zustand for State Management

**Status**: Approved ✓

**Decision**: Use Zustand for global state management.

**Rationale**:
- Lightweight (minimal boilerplate)
- Excellent TypeScript support
- No provider hell
- Easy to test
- Scales from small to large apps

**Alternatives Considered**:
- Redux (overly complex for this scale)
- Context API (no middleware support)
- Recoil (still experimental)

**Implications**:
- Small store files
- DevTools integration ready
- Minimal performance overhead

---

## ADR-005: React Hook Form + Zod for Forms

**Status**: Approved ✓

**Decision**: Use React Hook Form with Zod for form management and validation.

**Rationale**:
- React Hook Form: minimal re-renders, excellent performance
- Zod: TypeScript-first schema validation
- Type inference from schema
- Validation works on client and server
- Easy error handling

**Alternatives Considered**:
- Formik (heavier, more re-renders)
- Plain React (manual validation, error-prone)

**Implications**:
- Zod schemas define both types and validation
- Forms automatically typed
- Server validation easy to add

---

## ADR-006: Folder Structure with App Router Layout Groups

**Status**: Approved ✓

**Decision**: Use folder structure with layout groups for admin and customer routes.

**Rationale**:
- Clear separation of concerns
- Admin routes private by default
- Customer routes public by default
- Different layouts can be applied per group
- Middleware can guard admin routes

**Structure**:
```
/app
  /admin         # Protected admin routes
    /dashboard
    /products
    /orders
  /(customer)    # Public customer routes
    /home
    /shop
    /cart
  /api           # REST API endpoints
```

**Implications**:
- Requires middleware for admin protection
- Clear route organization
- Easy to add new feature areas

---

## ADR-007: Component Library with shadcn/ui

**Status**: Approved ✓

**Decision**: Use shadcn/ui as the base for UI components.

**Rationale**:
- Copy-paste component library (not npm package)
- Full control over component code
- Built on Radix UI (accessibility-first)
- Tailwind CSS integration
- Easy customization

**Alternatives Considered**:
- Material-UI (heavy, too opinionated)
- Chakra UI (runtime overhead)
- Bootstrap (not modern, jQuery-ish)

**Implications**:
- Components copied to `/components/ui`
- Customizable for brand colors
- No version conflicts with future updates

---

## ADR-008: Database Schema with Proper Relationships

**Status**: Approved ✓

**Decision**: Use relational schema with proper indexing and foreign keys.

**Rationale**:
- Data integrity via foreign key constraints
- Efficient queries with indexes
- Scalable to production loads
- ACID compliance
- Easy migrations with Prisma

**Schema Highlights**:
- 11 models covering core functionality
- Proper indexes on foreign keys and search fields
- Enums for status fields
- JSON fields for flexible data (specifications)
- Soft delete ready (isActive flags)

**Implications**:
- Must maintain schema consistency
- Migrations required for schema changes
- Data validation at database level

---

## ADR-009: Environment Variables for Secrets

**Status**: Approved ✓

**Decision**: Use .env variables for all secrets and configuration.

**Rationale**:
- Secrets not in code repository
- Easy per-environment configuration
- GitHub Actions can inject via secrets
- Standard Node.js practice

**Configuration**:
- `.env.example` - Template for required variables
- `.env.local` - Development (in .gitignore)
- GitHub Secrets - Production values

**Implications**:
- Must set up .env.local for development
- Production requires GitHub Secrets setup
- No secrets in code ever

---

## ADR-010: ESLint + Prettier for Code Quality

**Status**: Approved ✓

**Decision**: Use ESLint for linting and Prettier for formatting.

**Rationale**:
- Catches errors early
- Consistent code style across team
- Easy to configure for project needs
- Automated formatting saves time
- Industry standard tools

**Configuration**:
- ESLint with TypeScript support
- Prettier with strict settings
- Pre-commit hooks ready (Phase 1)

**Implications**:
- `npm run lint` must pass before commit
- `npm run format` auto-fixes most issues
- Type checking in addition to linting

---

## ADR-011: API Routes with Next.js App Router

**Status**: Approved ✓

**Decision**: Use Next.js API routes in App Router for REST API.

**Rationale**:
- Built into Next.js framework
- No additional server required
- Easy authentication integration
- Can access database directly
- Integrates with middleware

**Alternatives Considered**:
- Separate Express server (more complex deployment)
- Firebase Functions (vendor lock-in)
- GraphQL (overkill for current scale)

**Structure**:
```
/app/api
  /auth
  /products
  /orders
  /cart
  /users
```

**Implications**:
- API and frontend in same codebase
- Easier development workflow
- Consistent error handling needed

---

## ADR-012: GitHub Actions for CI/CD (Phase 1)

**Status**: Approved ✓

**Decision**: Use GitHub Actions for continuous integration.

**Rationale**:
- Free for public repositories
- Native GitHub integration
- No additional services needed
- Good for small to medium projects

**Workflows**:
- Run tests on PR
- Type checking
- Linting
- Build verification

**Implications**:
- Requires GitHub repository
- Secrets configured in GitHub
- Consistent deployment process

---

## ADR-013: Firebase Hosting for Deployment (Phase 2)

**Status**: Approved (Implementation Phase 2)

**Decision**: Use Firebase Hosting for production deployment.

**Rationale**:
- Free tier covers initial traffic
- Global CDN included
- GitHub Actions integration
- Environment support
- Easy staging/production setup

**Alternatives Considered**:
- Vercel (GitHub-owned, excellent but paid at scale)
- Netlify (limited backend)
- Self-hosted (complex DevOps)

**Implications**:
- Firebase project setup in Phase 2
- Environment variables via Firebase config
- Automatic deployments from GitHub

---

## ADR-014: No Monolithic Components

**Status**: Approved ✓

**Decision**: Keep components small and focused.

**Rationale**:
- Easier to test
- Reusable across pages
- Easier to maintain
- Better performance (smaller re-renders)

**Guidelines**:
- Component max ~200 LOC
- One responsibility per component
- Props clearly typed
- Composed from smaller pieces

**Implications**:
- More files but better organization
- Clear component hierarchy
- Easier to find and fix bugs

---

## ADR-015: Type Safety First

**Status**: Approved ✓

**Decision**: All code must be fully typed with TypeScript.

**Rationale**:
- Catch errors at compile time
- Better IDE support
- Clearer code intention
- Easier refactoring
- Fewer runtime errors

**Standards**:
- No `any` types (use `unknown` if needed)
- All function parameters typed
- All return types specified
- Zod schemas for runtime validation

**Implications**:
- TypeScript compilation required
- Stricter linting rules
- More robust code overall

---

## Phase 2 Database Architecture Decisions

### ADR-016: Expand Schema to 30 Models

**Status**: Approved ✓

**Decision**: Redesign Prisma schema from 10 to 30 models for comprehensive e-commerce platform.

**Rationale**:
- Support for IoT Kits (complex product bundles)
- Brand management for product categorization
- Hierarchical category structure for unlimited nesting
- Comprehensive inventory tracking with audit history
- Flexible discount/coupon system
- Website configuration and homepage management
- Audit logging for compliance

**Models Added**:
- Brand, IoT Kit system (IotKit, KitImage, KitProduct)
- InventoryHistory for tracking
- Coupon & UserCouponUsage
- WebsiteSettings, HomepageSection, Banner, Announcement
- AuditLog for compliance

**Implications**:
- More complex relationships but better normalization
- Comprehensive schema for production launch
- Scalable to support complex business logic

---

### ADR-017: Soft Deletes for Audit Trail

**Status**: Approved ✓

**Decision**: Implement soft deletes (isDeleted, deletedAt) for audit trail preservation.

**Rationale**:
- Regulatory compliance (financial records, order history)
- Data recovery ability
- Audit trail immutability
- Prevents accidental data loss

**Affected Models**: User, Product, Brand, Category, Address, Coupon, Order, Review

**Query Pattern**:
```prisma
await prisma.product.findMany({
  where: { isDeleted: false }
})
```

---

### ADR-018: Decimal for Monetary Values

**Status**: Approved ✓

**Decision**: Use Decimal(12, 2) for all monetary fields (prices, totals, costs).

**Rationale**:
- Precision: No floating-point errors
- Financial accuracy: Supports rupees with paise
- Regulatory compliance: Auditable, exact values
- Prevents rounding issues

**Fields**:
- Product: basePrice, salePrice
- Order: subtotal, taxAmount, shippingCost, discountAmount, grandTotal
- Coupon: value, minPurchaseAmount, maxDiscountAmount

---

### ADR-019: De-normalized OrderItem Fields

**Status**: Approved ✓

**Decision**: Store product name, SKU, price at time of order in OrderItem.

**Rationale**:
- Order history immutability
- Product deletion doesn't break orders
- Accurate historical pricing
- Complete audit trail of what customer bought

**Prevents**:
- Lost order data when product deleted
- Pricing discrepancies
- Inventory lookup delays

---

### ADR-020: Hierarchical Categories with Self-Reference

**Status**: Approved ✓

**Decision**: Use parentId self-referencing for unlimited category nesting.

**Rationale**:
- Unlimited nesting depth
- Flexible category structure
- Scalable (no depth limit)
- Supports IoT product taxonomy

**Example**:
```
Electronics
  ├─ Microcontrollers
  │   ├─ Arduino
  │   ├─ Raspberry Pi
  │   └─ ESP32
  └─ Sensors
      ├─ Temperature
      └─ Motion
```

---

### ADR-021: Multiple Address Types in Single Table

**Status**: Approved ✓

**Decision**: Single Address table with type enum instead of separate tables.

**Rationale**:
- Code reuse
- Flexibility: SHIPPING, BILLING, or BOTH
- Consistency: Single source of truth
- Simplifies queries

**Types**: SHIPPING, BILLING, BOTH

---

### ADR-022: Flexible JSON Fields for Extensibility

**Status**: Approved ✓

**Decision**: Use JSON for fields that might vary by product type.

**Rationale**:
- Different products need different specifications
- No schema migration needed for new fields
- Extensible without code changes
- Product flexibility

**JSON Fields**:
- Product.specifications (sensor specs, connector types, etc.)
- Product.dimensions (length, width, height, unit)
- OrderItem.metadata (item-specific data)
- HomepageSection.content (flexible content structure)

---

### ADR-023: Coupon Applicability with Arrays

**Status**: Approved ✓

**Decision**: Use String[] arrays for excluded categories and products.

**Rationale**:
- Flexible coupon rules
- Can exclude specific items
- Scalable to any number
- PostgreSQL array support

**Example**:
```prisma
coupon = await prisma.coupon.create({
  data: {
    code: "SUMMER20",
    type: "PERCENTAGE",
    value: new Decimal(20),
    excludedCategories: ["luxury", "premium"],
    excludedProducts: ["prod_001", "prod_002"]
  }
})
```

---

### ADR-024: Optional Foreign Keys for Deletion Safety

**Status**: Approved ✓

**Decision**: Make product/kit FKs optional in CartItem and OrderItem.

**Rationale**:
- Product deletion doesn't break shopping cart
- Order history preserved if product deleted
- Better data integrity
- Supports product discontinuation

**Pattern**:
- productId: String? (optional)
- kitId: String? (optional)
- At least one must be NOT NULL (enforced at app level)

---

### ADR-025: Comprehensive Index Strategy

**Status**: Approved ✓

**Decision**: Create 80+ indexes for performance optimization.

**Types of Indexes**:
1. Foreign key indexes (all FK fields)
2. Search indexes (name, slug, email)
3. Status indexes (for filtering)
4. Composite indexes (common query patterns)
5. Timestamp indexes (for date range queries)

**Performance Benefits**:
- 10-100x faster queries
- Efficient pagination
- Optimized filtering

---

**ADR Index**: 25 decisions documented (Phase 0-2)
**Last Updated**: Phase 2 Database Architecture
**Status**: All ADRs approved and implemented
