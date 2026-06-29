# PHASE 11 IMPLEMENTATION PLAN
## Production Payment & Security System

**Status**: Starting Implementation  
**Target**: Full production-grade system ready for real customers  
**Scope**: 8 major components across payments, security, and services  

---

## OBJECTIVE

Transform A.K.R Electronics from Phase 10 (API/Database Complete) to Phase 11 (Production Ready) by implementing:

1. **Razorpay Payment Integration** (Test Mode)
2. **Order Lifecycle Management** (State Machine)
3. **Invoice Generation System** (PDF + GST)
4. **Email Notification Service** (Templates)
5. **Production Security** (CSRF, XSS, Rate Limiting)
6. **Centralized Logging** (All events)
7. **Error Handling** (Graceful failures)
8. **Comprehensive Testing** (All flows)

---

## PHASE 11.1: RAZORPAY PAYMENT INTEGRATION

### Implementation Steps

1. **Setup Razorpay Environment**
   - Add Razorpay keys to .env.local (Test Mode)
   - Create Razorpay client library
   - Verify webhook URLs

2. **Create Payment APIs**
   - `POST /api/payments/create-order` - Create Razorpay order
   - `POST /api/payments/verify` - Verify payment
   - `POST /api/payments/webhook` - Handle webhooks
   - `GET /api/payments/status/:orderId` - Check payment status

3. **Payment Flow**
   ```
   Create Order (Firestore) 
   → Create Razorpay Order 
   → Payment Checkout (Frontend) 
   → Verify Payment (Server-side)
   → Update Order Status 
   → Send Confirmation Email
   ```

4. **Security**
   - Never trust client-side payment results
   - Verify every payment on server
   - Validate webhook signatures
   - Store transaction hashes

---

## PHASE 11.2: ORDER LIFECYCLE MANAGEMENT

### Order States (State Machine)

```
PENDING → CONFIRMED → PAID → PACKED → SHIPPED → DELIVERED
         ↓
       CANCELLED
         ↓
    REFUND_REQUESTED → REFUNDED
```

### Implementation

1. **Create Order Status Service**
   - State transition validation
   - Prevent invalid transitions
   - Log all state changes

2. **Create APIs**
   - Update order status (admin only)
   - Get order status
   - Get order timeline
   - Cancel order (customer)
   - Request refund (customer)

3. **Features**
   - Automatic timestamp updates
   - Prevent concurrent updates
   - Full audit trail

---

## PHASE 11.3: INVOICE GENERATION

### Implementation

1. **Create Invoice Service**
   - Generate from order data
   - Include GST calculations
   - Professional formatting
   - PDF generation support

2. **Invoice Contents**
   - Order number
   - Date & Time
   - Customer details (name, email, phone)
   - Billing & shipping addresses
   - Product list (name, quantity, price)
   - Subtotal, taxes, shipping
   - Total amount
   - Payment status
   - Payment method & ID

3. **APIs**
   - `GET /api/invoices/:orderId` - Get invoice
   - `GET /api/invoices/:orderId/download` - PDF download
   - Store invoices in Firestore

---

## PHASE 11.4: EMAIL NOTIFICATION SERVICE

### Email Templates

1. **Registration** - Welcome email with verification link
2. **Email Verification** - Verification code
3. **Password Reset** - Reset link
4. **Order Confirmation** - New order details
5. **Payment Success** - Payment received
6. **Order Shipped** - Tracking information
7. **Order Delivered** - Delivery confirmation
8. **Contact Form** - Thank you + admin notification

### Implementation

1. **Create Email Service**
   - Template engine (EJS or Handlebars)
   - Support for HTML & plain text
   - Variable substitution

2. **Create Email Queue** (Future: Bull/Redis)
   - Queue emails for sending
   - Retry logic
   - Rate limiting

3. **Features**
   - Placeholder support (if SMTP not configured)
   - Log all emails sent
   - Support multiple providers (Nodemailer, SendGrid)

---

## PHASE 11.5: SECURITY HARDENING

### Implement

1. **CSRF Protection**
   - CSRF token generation
   - Token validation middleware
   - Cookie validation

2. **XSS Protection**
   - Input sanitization
   - Content Security Headers
   - React's built-in XSS protection

3. **Rate Limiting**
   - Global rate limit middleware
   - Per-endpoint limits
   - Per-IP limits
   - Exponential backoff

4. **Secure Headers**
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security
   - Content-Security-Policy

5. **Input Validation**
   - Server-side validation (Zod)
   - Sanitization of all inputs
   - SQL injection prevention (Firestore native)
   - XSS prevention

6. **API Security**
   - Authentication middleware
   - Authorization checks
   - Role-based access control
   - Secure environment variables

7. **Admin Protection**
   - Admin-only route middleware
   - 2FA ready (structure in place)
   - Audit logging of admin actions

---

## PHASE 11.6: CENTRALIZED LOGGING

### Create Logger Service

```typescript
interface LogEntry {
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category: string;
  message: string;
  data?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
}
```

### Categories to Log

1. **Authentication** - login, logout, registration, password reset
2. **Payments** - order creation, payment attempts, verification
3. **Orders** - status changes, cancellations, refunds
4. **Admin Actions** - products CRUD, settings changes, user management
5. **Security** - failed logins, rate limit hits, validation errors
6. **Errors** - exceptions, 5xx responses
7. **Warnings** - unusual patterns, deprecated usage

### Storage
- Firestore collection: `logs`
- Indexes by: timestamp, level, category, userId
- Retention: 90 days (configurable)

---

## PHASE 11.7: ERROR HANDLING

### Create Error Handler Service

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}
```

### Error Types

1. **ValidationError** (400) - Input validation failed
2. **AuthenticationError** (401) - Not authenticated
3. **AuthorizationError** (403) - Not authorized
4. **NotFoundError** (404) - Resource not found
5. **ConflictError** (409) - Conflict (duplicate, etc)
6. **RateLimitError** (429) - Rate limit exceeded
7. **ServerError** (500) - Internal server error
8. **PaymentError** (402) - Payment failed

### Handlers

- Global error middleware
- Graceful error responses
- Error logging
- Error recovery where possible

---

## PHASE 11.8: TESTING & VALIDATION

### Test Coverage

1. **Payment Flow Tests**
   - Create order
   - Verify payment success
   - Verify payment failure
   - Webhook verification
   - Refund flow

2. **Order Lifecycle Tests**
   - State transitions
   - Invalid transitions prevented
   - Timeline tracking
   - Status updates

3. **Security Tests**
   - CSRF protection
   - Rate limiting
   - Authorization checks
   - Input validation

4. **Build & Code Quality**
   - TypeScript compilation
   - ESLint passing
   - No warnings/errors

---

## IMPLEMENTATION CHECKLIST

### Phase 11.1: Payments
- [ ] Razorpay client setup
- [ ] Create order endpoint
- [ ] Payment verification endpoint
- [ ] Webhook endpoint
- [ ] Payment status endpoint
- [ ] Secure server-side verification

### Phase 11.2: Order Management
- [ ] Order status service
- [ ] State machine validation
- [ ] Status update APIs
- [ ] Order timeline
- [ ] Cancellation logic
- [ ] Refund logic

### Phase 11.3: Invoices
- [ ] Invoice service
- [ ] Invoice generation
- [ ] PDF generation
- [ ] Invoice APIs
- [ ] Invoice storage

### Phase 11.4: Email
- [ ] Email service
- [ ] Email templates (8 types)
- [ ] Email queue
- [ ] Test mode (console logging)
- [ ] Placeholder emails

### Phase 11.5: Security
- [ ] CSRF protection
- [ ] XSS protection headers
- [ ] Rate limiting middleware
- [ ] Secure headers middleware
- [ ] Input sanitization
- [ ] API security checks
- [ ] Admin route protection

### Phase 11.6: Logging
- [ ] Logger service
- [ ] Log storage (Firestore)
- [ ] Log categories
- [ ] Log retrieval APIs
- [ ] Admin log viewer

### Phase 11.7: Error Handling
- [ ] Error handler service
- [ ] Error types
- [ ] Global error middleware
- [ ] Graceful error responses
- [ ] Error logging

### Phase 11.8: Testing
- [ ] Payment tests
- [ ] Order tests
- [ ] Security tests
- [ ] Build validation
- [ ] Type checking
- [ ] Linting

---

## GIT COMMIT STRATEGY

```
Phase 11.1: Razorpay payment integration
Phase 11.2: Order lifecycle management
Phase 11.3: Invoice generation system
Phase 11.4: Email notification service
Phase 11.5: Production security hardening
Phase 11.6: Centralized logging system
Phase 11.7: Error handling & recovery
Phase 11.8: Testing & validation
Phase 11: Production readiness summary
```

---

## TIMELINE ESTIMATE

| Component | Estimate | Status |
|-----------|----------|--------|
| Payments | 3-4 hours | Pending |
| Orders | 2-3 hours | Pending |
| Invoices | 2-3 hours | Pending |
| Email | 2-3 hours | Pending |
| Security | 2-3 hours | Pending |
| Logging | 1-2 hours | Pending |
| Error Handling | 1-2 hours | Pending |
| Testing | 3-4 hours | Pending |
| **Total** | **18-24 hours** | **In Progress** |

---

## SUCCESS CRITERIA

- ✅ Razorpay Test Mode working
- ✅ Payment verification secure
- ✅ Orders update correctly
- ✅ Invoices generate properly
- ✅ Emails sent (or logged)
- ✅ Security protections active
- ✅ Logging working
- ✅ All tests passing
- ✅ Build successful
- ✅ Documentation updated

---

## DEPENDENCIES

- Razorpay SDK
- PDF generation library
- Email template engine
- Rate limiting middleware
- Crypto for signature verification

---

**Next**: Phase 11.1 - Razorpay Integration Start

