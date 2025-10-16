const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Search invoice by number
router.get('/:invoice_number', authenticateToken, async (req, res) => {
  try {
    const { invoice_number } = req.params;

    // Log the search in audit logs
    await pool.query(
      'INSERT INTO audit_logs (user_id, invoice_number, action) VALUES ($1, $2, $3)',
      [req.user.id, invoice_number, 'SEARCH']
    );

    // Search for invoice
    const result = await pool.query(
      `SELECT 
        i.invoice_number, 
        i.bank_name, 
        i.account_number, 
        i.verified_at,
        u.username as verified_by_username
      FROM invoices i
      LEFT JOIN users u ON i.verified_by = u.id
      WHERE i.invoice_number = $1`,
      [invoice_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Invoice not found',
        message: 'No verified bank account information found for this invoice number'
      });
    }

    res.json({
      success: true,
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Invoice search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
