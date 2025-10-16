// Main page functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    const invoiceNumberInput = document.getElementById('invoiceNumber');
    const loadingState = document.getElementById('loadingState');
    const errorMessage = document.getElementById('errorMessage');
    const searchResults = document.getElementById('searchResults');

    // Handle search form submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const invoiceNumber = invoiceNumberInput.value.trim();
        if (!invoiceNumber) return;

        // Check if user is logged in
        if (!Auth.isLoggedIn()) {
            showError('Please log in to search for invoices');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        await searchInvoice(invoiceNumber);
    });

    async function searchInvoice(invoiceNumber) {
        // Show loading state
        loadingState.style.display = 'block';
        errorMessage.style.display = 'none';
        searchResults.style.display = 'none';

        try {
            const response = await Auth.fetchWithAuth(
                API_ENDPOINTS.INVOICE_SEARCH(invoiceNumber)
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to search invoice');
            }

            // Display results
            displayResults(data.invoice);
        } catch (error) {
            console.error('Search error:', error);
            showError(error.message || 'Failed to search invoice. Please try again.');
        } finally {
            loadingState.style.display = 'none';
        }
    }

    function displayResults(invoice) {
        // Populate result fields
        document.getElementById('resultInvoiceNumber').textContent = invoice.invoice_number;
        document.getElementById('resultBankName').textContent = invoice.bank_name;
        document.getElementById('resultAccountNumber').textContent = invoice.account_number;
        document.getElementById('resultVerifiedBy').textContent = invoice.verified_by_username || 'N/A';
        document.getElementById('resultVerifiedAt').textContent = formatDate(invoice.verified_at);

        // Show results
        searchResults.style.display = 'block';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
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
