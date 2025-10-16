# InvoiceVerify API Documentation

Base URL: `http://localhost:3000/api` (development) or `https://your-app.railway.app/api` (production)

## Table of Contents
1. [Authentication](#authentication)
2. [Invoice Operations](#invoice-operations)
3. [Admin Operations](#admin-operations)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Authentication

All API requests (except login) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing username or password
- `401 Unauthorized` - Invalid credentials

---

### POST /auth/register

Register a new user (admin only).

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "username": "newuser",
    "role": "user",
    "created_at": "2025-10-16T05:14:49.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid role
- `403 Forbidden` - Not an admin user
- `409 Conflict` - Username already exists

---

### GET /auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

---

## Invoice Operations

### GET /invoice/:invoice_number

Search for an invoice by its number.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**URL Parameters:**
- `invoice_number` - The invoice number to search for (e.g., INV-2025-001)

**Example Request:**
```
GET /api/invoice/INV-2025-001
```

**Response (200 OK):**
```json
{
  "success": true,
  "invoice": {
    "invoice_number": "INV-2025-001",
    "bank_name": "Bank of America",
    "account_number": "1234567890",
    "verified_at": "2025-10-16T05:14:49.000Z",
    "verified_by_username": "admin"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Not logged in
- `404 Not Found` - Invoice not found
- `500 Internal Server Error` - Server error

**Side Effects:**
- Creates an audit log entry with action "SEARCH"

---

## Admin Operations

All admin operations require an admin role.

### GET /admin/invoices

Get all invoices.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "invoices": [
    {
      "id": "uuid",
      "invoice_number": "INV-2025-001",
      "bank_name": "Bank of America",
      "account_number": "1234567890",
      "verified_at": "2025-10-16T05:14:49.000Z",
      "created_at": "2025-10-16T05:14:49.000Z",
      "verified_by_username": "admin"
    }
  ]
}
```

**Error Responses:**
- `403 Forbidden` - Not an admin user

---

### POST /admin/invoice

Create a new invoice.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "invoice_number": "INV-2025-004",
  "bank_name": "Citibank",
  "account_number": "9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-2025-004",
    "bank_name": "Citibank",
    "account_number": "9876543210",
    "verified_at": "2025-10-16T05:14:49.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `403 Forbidden` - Not an admin user
- `409 Conflict` - Invoice number already exists

**Side Effects:**
- Creates an audit log entry with action "CREATE"

---

### PUT /admin/invoice/:id

Update an existing invoice.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id` - The UUID of the invoice to update

**Request Body:**
```json
{
  "invoice_number": "INV-2025-004",
  "bank_name": "Citibank Updated",
  "account_number": "9876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "invoice": {
    "id": "uuid",
    "invoice_number": "INV-2025-004",
    "bank_name": "Citibank Updated",
    "account_number": "9876543210",
    "verified_at": "2025-10-16T05:20:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Invoice not found

**Side Effects:**
- Updates verified_at timestamp
- Creates an audit log entry with action "UPDATE"

---

### DELETE /admin/invoice/:id

Delete an invoice.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id` - The UUID of the invoice to delete

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden` - Not an admin user
- `404 Not Found` - Invoice not found

**Side Effects:**
- Creates an audit log entry with action "DELETE"

---

### GET /admin/audit-logs

Get audit logs with pagination.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `limit` (optional) - Number of records to return (default: 100)
- `offset` (optional) - Number of records to skip (default: 0)

**Example Request:**
```
GET /api/admin/audit-logs?limit=50&offset=0
```

**Response (200 OK):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "invoice_number": "INV-2025-001",
      "action": "SEARCH",
      "timestamp": "2025-10-16T05:14:49.000Z",
      "username": "admin"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Error Responses:**
- `403 Forbidden` - Not an admin user

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes
- **Max Requests:** 100 per IP address
- **Response when exceeded:**
  ```json
  {
    "error": "Too many requests from this IP, please try again later."
  }
  ```

---

## Security Features

1. **JWT Authentication:** All protected endpoints require valid JWT tokens
2. **Password Hashing:** Passwords are hashed using bcrypt with salt rounds
3. **Role-Based Access Control:** Admin operations restricted to admin users
4. **Rate Limiting:** Prevents brute force and DoS attacks
5. **Helmet.js:** Security headers for HTTP responses
6. **CORS:** Configured to allow only specified frontend origins
7. **SQL Injection Prevention:** Parameterized queries throughout

---

## Example Usage with cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Search Invoice
```bash
curl -X GET http://localhost:3000/api/invoice/INV-2025-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Invoice (Admin)
```bash
curl -X POST http://localhost:3000/api/admin/invoice \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-2025-005",
    "bank_name": "HSBC",
    "account_number": "1122334455"
  }'
```

---

## Example Usage with JavaScript

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const { token } = await loginResponse.json();

// Search Invoice
const searchResponse = await fetch('http://localhost:3000/api/invoice/INV-2025-001', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { invoice } = await searchResponse.json();
console.log(invoice);
```

---

For more information, see the [README.md](README.md) and [SETUP.md](SETUP.md).
