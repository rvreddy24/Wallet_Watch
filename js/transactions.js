// Contains the code for the transactions page
// Move the relevant parts from your existing script.js 

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');
    const transactionsList = document.getElementById('transactionsList');

    function updateTransactionsList() {
        let transactions = utils.getTransactions();
        
        // Apply search filter
        if (searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            transactions = transactions.filter(transaction => 
                transaction.description.toLowerCase().includes(searchTerm) ||
                transaction.category.toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        if (categoryFilter.value) {
            transactions = transactions.filter(transaction => 
                transaction.category.toLowerCase() === categoryFilter.value.toLowerCase()
            );
        }

        // Apply type filter
        if (typeFilter.value) {
            transactions = transactions.filter(transaction => 
                transaction.type === typeFilter.value
            );
        }

        // Apply sorting
        switch (sortFilter.value) {
            case 'latest':
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'highest':
                transactions.sort((a, b) => b.amount - a.amount);
                break;
            case 'lowest':
                transactions.sort((a, b) => a.amount - b.amount);
                break;
        }

        // Render transactions
        transactionsList.innerHTML = '';
        
        transactions.forEach(transaction => {
            const amountClass = transaction.type === 'income' ? 'income' : 'expense';
            const amountPrefix = transaction.type === 'income' ? '+' : '-';
            
            const transactionRow = document.createElement('div');
            transactionRow.className = 'transaction-row';
            transactionRow.innerHTML = `
                <span class="transaction-date">${utils.formatDate(transaction.date)}</span>
                <span class="transaction-description">${transaction.description}</span>
                <span class="transaction-category">${transaction.category}</span>
                <span class="transaction-amount ${amountClass}">${amountPrefix}${utils.formatCurrency(transaction.amount)}</span>
                <div class="transaction-actions">
                    <button class="delete-btn" data-id="${transaction.id}">×</button>
                </div>
            `;

            transactionsList.appendChild(transactionRow);
        });
    }

    // Event listeners for filters
    searchInput.addEventListener('input', updateTransactionsList);
    categoryFilter.addEventListener('change', updateTransactionsList);
    typeFilter.addEventListener('change', updateTransactionsList);
    sortFilter.addEventListener('change', updateTransactionsList);

    // Delete transaction functionality
    transactionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const transactionId = parseInt(e.target.dataset.id);
            if (confirm('Are you sure you want to delete this transaction?')) {
                let transactions = utils.getTransactions();
                transactions = transactions.filter(t => t.id !== transactionId);
                utils.saveTransactions(transactions);
                updateTransactionsList();
            }
        }
    });

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'transactions') {
            updateTransactionsList();
        }
    });

    // Initial load
    updateTransactionsList();
}); 