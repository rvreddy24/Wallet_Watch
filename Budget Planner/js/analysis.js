// Contains the code for the analysis page
// Move the relevant parts from your existing script.js 

document.addEventListener('DOMContentLoaded', () => {
    let expenseChart, trendChart;

    function initializeCharts() {
        // Expense Distribution Chart
        const expenseCtx = document.getElementById('expenseChart').getContext('2d');
        expenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#3b82f6', '#ef4444', '#f59e0b',
                        '#10b981', '#6366f1', '#8b5cf6',
                        '#ec4899', '#14b8a6'
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = utils.formatCurrency(context.raw);
                                const percentage = Math.round((context.raw / context.dataset.data.reduce((a, b) => a + b)) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Monthly Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        trendChart = new Chart(trendCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: '#10b981',
                        borderWidth: 2,
                        borderRadius: 4,
                        data: [],
                        order: 2
                    },
                    {
                        label: 'Expenses',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderColor: '#ef4444',
                        borderWidth: 2,
                        borderRadius: 4,
                        data: [],
                        order: 2
                    },
                    {
                        label: 'Net',
                        type: 'line',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        pointBackgroundColor: '#3b82f6',
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        data: [],
                        order: 1,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5]
                        },
                        ticks: {
                            callback: function(value) {
                                return utils.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${utils.formatCurrency(context.raw)}`;
                            }
                        }
                    },
                    legend: {
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    function updateCharts() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        // Update expense distribution chart
        const expensesByCategory = {};
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                expensesByCategory[transaction.category] = (expensesByCategory[transaction.category] || 0) + transaction.amount;
            }
        });

        expenseChart.data.labels = Object.keys(expensesByCategory);
        expenseChart.data.datasets[0].data = Object.values(expensesByCategory);
        expenseChart.update();

        // Update monthly trend chart
        const monthlyData = {};
        transactions.forEach(transaction => {
            const month = transaction.date.substring(0, 7);
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expenses: 0 };
            }
            if (transaction.type === 'income') {
                monthlyData[month].income += transaction.amount;
            } else {
                monthlyData[month].expenses += transaction.amount;
            }
        });

        const months = Object.keys(monthlyData).sort();
        const labels = months.map(month => {
            const [year, monthNum] = month.split('-');
            return new Date(year, monthNum - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
        });
        const incomeData = months.map(month => monthlyData[month].income);
        const expenseData = months.map(month => monthlyData[month].expenses);
        const netData = months.map(month => monthlyData[month].income - monthlyData[month].expenses);

        trendChart.data.labels = labels;
        trendChart.data.datasets[0].data = incomeData;
        trendChart.data.datasets[1].data = expenseData;
        trendChart.data.datasets[2].data = netData;
        trendChart.update();

        // Update insights
        updateInsights(transactions);
    }

    function updateInsights(transactions) {
        let totalBalance = 0;
        let monthlySavings = 0;
        let currentMonthExpenses = {};

        const currentMonth = new Date().toISOString().substring(0, 7);

        transactions.forEach(transaction => {
            const amount = transaction.amount;
            if (transaction.type === 'income') {
                totalBalance += amount;
                if (transaction.date.startsWith(currentMonth)) {
                    monthlySavings += amount;
                }
            } else {
                totalBalance -= amount;
                if (transaction.date.startsWith(currentMonth)) {
                    monthlySavings -= amount;
                    currentMonthExpenses[transaction.category] = (currentMonthExpenses[transaction.category] || 0) + amount;
                }
            }
        });

        // Update insight cards
        document.getElementById('total-balance').textContent = utils.formatCurrency(totalBalance);
        document.getElementById('monthly-savings').textContent = utils.formatCurrency(monthlySavings);

        // Find top spending category
        const topCategory = Object.entries(currentMonthExpenses)
            .sort(([,a], [,b]) => b - a)[0];
        document.getElementById('top-category').textContent = topCategory 
            ? `${topCategory[0]} (${utils.formatCurrency(topCategory[1])})`
            : 'No expenses yet';
    }

    // Initialize charts
    initializeCharts();
    updateCharts();

    // Listen for storage changes to update charts
    window.addEventListener('storage', (e) => {
        if (e.key === 'transactions') {
            updateCharts();
        }
    });

    // Update charts every minute (in case of changes from other tabs)
    setInterval(updateCharts, 60000);
}); 