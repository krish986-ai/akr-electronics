# A.K.R Electronics - API Documentation

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2026-06-29

---

## Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Response Format](#response-format)
3. [Products API](#products-api)
4. [Categories API](#categories-api)
5. [Brands API](#brands-api)
6. [Cart API](#cart-api)
7. [Orders API](#orders-api)
8. [Address API](#address-api)
9. [Wishlist API](#wishlist-api)
10. [Admin APIs](#admin-apis)
11. [Error Codes](#error-codes)

---

## Base URL & Authentication

### Base URL

```
Development:  http://localhost:3000/api
Production:   https://api.akr-electronics.com/api
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Or via session cookie (automatically handled by browser).

### Role-Based Access

- `CUSTOMER`: Regular user (default)
- `ADMIN`: Administrative access (required for admin endpoints)

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response (200-299)

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

### Error Response (400+)

```json
{
  "success": false,
  "error": "Error code",
  "message": "Human readable error message"
}
```

### Pagination

```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

## Products API

### List All Products

```http
GET /api/products
```

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search by name or SKU
- `category` (string): Filter by category ID
- `brand` (string): Filter by brand ID
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort field - `name`, `price`, `rating`, `newest`
- `sortOrder` (string): `asc` or `desc`

**Example**:
```bash
curl "http://localhost:3000/api/products?page=1&limit=20&category=cat-1&sortBy=price&sortOrder=asc"
```

**Response**: List of 20 products with pagination

### Get Product Details

```http
GET /api/products/:id
```

**Parameters**:
- `id` (path): Product ID

**Response**: Single product object with full details

### Search Products

```http
GET /api/products/search?q=arduino
```

**Query Parameters**:
- `q` (string): Search query (required)
- `limit` (integer): Max results (default: 10)

**Response**: Array of matching products

---

## Categories API

### List All Categories

```http
GET /api/categories
```

**Query Parameters**:
- `limit` (integer): Results limit (default: 100)

**Response**: Array of all categories

### Get Category Details

```http
GET /api/categories/:id
```

**Parameters**:
- `id` (path): Category ID

**Response**: Single category object

---

## Brands API

### List All Brands

```http
GET /api/brands
```

**Query Parameters**:
- `limit` (integer): Results limit (default: 50)

**Response**: Array of all brands

### Get Brand Details

```http
GET /api/brands/:id
```

**Parameters**:
- `id` (path): Brand ID

**Response**: Single brand object with product count

---

## Cart API

### Get User Cart

```http
GET /api/cart
```

**Authentication**: Required (Customer or Admin)

**Response**: Current user's cart with items and totals

### Add to Cart

```http
POST /api/cart/items
```

**Body**:
```json
{
  "productId": "prod-1",
  "quantity": 2
}
```

**Response**: Updated cart

### Update Cart Item

```http
PATCH /api/cart/items/:itemId
```

**Body**:
```json
{
  "quantity": 5
}
```

**Response**: Updated cart

### Remove from Cart

```http
DELETE /api/cart/items/:itemId
```

**Response**: Updated cart

### Clear Cart

```http
DELETE /api/cart
```

**Response**: Empty cart confirmation

---

## Orders API

### List User Orders

```http
GET /api/orders
```

**Authentication**: Required

**Query Parameters**:
- `page` (integer): Page number
- `limit` (integer): Items per page
- `status` (string): Filter by status

**Response**: User's order history with pagination

### Get Order Details

```http
GET /api/orders/:id
```

**Authentication**: Required

**Parameters**:
- `id` (path): Order ID

**Response**: Complete order details including items, addresses, payment info

### Create Order

```http
POST /api/orders
```

**Authentication**: Required (Customer)

**Body**:
```json
{
  "shippingAddressId": "addr-1",
  "billingAddressId": "addr-1",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 2,
      "price": 499
    }
  ],
  "subtotal": 998,
  "tax": 180,
  "shippingCost": 100,
  "couponCode": "WELCOME20"
}
```

**Response**: Created order object

### Update Order (Admin Only)

```http
PUT /api/orders/:id
```

**Authentication**: Required (Admin only)

**Body**:
```json
{
  "status": "SHIPPED",
  "shippingTrackingId": "TRACK123456"
}
```

**Response**: Updated order

---

## Address API

### List User Addresses

```http
GET /api/addresses
```

**Authentication**: Required

**Response**: Array of user's saved addresses

### Create Address

```http
POST /api/addresses
```

**Authentication**: Required

**Body**:
```json
{
  "name": "Home",
  "phone": "+91-98765-43210",
  "email": "user@example.com",
  "street": "123 Main St",
  "city": "Delhi",
  "state": "Delhi",
  "postalCode": "110001",
  "country": "India",
  "type": "HOME",
  "isDefault": true
}
```

**Response**: Created address object

### Update Address

```http
PUT /api/addresses/:id
```

**Authentication**: Required

**Body**: Same as create, partial fields allowed

**Response**: Updated address

### Delete Address

```http
DELETE /api/addresses/:id
```

**Authentication**: Required

**Response**: Deletion confirmation

---

## Wishlist API

### Get User Wishlist

```http
GET /api/wishlist
```

**Authentication**: Required

**Response**: Array of wishlist items

### Add to Wishlist

```http
POST /api/wishlist
```

**Authentication**: Required

**Body**:
```json
{
  "productId": "prod-1"
}
```

**Response**: Added wishlist item

### Remove from Wishlist

```http
DELETE /api/wishlist/:productId
```

**Authentication**: Required

**Response**: Removal confirmation

---

## Admin APIs

### Admin Dashboard

```http
GET /api/admin/dashboard
```

**Authentication**: Required (Admin only)

**Response**:
```json
{
  "stats": {
    "totalProducts": 150,
    "totalOrders": 2345,
    "totalRevenue": 15000000,
    "totalCustomers": 1234,
    "ordersThisMonth": 456
  },
  "recentOrders": [ /* 5 recent orders */ ],
  "lowStockProducts": [ /* products below threshold */ ]
}
```

### Admin Products

```http
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
```

**Authentication**: Required (Admin only)

Admin full CRUD operations for products.

### Admin Customers

```http
GET /api/admin/customers
```

**Authentication**: Required (Admin only)

List all customers with details.

### Admin Orders

```http
GET /api/admin/orders
```

**Authentication**: Required (Admin only)

View all orders with filtering and pagination.

### Admin Settings

```http
GET /api/admin/settings
PUT /api/admin/settings
```

**Authentication**: Required (Admin only)

Manage store settings and configuration.

---

## Error Codes

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate entry |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal error |

### Error Response Examples

**Unauthorized**:
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication token required"
}
```

**Validation Error**:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request body",
  "details": {
    "quantity": "Must be a positive integer"
  }
}
```

**Not Found**:
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Product not found"
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **Admin**: 5000 requests per minute

Rate limit info is included in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1677123456
```

---

## Testing

### Using cURL

```bash
# Get products
curl http://localhost:3000/api/products

# Create order (requires auth)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [...]}'
```

### Using Postman

1. Import API collection from documentation
2. Set base URL to `http://localhost:3000/api`
3. Add auth token to Authorization tab
4. Test endpoints

---

## Changelog

**Version 1.0.0** (2026-06-29)
- Initial API documentation
- 40+ endpoints documented
- Complete authentication & authorization
- Admin API endpoints

---

**API Documentation Version**: 1.0.0  
**Last Updated**: 2026-06-29
