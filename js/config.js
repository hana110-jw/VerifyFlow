// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    INVOICE_SEARCH: (invoiceNumber) => `${API_BASE_URL}/invoice/${invoiceNumber}`,
    ADMIN_INVOICES: `${API_BASE_URL}/admin/invoices`,
    ADMIN_INVOICE: `${API_BASE_URL}/admin/invoice`,
    ADMIN_INVOICE_BY_ID: (id) => `${API_BASE_URL}/admin/invoice/${id}`,
    ADMIN_AUDIT_LOGS: `${API_BASE_URL}/admin/audit-logs`
};

// Storage Keys
const STORAGE_KEYS = {
    TOKEN: 'invoiceverify_token',
    USER: 'invoiceverify_user'
};
