// Contains the code for the dashboard page
// Move the relevant parts from your existing script.js 

document.addEventListener('DOMContentLoaded', () => {
    const budgetForm = document.getElementById('budget-form');
    const recentTransactionList = document.getElementById('recent-transaction-list');

    // Set default date to today
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    function updateDashboard() {
        const transactions = utils.getTransactions();
        let totalIncome = 0;
        let totalExpenses = 0;

        // Calculate totals
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });

        // Update summary
        document.getElementById('income').textContent = utils.formatCurrency(totalIncome);
        document.getElementById('expenses').textContent = utils.formatCurrency(totalExpenses);
        document.getElementById('balance').textContent = utils.formatCurrency(totalIncome - totalExpenses);

        // Update recent transactions
        updateTransactionsList();
    }

    function updateTransactionsList() {
        const transactions = utils.getTransactions();
        const recentTransactions = transactions.slice(-5).reverse();
        recentTransactionList.innerHTML = '';
        
        recentTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.className = 'transaction-item';
            
            const amountClass = transaction.type === 'income' ? 'income' : 'expense';
            const amountPrefix = transaction.type === 'income' ? '+' : '-';
            
            li.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-date">${utils.formatDate(transaction.date)}</span>
                    <span class="transaction-description">${transaction.description}</span>
                    <span class="transaction-category">${transaction.category}</span>
                    <span class="transaction-amount ${amountClass}">${amountPrefix}${utils.formatCurrency(transaction.amount)}</span>
                </div>
            `;

            recentTransactionList.appendChild(li);
        });

        // Update quick stats
        updateQuickStats(transactions);
    }

    function updateQuickStats(transactions) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        let monthlyExpenses = {};
        let monthlyTransactionCount = 0;
        let monthlyTotal = 0;

        transactions.forEach(transaction => {
            if (transaction.date.startsWith(currentMonth)) {
                monthlyTransactionCount++;
                if (transaction.type === 'expense') {
                    monthlyExpenses[transaction.category] = (monthlyExpenses[transaction.category] || 0) + transaction.amount;
                    monthlyTotal += transaction.amount;
                }
            }
        });

        // Find top expense category
        const topCategory = Object.entries(monthlyExpenses)
            .sort(([,a], [,b]) => b - a)[0];

        // Calculate daily average
        const daysInMonth = new Date(currentMonth + '-01').getDate();
        const dailyAverage = monthlyTotal / daysInMonth;

        // Update stats
        document.getElementById('top-expense-category').textContent = topCategory 
            ? `${topCategory[0]} (${utils.formatCurrency(topCategory[1])})`
            : 'No expenses';
        document.getElementById('daily-average').textContent = utils.formatCurrency(dailyAverage);
        document.getElementById('transaction-count').textContent = monthlyTransactionCount;
    }

    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const transaction = {
            id: Date.now(),
            description: document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value),
            type: document.getElementById('type').value,
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        const transactions = utils.getTransactions();
        transactions.push(transaction);
        utils.saveTransactions(transactions);

        budgetForm.reset();
        dateInput.value = today;
        updateDashboard();
    });

    // Type selector functionality
    const typeButtons = document.querySelectorAll('.type-btn');
    const typeInput = document.getElementById('type');

    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            typeInput.value = button.dataset.type;
        });
    });

    // Initial dashboard update
    updateDashboard();

    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'transactions') {
            updateDashboard();
        }
    });
}); 