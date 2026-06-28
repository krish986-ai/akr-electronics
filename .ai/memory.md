# A.K.R Electronics - Project Memory

## Current Phase

**Phase 0 - Foundation Setup**

Initialize project, install dependencies, configure all tools, validate build.

## Project Context

**Name**: A.K.R Electronics
**Type**: Premium IoT E-commerce Platform
**Market**: India
**Products**: IoT components and complete kits

## Tech Stack Decisions

1. **Next.js 15** - Latest stable, App Router for clean architecture
2. **React 19** - Latest with concurrent features
3. **TypeScript** - Full type safety across codebase
4. **Tailwind CSS** - Utility-first, zero-runtime CSS
5. **shadcn/ui** - High-quality, copy-paste components
6. **Prisma ORM** - Type-safe database access
7. **PostgreSQL** - Robust, free, open-source database
8. **Zustand** - Lightweight state management
9. **React Hook Form + Zod** - Type-safe forms

## Architecture Decisions

### Folder Structure
- `/app` - Next.js App Router
- `/components` - Reusable UI components
- `/lib` - Utilities and helpers
- `/prisma` - Database schema
- `/types` - TypeScript definitions
- `/.ai` - Documentation

### Database Strategy
- Prisma for ORM and type safety
- PostgreSQL for reliability and performance
- Proper indexing strategy
- Relational model for integrity

### API Design
- RESTful endpoints under `/api`
- Clear separation of concerns
- Consistent response format
- Error handling at route level

### Authentication
- Firebase Auth placeholder
- NextAuth.js ready for integration
- Session management via JWT (future)

### UI Components
- shadcn/ui for complex components
- Tailwind CSS for styling
- Framer Motion for animations
- Responsive mobile-first design

## Project Structure Created

✓ Complete Next.js 15 setup
✓ TypeScript configuration
✓ Tailwind CSS setup
✓ Prisma schema with 11 models
✓ Production folder structure
✓ Configuration files (tsconfig, next.config, etc.)
✓ Environment variables template
✓ Documentation files
✓ Git repository initialized

## Database Schema

**11 Models Created**:
1. User - Customers and admins
2. Product - IoT components and kits
3. Category - Product categories
4. Cart - Shopping carts
5. CartItem - Items in cart
6. Order - Customer orders
7. OrderItem - Items in order
8. Address - Shipping and billing addresses
9. WishlistItem - Saved products
10. Review - Product reviews

All with:
- Proper relationships
- Indexes for performance
- Enums for status fields
- Timestamps for auditing

## Installation Status

- [ ] Dependencies installed
- [ ] Prisma client generated
- [ ] Build validation
- [ ] Type checking passed
- [ ] Linting passed

## Next Steps

1. Run `npm install` to install all dependencies
2. Set up PostgreSQL database
3. Configure `.env.local` with database URL
4. Run Prisma migrations
5. Validate build and tests

## Known Constraints

1. **No Firebase/Razorpay Setup** - Phase 1 work
2. **PostgreSQL Required** - Must have running instance
3. **Node.js 18+** - Language version requirement
4. **Free Tech Only** - No paid dependencies

## Important Rules

1. No placeholder business logic
2. All code must be production-ready
3. Full type safety with TypeScript
4. No comments unless WHY is non-obvious
5. No code duplication
6. Modular, testable components

---

**Last Updated**: Phase 0 Initialization
**Status**: Foundation files created, awaiting npm install
