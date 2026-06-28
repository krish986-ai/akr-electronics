# A.K.R Electronics

> Premium IoT E-commerce Platform for India

A production-ready IoT e-commerce platform built with modern technologies. Selling individual IoT components and complete IoT kits to developers and innovators across India.

## Project Status

**Phase 0: Foundation** - In Progress

Development foundation has been initialized. Ready for Phase 1 (Feature Development).

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Animation**: Framer Motion
- **Code Quality**: ESLint + Prettier
- **Deployment**: Firebase Hosting (pending)
- **CI/CD**: GitHub Actions

## Project Structure

```
AKR/
├── app/                          # Next.js app directory
│   ├── admin/                    # Admin dashboard routes
│   ├── (customer)/               # Customer public routes
│   ├── api/                      # API routes
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable React components
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Layout components
│   ├── forms/                   # Form components
│   └── admin/                   # Admin-specific components
├── lib/                         # Utility functions and helpers
│   ├── utils/                   # Utility functions
│   ├── api/                     # API helpers
│   ├── db/                      # Database utilities
│   └── auth/                    # Authentication utilities
├── prisma/                      # Database schema and migrations
├── types/                       # TypeScript type definitions
├── hooks/                       # Custom React hooks
├── public/                      # Static assets
├── styles/                      # Additional style files
├── .ai/                         # Project documentation and memory
│   ├── memory.md               # Project memory and context
│   ├── roadmap.md              # Project roadmap
│   ├── architecture.md         # Architecture documentation
│   ├── database.md             # Database design
│   ├── decisions.md            # Architecture decisions
│   └── progress.md             # Progress tracking
└── .env.example                # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- PostgreSQL 14+

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env.local` and configure
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type check with TypeScript
- `npm run db:push` - Sync database schema
- `npm run db:generate` - Generate Prisma client

## Architecture

### Database

PostgreSQL with Prisma ORM provides:
- Strong typing with Prisma schema
- Automatic migrations
- Query optimization with indexes
- Relations management

**Key Tables**:
- Users (customers and admins)
- Products (IoT components and kits)
- Categories
- Orders and OrderItems
- Cart and CartItems
- Wishlist
- Addresses
- Reviews

See `prisma/schema.prisma` for complete schema.

### API Routes

RESTful API with clear separation:
- `/api/auth/*` - Authentication endpoints
- `/api/products/*` - Product management
- `/api/orders/*` - Order management
- `/api/users/*` - User management
- `/api/cart/*` - Shopping cart

### Authentication

Placeholder for Firebase authentication (configured in Phase 1).

### Frontend

- **Admin Dashboard**: Private routes under `/admin`
- **Customer Site**: Public routes under `/`
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Animations**: Framer Motion for smooth UX

## Environment Variables

See `.env.example` for required variables.

Key integrations (placeholders):
- **Firebase**: Authentication and hosting
- **Razorpay**: Payment processing
- **PostgreSQL**: Database connection

## Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Type Checking**: `npm run type-check`

## Folder Structure Conventions

### `/app`
- Page routes follow Next.js App Router convention
- Admin routes: `/app/admin/**`
- Public routes: `/app/(customer)/**`
- API routes: `/app/api/**`

### `/components`
- `ui/` - Reusable UI components
- `layout/` - Layout wrapper components
- `forms/` - Form components with validation
- `admin/` - Admin-specific components

### `/lib`
- `utils/` - Helper functions
- `api/` - API client utilities
- `db/` - Database utilities
- `auth/` - Authentication logic

## Security

- Environment variables for secrets
- HTTPS headers configured
- CORS ready
- SQL injection protection (Prisma)
- XSS protection (React built-in)

## Performance

- Image optimization with Next.js
- Code splitting and lazy loading
- Tailwind CSS purging
- Database indexes on frequently queried fields

## SEO

- Metadata configured in root layout
- Open Graph tags
- Structured data ready

## License

Proprietary - A.K.R Electronics

---

**Documentation**: See `.ai/` directory for detailed architecture and decisions.
