# A.K.R Electronics - Claude Code Guidance

## Project Overview

A.K.R Electronics is a premium IoT e-commerce platform for India, currently in Phase 0 (Foundation Setup).

**Project Goal**: Build a production-ready platform for selling:
- Individual IoT Components (Arduino, Raspberry Pi, sensors, etc.)
- Complete IoT Kits

**Platforms**:
- Customer Website
- Admin Dashboard

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- React Hook Form + Zod
- Framer Motion
- Zustand
- ESLint + Prettier
- GitHub Actions

## Project Structure

- `app/` - Next.js application routes
- `components/` - Reusable React components
- `lib/` - Utilities and helpers
- `prisma/` - Database schema
- `types/` - TypeScript definitions
- `public/` - Static assets
- `.ai/` - Project documentation and memory

## Development Guidelines

### Code Quality

1. **Type Safety**: Every variable, parameter, and return type must be typed
2. **No Comments**: Write self-documenting code unless the WHY is non-obvious
3. **No Placeholder Code**: Never generate fake business logic
4. **No Duplication**: Extract reusable logic to functions
5. **Modular**: Keep functions and components small and focused

### Folder Conventions

```
app/
├── admin/              # Admin dashboard (private)
├── (customer)/         # Customer website (public)
└── api/               # REST API endpoints

components/
├── ui/                # Reusable UI components
├── layout/            # Layout wrappers
├── forms/             # Form components
└── admin/             # Admin-specific components

lib/
├── utils/             # Helper functions
├── api/               # API utilities
├── db/                # Database utilities
└── auth/              # Auth utilities
```

### API Route Structure

- Use `GET` for fetching data
- Use `POST` for creating resources
- Use `PUT/PATCH` for updating
- Use `DELETE` for removing
- Return JSON with consistent structure

### Database

- Prisma schema is source of truth
- Always run migrations
- Use proper indexes for performance
- Implement soft deletes where appropriate

### Component Structure

```tsx
// Imports
import { cn } from '@/lib/utils/cn';

// Component
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
}

// Types
interface Props {
  prop: string;
}
```

### Forms

Use `react-hook-form` + `zod`:
- Define validation schema first
- Use hook form for state management
- Display errors from validation

### Styling

- Use Tailwind CSS for styling
- Use shadcn/ui for complex components
- Custom CSS only when necessary

## Git Workflow

- Create meaningful commits
- Link to documentation in commit messages
- One feature per branch
- PR title should be clear and descriptive

## Testing

- Write tests as you build (Phase 1 onwards)
- Test API endpoints
- Test critical user flows
- Accessibility testing for UI

## Deployment

Vercel (Hobby/free tier) — see DEPLOYMENT.md:
- Git-based auto-deploy on push to main (no GitHub Actions needed)
- Preview deployments per branch/PR
- Environment variables in Vercel dashboard
- Region pinned to bom1 (Mumbai) via vercel.json
- Serverless constraint: never write to local filesystem at request time —
  uploads use Firebase Storage in production (LocalStorageProvider is dev-only)

## Phase Breakdown

### Phase 0 - Foundation (CURRENT)
- [x] Project initialization
- [x] Dependencies setup
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Prisma schema
- [x] Folder structure
- [ ] Install dependencies
- [ ] Validate build

### Phase 1 - Core Features
- Authentication (Firebase)
- Product management
- Shopping cart
- Order management
- Payment integration (Razorpay)

### Phase 2 - Advanced Features
- Admin dashboard
- Analytics
- Email notifications
- Search optimization
- Performance optimization

### Phase 3 - Launch
- Security hardening
- Load testing
- Firebase deployment
- CI/CD setup
- Monitoring

## Important Notes

1. **No Firebase/Razorpay Setup**: Use `.env.example` placeholders only
2. **Database**: PostgreSQL required locally for development
3. **Production Ready**: Code written in Phase 0 must be production-quality
4. **Free Tech Only**: No paid services except deployment

## Memory and Documentation

- `.ai/memory.md` - Session memory
- `.ai/roadmap.md` - Project roadmap
- `.ai/architecture.md` - Architecture decisions
- `.ai/database.md` - Database design docs
- `.ai/decisions.md` - ADRs (Architecture Decision Records)
- `.ai/progress.md` - Progress tracking
- `.ai/current_task.md` - Current task details
- `.ai/completed.md` - Completed work
- `.ai/changelog.md` - Version history
- `.ai/bugs.md` - Known issues
- `.ai/testing.md` - Testing strategy
- `.ai/deployment.md` - Deployment notes
- `.ai/rules.md` - Project rules
- `.ai/session_log.md` - Session activity log

## Quick Commands

```bash
# Development
npm run dev           # Start dev server
npm run type-check   # Type checking
npm run lint         # Lint code
npm run format       # Format code

# Database
npx prisma migrate dev   # Create migration
npx prisma db push       # Sync schema
npx prisma studio       # Open Prisma Studio

# Build
npm run build        # Production build
npm start            # Start prod server
```

## Questions? Issues?

Refer to `.ai/` directory for detailed documentation and session notes.
