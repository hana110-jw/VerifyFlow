# InvoiceVerify Setup Guide

This guide will walk you through setting up InvoiceVerify locally and deploying it to production.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [Running the Application](#running-the-application)
4. [Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd VerifyFlow
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express (web framework)
- PostgreSQL driver
- JWT for authentication
- bcryptjs for password hashing
- And other dependencies

---

## Database Setup

### Step 1: Create PostgreSQL Database

Open PostgreSQL command line or pgAdmin and create a new database:

```sql
CREATE DATABASE invoiceverify;
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/invoiceverify

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (frontend URL)
FRONTEND_URL=http://localhost:5500
```

**Important:** Change the `JWT_SECRET` to a secure random string. You can generate one using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create all necessary tables (users, invoices, audit_logs)
- Create indexes for performance
- Create a default admin user (username: `admin`, password: `admin123`)
- Insert sample invoice data for testing

**⚠️ IMPORTANT:** Change the default admin password immediately after first login!

---

## Running the Application

### Start the Backend Server

For development with auto-reload:
```bash
npm run dev
```

For production:
```bash
npm start
```

The API will be available at `http://localhost:3000`

### Start the Frontend

You can serve the frontend in several ways:

**Option 1: Using VS Code Live Server**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

**Option 2: Using Python**
```bash
python -m http.server 5500
```

**Option 3: Using Node.js http-server**
```bash
npx http-server -p 5500
```

The frontend will be available at `http://localhost:5500`

### Test the Application

1. Open `http://localhost:5500` in your browser
2. Click "Login" and use the default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Try searching for a sample invoice: `INV-2025-001`
4. Access the admin dashboard to manage invoices

---

## Deployment

### Deploy Backend to Railway

Railway provides free PostgreSQL hosting and easy deployment.

#### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub

#### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your repository

#### Step 3: Add PostgreSQL Database
1. In your project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a database

#### Step 4: Configure Environment Variables
1. Click on your service
2. Go to "Variables" tab
3. Add the following variables:
   ```
   DATABASE_URL=<copy from PostgreSQL service>
   JWT_SECRET=<your-secure-secret>
   NODE_ENV=production
   FRONTEND_URL=<your-vercel-url>
   ```

#### Step 5: Initialize Database
1. Go to your PostgreSQL service
2. Click "Connect"
3. Use the connection string to connect via psql or pgAdmin
4. Run the initialization script locally pointing to Railway DB:
   ```bash
   DATABASE_URL=<railway-postgres-url> npm run init-db
   ```

#### Step 6: Deploy
Railway will automatically deploy your application. Note the URL provided.

### Deploy Frontend to Vercel

Vercel provides free static site hosting with global CDN.

#### Step 1: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com/)
2. Sign up with GitHub

#### Step 2: Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Vercel will auto-detect the configuration

#### Step 3: Configure Build Settings
- **Framework Preset:** Other
- **Root Directory:** ./
- **Build Command:** (leave empty)
- **Output Directory:** ./

#### Step 4: Update API Configuration
Before deploying, update `js/config.js` with your Railway backend URL:

```javascript
const API_BASE_URL = 'https://your-railway-app.railway.app/api';
```

#### Step 5: Deploy
Click "Deploy" and Vercel will build and deploy your frontend.

#### Step 6: Update Backend CORS
Update the `FRONTEND_URL` environment variable in Railway with your Vercel URL.

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check DATABASE_URL in `.env` file
- Verify PostgreSQL is listening on port 5432

### JWT Token Errors

**Problem:** Invalid or expired token
```
Error: Invalid or expired token
```

**Solution:**
- Clear browser localStorage
- Log in again
- Ensure JWT_SECRET is the same across restarts

### CORS Errors

**Problem:** CORS policy blocking requests
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
- Update FRONTEND_URL in backend `.env`
- Restart the backend server
- Clear browser cache

### Port Already in Use

**Problem:** Port 3000 already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
- Change PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  ```

### Sample Data Not Loading

**Problem:** No invoices showing up after initialization

**Solution:**
- Re-run the initialization script: `npm run init-db`
- Check database logs for errors
- Manually insert test data via SQL

---

## Next Steps

After successful setup:

1. **Change Default Password:** Log in as admin and change the password
2. **Add Real Data:** Remove sample invoices and add your real invoice data
3. **Configure Backups:** Set up automated database backups
4. **Monitor Logs:** Check application logs regularly
5. **Security Audit:** Review security settings before production use

## Support

For issues or questions:
- Check the [README.md](README.md) for general information
- Review API documentation in the code comments
- Open an issue on GitHub

---

**Happy Verifying! 🚀**
