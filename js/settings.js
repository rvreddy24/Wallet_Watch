// Contains the code for the settings page
// Add new functionality for managing categories and budget limits 

document.addEventListener('DOMContentLoaded', () => {
    const categoriesList = document.getElementById('categories-list');
    const addCategoryForm = document.getElementById('add-category-form');
    const exportDataBtn = document.getElementById('export-data');
    const clearDataBtn = document.getElementById('clear-data');

    // Initialize default categories if not exists
    if (!localStorage.getItem('settings')) {
        const defaultSettings = {
            categories: ['Salary', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Gas', 'Rent', 'Other']
        };
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }

    // Add Gas category if it doesn't exist
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    if (settings.categories && !settings.categories.includes('Gas')) {
        settings.categories.push('Gas');
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    // Add Rent category if it doesn't exist
    if (settings.categories && !settings.categories.includes('Rent')) {
        settings.categories.push('Rent');
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    function updateCategoriesList() {
        const settings = JSON.parse(localStorage.getItem('settings'));
        categoriesList.innerHTML = '';

        settings.categories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'category-item';
            categoryEl.innerHTML = `
                <span class="category-name">${category}</span>
                <button class="delete-btn" data-category="${category}">×</button>
            `;
            categoriesList.appendChild(categoryEl);
        });
    }

    addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCategory = document.getElementById('new-category').value.trim();
        
        if (newCategory) {
            const settings = JSON.parse(localStorage.getItem('settings'));
            if (!settings.categories.includes(newCategory)) {
                settings.categories.push(newCategory);
                localStorage.setItem('settings', JSON.stringify(settings));
                updateCategoriesList();
                addCategoryForm.reset();
            }
        }
    });

    categoriesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const categoryToDelete = e.target.dataset.category;
            const settings = JSON.parse(localStorage.getItem('settings'));
            settings.categories = settings.categories.filter(c => c !== categoryToDelete);
            localStorage.setItem('settings', JSON.stringify(settings));
            updateCategoriesList();
        }
    });

    exportDataBtn.addEventListener('click', () => {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Create CSV header
        let csvContent = 'Date,Description,Amount,Type,Category\n';
        
        // Add transaction data
        transactions.forEach(transaction => {
            const row = [
                transaction.date,
                `"${transaction.description}"`, // Wrap description in quotes to handle commas
                transaction.amount,
                transaction.type,
                transaction.category
            ].join(',');
            csvContent += row + '\n';
        });
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'budget-planner-transactions.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    });

    // Initial load
    updateCategoriesList();
}); 