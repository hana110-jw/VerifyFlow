# InvoiceVerify

A secure web-based service designed to reduce fraud risks in international trade by verifying bank account information against invoice numbers.

## Problem Statement

In international transactions, fraudulent invoice modifications and hacked email communications often lead to payments being sent to wrong bank accounts. InvoiceVerify provides a quick and reliable way to confirm that a given invoice number corresponds to the correct, verified bank account information.

## Features

- 🔍 **Invoice Search**: Quick lookup of verified bank account information
- 🔐 **Secure Authentication**: JWT-based user authentication
- 👨‍💼 **Admin Dashboard**: Upload and manage invoice-bank mappings
- 📊 **Audit Logging**: Complete search history for compliance
- 🛡️ **Security**: Rate limiting, helmet protection, password hashing

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Authentication**: JWT + bcrypt
- **Deployment**: Railway (backend + DB) + Vercel (frontend)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VerifyFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your database credentials and JWT secret.

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Open the application**
   - Backend API: http://localhost:3000
   - Frontend: Open `index.html` in your browser or use a local server

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)

### Invoice Operations
- `GET /api/invoice/:invoice_number` - Search invoice by number
- `POST /api/admin/invoice` - Create new invoice record (admin only)
- `PUT /api/admin/invoice/:id` - Update invoice record (admin only)
- `DELETE /api/admin/invoice/:id` - Delete invoice record (admin only)

### Admin
- `GET /api/admin/invoices` - List all invoices (admin only)
- `GET /api/admin/audit-logs` - View audit logs (admin only)

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `role` (VARCHAR: 'user' or 'admin')
- `created_at` (TIMESTAMP)

### Invoices Table
- `id` (UUID, Primary Key)
- `invoice_number` (VARCHAR, Unique)
- `bank_name` (VARCHAR)
- `account_number` (VARCHAR)
- `verified_by` (UUID, Foreign Key → users.id)
- `verified_at` (TIMESTAMP)

### Audit Logs Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `invoice_number` (VARCHAR)
- `action` (VARCHAR)
- `timestamp` (TIMESTAMP)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Rate limiting to prevent abuse
- Helmet.js for HTTP header security
- CORS configuration
- SQL injection prevention with parameterized queries

## Deployment

### Railway (Backend + Database)

1. Create a new project on Railway
2. Add PostgreSQL database service
3. Add Node.js service and connect to GitHub
4. Set environment variables
5. Deploy

### Vercel (Frontend)

1. Create a new project on Vercel
2. Connect to GitHub repository
3. Set build settings to serve static files
4. Deploy

## Usage

### For Regular Users

1. Log in with your credentials
2. Enter an invoice number in the search box
3. View verified bank account information
4. Confirm details before making wire transfer

### For Admins

1. Log in with admin credentials
2. Access the admin dashboard
3. Upload new invoice-bank mappings
4. Verify and manage existing records
5. Review audit logs for compliance

## Success Metrics

- ✅ Search latency < 300ms
- ✅ 100% verified data accuracy
- ✅ <0.1% system downtime

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@invoiceverify.com or open an issue in the repository.
