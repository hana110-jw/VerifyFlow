// Admin page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
        window.location.href = 'login.html';
        return;
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}Tab`).classList.add('active');
            
            // Load data for the active tab
            if (tabName === 'invoices') {
                loadInvoices();
            } else if (tabName === 'audit') {
                loadAuditLogs();
            }
        });
    });

    // Modal handling
    const modal = document.getElementById('invoiceModal');
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const invoiceForm = document.getElementById('invoiceForm');

    addInvoiceBtn.addEventListener('click', () => {
        openModal();
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveInvoice();
    });

    // Load initial data
    loadInvoices();

    // Invoice Management Functions
    async function loadInvoices() {
        const loading = document.getElementById('invoicesLoading');
        const error = document.getElementById('invoicesError');
        const table = document.getElementById('invoicesTable');
        const tbody = document.getElementById('invoicesTableBody');

        loading.style.display = 'block';
        error.style.display = 'none';
        table.style.display = 'none';

        try {
            const response = await Auth.fetchWithAuth(API_ENDPOINTS.ADMIN_INVOICES);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load invoices');
            }

            // Populate table
            tbody.innerHTML = '';
            data.invoices.forEach(invoice => {
                const row = createInvoiceRow(invoice);
                tbody.appendChild(row);
            });

            table.style.display = 'table';
        } catch (err) {
            console.error('Load invoices error:', err);
            error.textContent = err.message || 'Failed to load invoices';
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    }

    function createInvoiceRow(invoice) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.bank_name}</td>
            <td>${invoice.account_number}</td>
            <td>${invoice.verified_by_username || 'N/A'}</td>
            <td>${formatDate(invoice.verified_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" title="Edit" data-id="${invoice.id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon delete" title="Delete" data-id="${invoice.id}" data-number="${invoice.invoice_number}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        // Add event listeners
        tr.querySelector('.edit').addEventListener('click', () => editInvoice(invoice));
        tr.querySelector('.delete').addEventListener('click', () => deleteInvoice(invoice.id, invoice.invoice_number));

        return tr;
    }

    function openModal(invoice = null) {
        const modalTitle = document.getElementById('modalTitle');
        const invoiceId = document.getElementById('invoiceId');
        const invoiceNumber = document.getElementById('modalInvoiceNumber');
        const bankName = document.getElementById('modalBankName');
        const accountNumber = document.getElementById('modalAccountNumber');
        const modalError = document.getElementById('modalError');

        modalError.style.display = 'none';

        if (invoice) {
            // Edit mode
            modalTitle.textContent = 'Edit Invoice';
            invoiceId.value = invoice.id;
            invoiceNumber.value = invoice.invoice_number;
            bankName.value = invoice.bank_name;
            accountNumber.value = invoice.account_number;
        } else {
            // Add mode
            modalTitle.textContent = 'Add Invoice';
            invoiceId.value = '';
            invoiceNumber.value = '';
            bankName.value = '';
            accountNumber.value = '';
        }

        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        document.getElementById('invoiceForm').reset();
    }

    function editInvoice(invoice) {
        openModal(invoice);
    }

    async function saveInvoice() {
        const invoiceId = document.getElementById('invoiceId').value;
        const invoiceNumber = document.getElementById('modalInvoiceNumber').value.trim();
        const bankName = document.getElementById('modalBankName').value.trim();
        const accountNumber = document.getElementById('modalAccountNumber').value.trim();
        const modalError = document.getElementById('modalError');
        const saveBtn = document.getElementById('saveBtn');
        const saveBtnText = document.getElementById('saveBtnText');
        const saveBtnSpinner = document.getElementById('saveBtnSpinner');

        if (!invoiceNumber || !bankName || !accountNumber) {
            modalError.textContent = 'All fields are required';
            modalError.style.display = 'block';
            return;
        }

        // Show loading
        saveBtn.disabled = true;
        saveBtnText.style.display = 'none';
        saveBtnSpinner.style.display = 'block';
        modalError.style.display = 'none';

        try {
            const url = invoiceId 
                ? API_ENDPOINTS.ADMIN_INVOICE_BY_ID(invoiceId)
                : API_ENDPOINTS.ADMIN_INVOICE;
            
            const method = invoiceId ? 'PUT' : 'POST';

            const response = await Auth.fetchWithAuth(url, {
                method,
                body: JSON.stringify({
                    invoice_number: invoiceNumber,
                    bank_name: bankName,
                    account_number: accountNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save invoice');
            }

            // Close modal and reload invoices
            closeModal();
            loadInvoices();
        } catch (err) {
            console.error('Save invoice error:', err);
            modalError.textContent = err.message || 'Failed to save invoice';
            modalError.style.display = 'block';
        } finally {
            saveBtn.disabled = false;
            saveBtnText.style.display = 'block';
            saveBtnSpinner.style.display = 'none';
        }
    }

    async function deleteInvoice(id, invoiceNumber) {
        if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
            return;
        }

        try {
            const response = await Auth.fetchWithAuth(
                API_ENDPOINTS.ADMIN_INVOICE_BY_ID(id),
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete invoice');
            }

            loadInvoices();
        } catch (err) {
            console.error('Delete invoice error:', err);
            alert(err.message || 'Failed to delete invoice');
        }
    }

    // Audit Logs Functions
    async function loadAuditLogs() {
        const loading = document.getElementById('auditLoading');
        const error = document.getElementById('auditError');
        const table = document.getElementById('auditTable');
        const tbody = document.getElementById('auditTableBody');

        loading.style.display = 'block';
        error.style.display = 'none';
        table.style.display = 'none';

        try {
            const response = await Auth.fetchWithAuth(API_ENDPOINTS.ADMIN_AUDIT_LOGS);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load audit logs');
            }

            // Populate table
            tbody.innerHTML = '';
            data.logs.forEach(log => {
                const row = createAuditRow(log);
                tbody.appendChild(row);
            });

            table.style.display = 'table';
        } catch (err) {
            console.error('Load audit logs error:', err);
            error.textContent = err.message || 'Failed to load audit logs';
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    }

    function createAuditRow(log) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.username || 'N/A'}</td>
            <td>${log.invoice_number || 'N/A'}</td>
            <td><span class="badge">${log.action}</span></td>
            <td>${formatDate(log.timestamp)}</td>
        `;
        return tr;
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
