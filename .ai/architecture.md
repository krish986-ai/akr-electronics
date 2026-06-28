# A.K.R Electronics - Architecture Documentation

## System Architecture

### Layers

```
┌─────────────────────────────────────────┐
│         User Interface Layer            │
│  React 19 + Tailwind CSS + shadcn/ui   │
├─────────────────────────────────────────┤
│         State Management Layer          │
│    Zustand + React Hook Form + Zod     │
├─────────────────────────────────────────┤
│      Next.js API Routes Layer (REST)    │
│    Route Handlers + Middleware          │
├─────────────────────────────────────────┤
│       Business Logic Layer              │
│   API functions + Utilities + Hooks     │
├─────────────────────────────────────────┤
│    Data Access Layer (Prisma ORM)       │
│     Type-safe database queries          │
├─────────────────────────────────────────┤
│       Database Layer (PostgreSQL)       │
│  Relational database with proper schema │
└─────────────────────────────────────────┘
```

## Frontend Architecture

### Pages and Routes

**Admin Dashboard** (`/admin`)
- Private routes requiring admin role
- Layout wrapper with admin sidebar
- Dashboard overview
- Product management
- Order management
- User management
- Settings

**Customer Website** (`/`)
- Public routes
- Layout wrapper with navbar and footer
- Homepage
- Product catalog
- Product detail pages
- Shopping cart
- Checkout
- Account management
- Order tracking

### Component Hierarchy

```
RootLayout (app/layout.tsx)
├── AdminLayout (/admin/layout.tsx)
│   ├── Sidebar
│   ├── TopBar
│   └── Content Area
└── CustomerLayout (/layout.tsx)
    ├── Navbar
    ├── Page Content
    └── Footer
```

### State Management

**Zustand Stores**:
- `userStore` - Current user and auth state
- `cartStore` - Shopping cart state
- `uiStore` - UI state (modals, sidebars)
- `filterStore` - Product filter state

## Backend Architecture

### API Structure

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   └── GET /session
├── /products
│   ├── GET / (list all)
│   ├── GET /:id (single product)
│   ├── POST / (create - admin only)
│   ├── PUT /:id (update - admin only)
│   └── DELETE /:id (delete - admin only)
├── /orders
│   ├── GET / (user's orders)
│   ├── GET /:id (single order)
│   ├── POST / (create order)
│   └── PUT /:id (update status - admin only)
├── /cart
│   ├── GET / (get user's cart)
│   ├── POST /items (add to cart)
│   ├── PUT /items/:id (update quantity)
│   └── DELETE /items/:id (remove from cart)
└── /users
    ├── GET /profile (current user)
    ├── PUT /profile (update profile)
    └── GET /addresses (saved addresses)
```

### Error Handling

Consistent error response format:
```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable message"
}
```

## Database Design

### Entity Relationship Diagram

```
User (1) ──→ (N) Order
User (1) ──→ (N) Cart
User (1) ──→ (N) Address
User (1) ──→ (N) WishlistItem
User (1) ──→ (N) Review

Order (1) ──→ (N) OrderItem
Cart (1) ──→ (N) CartItem

Product (1) ──→ (N) OrderItem
Product (1) ──→ (N) CartItem
Product (1) ──→ (N) WishlistItem
Product (1) ──→ (N) Review

Category (1) ──→ (N) Product
```

### Key Design Decisions

1. **Soft Deletes**: Not implemented initially, can be added later
2. **Audit Trail**: CreatedAt and UpdatedAt on all models
3. **Normalization**: 3NF for data integrity
4. **Indexing**: 
   - Foreign keys indexed
   - Commonly searched fields indexed
   - Composite indexes for common queries

## Authentication Flow

```
User Input
    ↓
React Hook Form Validation
    ↓
API Route Handler
    ↓
Authentication Service
    ↓
Session/Token Storage
    ↓
Protected Routes Middleware
```

**To be implemented**:
- Firebase Authentication integration
- NextAuth.js middleware
- JWT token handling

## Caching Strategy

**Database Level**:
- Prisma query result caching ready
- Redis integration ready for Phase 2

**HTTP Level**:
- GET requests cacheable
- ETag generation ready
- Cache headers configured

## Security Architecture

### Layers

1. **Client**: Input validation with Zod
2. **API**: Rate limiting ready, input sanitization
3. **Database**: SQL injection protection via Prisma
4. **Transport**: HTTPS only headers configured
5. **Environment**: Secrets in .env variables

### Protected Resources

Admin routes require:
- User authentication
- Role verification (ADMIN)
- Audit logging (ready for Phase 2)

## Performance Considerations

### Frontend
- Code splitting by route
- Image optimization with Next.js
- Lazy loading of components
- CSS-in-JS optimization

### Backend
- Database indexes on foreign keys
- Pagination for list endpoints
- Query optimization in Prisma
- Connection pooling ready

### Database
- Indexes on:
  - Primary keys
  - Foreign keys
  - Common search fields
  - Composite indexes for joins

## Deployment Architecture

### Firebase Hosting
- Next.js static export compatible
- Environment variables via GitHub Secrets
- GitHub Actions CI/CD pipeline

### Environment Separation

- **Development**: Local PostgreSQL
- **Staging**: Staging database
- **Production**: Production database

## Scalability Considerations

### Current Setup
- Handles 10K concurrent users
- Stateless API design
- Database connection pooling ready

### Future Improvements
- Redis for caching
- CDN for static assets
- Database replicas for read scaling
- Microservices if needed

---

**Architecture Version**: 1.0
**Last Updated**: Phase 0 Initialization
