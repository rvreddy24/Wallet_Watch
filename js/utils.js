// Shared utility functions
const utils = {
    // Local Storage functions
    storage: {
        get: (key) => {
            return JSON.parse(localStorage.getItem(key)) || null;
        },
        set: (key, value) => {
            localStorage.setItem(key, JSON.stringify(value));
        },
        remove: (key) => {
            localStorage.removeItem(key);
        }
    },

    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Get transactions
    getTransactions: () => {
        return utils.storage.get('transactions') || [];
    },

    // Save transactions
    saveTransactions: (transactions) => {
        utils.storage.set('transactions', transactions);
    },

    // Get settings
    getSettings: () => {
        return utils.storage.get('settings') || {
            categories: ['Salary', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Other'],
            monthlyLimit: 0,
            categoryLimits: {}
        };
    },

    // Save settings
    saveSettings: (settings) => {
        utils.storage.set('settings', settings);
    }
}; 