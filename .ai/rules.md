# A.K.R Electronics - Project Rules & Standards

## Code Quality Rules

### TypeScript
1. **No `any` types** - Use `unknown` if you must, then narrow
2. **All parameters typed** - Every function parameter must have a type
3. **All returns typed** - Function return types must be explicit
4. **Strict mode enabled** - `"strict": true` in tsconfig
5. **No unused variables** - `"noUnusedLocals": true` in tsconfig
6. **No implicit any** - `"noImplicitAny": true` in tsconfig

### Components & Functions
1. **Single responsibility** - One job per component/function
2. **Small files** - Components max ~200 LOC
3. **No duplication** - Extract common logic to utilities
4. **Props clearly typed** - Interface or type alias for props
5. **Pure components** - No side effects in render
6. **Exported types** - Type definitions exported from modules

### Comments
1. **No obvious comments** - Don't comment what the code clearly states
2. **Comment the WHY** - Explain non-obvious business logic
3. **No commented code** - Delete dead code, don't comment it
4. **One line max** - Keep comments brief and targeted

### Performance
1. **No inline functions** - Extract to module level when possible
2. **No unnecessary renders** - Use useMemo, useCallback thoughtfully
3. **Optimize imports** - Import only what you need
4. **Use React.memo** - For expensive components receiving props
5. **Lazy load heavy components** - Use React.lazy for route-level

## File Organization Rules

### Folder Structure
```
/app              - Next.js routes
/components       - React components (ui, layout, forms, admin)
/lib              - Utilities (utils, api, db, auth)
/prisma           - Database schema and migrations
/types            - TypeScript definitions
/hooks            - Custom React hooks
/public           - Static files
/styles           - Global styles
/.ai              - Documentation and memory
```

### File Naming
- **Components**: PascalCase (Button.tsx, UserCard.tsx)
- **Utils**: camelCase (cn.ts, formatDate.ts)
- **Types**: camelCase (user.ts, product.ts)
- **Hooks**: camelCase starting with 'use' (useCart.ts, useAuth.ts)
- **Styles**: camelCase.css (globals.css, button.css)

### Component Structure
```tsx
// 1. Imports
import { ReactNode } from 'react';

// 2. Types (if not in separate file)
interface Props {
  children: ReactNode;
}

// 3. Component
export function Button({ children }: Props) {
  return <button>{children}</button>;
}

// Don't export default - use named exports
```

## Database Rules

### Schema
1. **PK on every table** - Always have an id primary key
2. **Timestamps on all** - createdAt and updatedAt
3. **Foreign key indexes** - All FK have indexes
4. **Unique constraints** - Email, order number, etc.
5. **Enums for status** - Use database enums for fixed values
6. **Proper relationships** - Define all relations in Prisma

### Queries
1. **Eager load relations** - Include related data in query
2. **Select specific fields** - Don't SELECT *, specify fields
3. **Paginate large sets** - Use skip/take for large queries
4. **Use indexes** - Query on indexed fields when possible
5. **Avoid N+1** - Load related data in single query

### Migrations
1. **One migration per change** - Small, focused migrations
2. **Reversible migrations** - Always be able to rollback
3. **Test migrations** - Verify up and down work
4. **Document migrations** - Leave comments for why

## API Rules

### Endpoints
1. **RESTful design** - Standard HTTP methods
2. **Consistent URLs** - /api/resource/action pattern
3. **Version in accept header** - Or URL prefix if needed
4. **Clear naming** - Resource names should be obvious

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Format
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

### Status Codes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Rules

### Environment Variables
1. **Never commit .env** - Only commit .env.example
2. **All secrets in env** - API keys, database URLs, secrets
3. **Separate per environment** - dev, staging, production
4. **Rotate regularly** - Change secrets periodically

### Input Validation
1. **Validate at boundaries** - API endpoints, forms
2. **Use Zod schemas** - Type-safe validation
3. **Whitelist not blacklist** - Allow specific, reject unknown
4. **Sanitize user input** - Remove dangerous content

### Database
1. **Use Prisma** - Prevents SQL injection
2. **Never build SQL strings** - Always use ORM
3. **Parameterized queries** - If using raw SQL

### Authentication
1. **Hash passwords** - Never store plain text (Phase 1)
2. **HTTPS only** - Always
3. **Secure cookies** - httpOnly, secure, sameSite
4. **Rate limiting** - Prevent brute force (Phase 2)

## Testing Rules (Phase 1+)

### Unit Tests
1. **Test pure functions** - No API calls
2. **Mock dependencies** - Database, external services
3. **Test edge cases** - Null, empty, large values
4. **Keep tests simple** - One assertion per test

### Integration Tests
1. **Test API endpoints** - Real database
2. **Test workflows** - Multi-step processes
3. **Clean up after** - Reset database state
4. **Use fixtures** - Consistent test data

### E2E Tests (Phase 2+)
1. **Test user flows** - Complete workflows
2. **Use test accounts** - Don't use production data
3. **Keep independent** - Tests shouldn't depend on order

## Git Rules

### Commits
1. **Descriptive messages** - Explain what and why
2. **Atomic commits** - One logical change per commit
3. **Reference issues** - Link to relevant issues
4. **No large commits** - Keep commits reviewable

### Branches
1. **Feature branches** - One feature per branch
2. **Branch naming** - feature/name, fix/name, chore/name
3. **Keep branches short-lived** - Merge within 2-3 days
4. **No direct to main** - Always use pull requests

### PRs
1. **Clear description** - What, why, how to test
2. **Link to issues** - Connect to related work
3. **Self-review first** - Check your own code first
4. **Respond to feedback** - Address all comments

## Documentation Rules

### Code Documentation
1. **README.md** - Project overview
2. **CLAUDE.md** - Development guidelines
3. **API.md** - Endpoint documentation (Phase 1)
4. **.ai/** - Architecture and decisions

### Comments in Code
1. **Only when necessary** - Comment the WHY not the WHAT
2. **Keep up-to-date** - Delete outdated comments
3. **Link to issues** - Reference related work

## Performance Rules

### Frontend
1. **Code splitting** - Split by route
2. **Lazy loading** - Load images lazily
3. **Image optimization** - Use Next.js Image component
4. **CSS optimization** - Purge unused styles (Tailwind does this)

### Backend
1. **Query optimization** - Use indexes, avoid N+1
2. **Caching** - Cache expensive queries
3. **Connection pooling** - Database connection reuse
4. **Request logging** - Track slow requests

## Deployment Rules

### Before Deployment
1. **All tests pass** - Unit and integration
2. **Type checking passes** - No TypeScript errors
3. **Linting passes** - No ESLint errors
4. **Build succeeds** - Production build works
5. **Security scan** - No vulnerabilities

### Staging
1. **Test all features** - Before production
2. **Performance check** - Core Web Vitals
3. **Security check** - Audit logs review
4. **Smoke tests** - Critical paths work

### Production
1. **Gradual rollout** - Monitor closely
2. **Rollback plan** - Know how to revert
3. **Monitoring active** - Error tracking on
4. **Team aware** - Notify relevant parties

## Naming Conventions

### Variables
- `camelCase` - Regular variables
- `UPPER_CASE` - Constants
- `snake_case` - Environment variables

### Functions
- `camelCase` - Regular functions
- `use*` - React hooks
- `is*, has*, can*` - Boolean functions

### Classes/Types
- `PascalCase` - Classes and interfaces
- `Type` suffix - For type aliases
- `Props` suffix - For component props

### Constants
- `UPPER_SNAKE_CASE` - Global constants
- Defined at module top

## Dependencies Rules

### Adding Dependencies
1. **Approved list only** - Check CLAUDE.md for approved
2. **Minimize size** - Check package size
3. **Active maintenance** - Check last update
4. **Type support** - Must have TypeScript types
5. **No peer issues** - Check compatibility

### Updating Dependencies
1. **Regular updates** - Keep current (Phase 3)
2. **Test thoroughly** - Verify nothing breaks
3. **Update in batches** - Not all at once
4. **Security patches** - Apply immediately

## Review Standards

### Code Review
1. **Correctness** - Does it work?
2. **Quality** - Is it well-written?
3. **Security** - Are there security issues?
4. **Performance** - Is it efficient?
5. **Tests** - Is it tested?

### Review Process
1. **Automated checks** - Type, lint, tests
2. **Code review** - Manual review
3. **Approval** - At least one approval
4. **Merge** - Squash and merge

---

**Rules Version**: 1.0
**Last Updated**: Phase 0 Initialization
**Status**: Active
