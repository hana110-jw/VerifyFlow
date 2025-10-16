require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database initialization...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create invoices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(255) UNIQUE NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        verified_by UUID REFERENCES users(id),
        verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Invoices table created');

    // Create audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        invoice_number VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Audit logs table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_invoice_number ON invoices(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    `);
    console.log('✅ Indexes created');

    // Check if admin user exists
    const adminCheck = await client.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('✅ Default admin user created (username: admin, password: admin123)');
      console.log('⚠️  IMPORTANT: Change the admin password immediately!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Insert sample data for testing (optional)
    const invoiceCheck = await client.query('SELECT COUNT(*) FROM invoices');
    if (parseInt(invoiceCheck.rows[0].count) === 0) {
      const adminUser = await client.query('SELECT id FROM users WHERE username = $1', ['admin']);
      const adminId = adminUser.rows[0].id;

      await client.query(`
        INSERT INTO invoices (invoice_number, bank_name, account_number, verified_by)
        VALUES 
          ('INV-2025-001', 'Bank of America', '1234567890', $1),
          ('INV-2025-002', 'Chase Bank', '0987654321', $1),
          ('INV-2025-003', 'Wells Fargo', '5555666677', $1)
      `, [adminId]);
      console.log('✅ Sample invoices created');
    }

    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
