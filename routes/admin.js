const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        i.id,
        i.invoice_number, 
        i.bank_name, 
        i.account_number, 
        i.verified_at,
        i.created_at,
        u.username as verified_by_username
      FROM invoices i
      LEFT JOIN users u ON i.verified_by = u.id
      ORDER BY i.created_at DESC`
    );

    res.json({
      success: true,
      invoices: result.rows
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new invoice
router.post('/invoice', async (req, res) => {
  try {
    const { invoice_number, bank_name, account_number } = req.body;

    if (!invoice_number || !bank_name || !account_number) {
      return res.status(400).json({ 
        error: 'Invoice number, bank name, and account number are required' 
      });
    }

    // Check if invoice already exists
    const existing = await pool.query(
      'SELECT id FROM invoices WHERE invoice_number = $1',
      [invoice_number]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Invoice number already exists' });
    }

    // Create invoice
    const result = await pool.query(
      `INSERT INTO invoices (invoice_number, bank_name, account_number, verified_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, invoice_number, bank_name, account_number, verified_at`,
      [invoice_number, bank_name, account_number, req.user.id]
    );

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, invoice_number, action) VALUES ($1, $2, $3)',
      [req.user.id, invoice_number, 'CREATE']
    );

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update invoice
router.put('/invoice/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { invoice_number, bank_name, account_number } = req.body;

    if (!invoice_number || !bank_name || !account_number) {
      return res.status(400).json({ 
        error: 'Invoice number, bank name, and account number are required' 
      });
    }

    // Check if invoice exists
    const existing = await pool.query(
      'SELECT invoice_number FROM invoices WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Update invoice
    const result = await pool.query(
      `UPDATE invoices 
       SET invoice_number = $1, bank_name = $2, account_number = $3, 
           verified_by = $4, verified_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, invoice_number, bank_name, account_number, verified_at`,
      [invoice_number, bank_name, account_number, req.user.id, id]
    );

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, invoice_number, action) VALUES ($1, $2, $3)',
      [req.user.id, invoice_number, 'UPDATE']
    );

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete invoice
router.delete('/invoice/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get invoice number for logging
    const invoice = await pool.query(
      'SELECT invoice_number FROM invoices WHERE id = $1',
      [id]
    );

    if (invoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Delete invoice
    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);

    // Log the action
    await pool.query(
      'INSERT INTO audit_logs (user_id, invoice_number, action) VALUES ($1, $2, $3)',
      [req.user.id, invoice.rows[0].invoice_number, 'DELETE']
    );

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT 
        al.id,
        al.invoice_number,
        al.action,
        al.timestamp,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM audit_logs');

    res.json({
      success: true,
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
