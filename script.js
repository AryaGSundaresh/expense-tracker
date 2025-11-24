// Global state initialized from Local Storage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Category to Emoji mapping for the UI
const categoryEmojis = {
    "Food": "🍔",
    "Transport": "🚗",
    "Entertainment": "🎬",
    "Shopping": "🛍️",
    "Bills": "🧾",
    "Other": "❓"
};

// --- Core Utility Functions ---

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function formatAmount(amount) {
    // Uses Indian locale for comma separation and two decimal places
    return parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleString('en-IN', options);
}

// --- Rendering Functions ---

function updateTotals() {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const transactionCount = expenses.length;

    document.getElementById('total').innerText = formatAmount(totalAmount);
    document.getElementById('transaction-count').innerText = transactionCount;
}

function renderCategorySummary() {
    const summaryElement = document.getElementById('category-summary');
    summaryElement.innerHTML = '';
    
    // Group and sum amounts by category
    const summary = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const categoryNames = Object.keys(summary).sort();

    if (categoryNames.length === 0) {
        summaryElement.innerHTML = '<p class="no-data">No expenses recorded.</p>';
        return;
    }

    categoryNames.forEach(category => {
        const amount = summary[category];
        const emoji = categoryEmojis[category] || '❓';
        
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <span class="category-name">${emoji} ${category}</span>
            <span class="category-amount">₹${formatAmount(amount)}</span>
        `;
        summaryElement.appendChild(item);
    });
}

function renderExpenses() {
    const list = document.getElementById('expense-list');
    const filter = document.getElementById('filter-category').value;
    list.innerHTML = '';
    
    // Filter the expenses based on the dropdown selection
    const filteredExpenses = expenses.filter(expense => filter === 'All' || expense.category === filter);
    
    if (filteredExpenses.length === 0) {
        list.innerHTML = '<p class="no-data" style="padding: 20px;">No expenses found for this category.</p>';
        return;
    }

    filteredExpenses.forEach(expense => {
        const item = document.createElement('li');
        item.className = 'expense-item';
        // Use expense ID or current index for identifying the element for deletion
        item.setAttribute('data-id', expense.id); 
        const emoji = categoryEmojis[expense.category] || '❓';

        item.innerHTML = `
            <div class="expense-details">
                <div class="item-info">
                    <span class="item-title">${expense.title}</span>
                    <span class="item-date">${formatDate(expense.date)}</span>
                    <span class="item-category-tag">${emoji} ${expense.category}</span>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <span class="item-amount">₹${formatAmount(expense.amount)}</span>
                <button class="delete-btn" onclick="deleteExpense('${expense.id}')">🗑️</button>
            </div>
        `;
        
        list.appendChild(item);
    });
    
    updateTotals();
    renderCategorySummary();
}

// --- Action Functions ---

function addExpense() {
    const titleInput = document.getElementById('title');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value); 
    const category = categorySelect.value;

    if (!title || !category) {
        alert("Please enter a valid expense title and select a category.");
        titleInput.focus();
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid, positive amount.");
        amountInput.focus();
        return;
    }

    // 1. Create a new expense object with unique ID and date
    const newExpense = {
        id: Date.now().toString(), // Simple unique ID
        title: title,
        amount: amount,
        category: category,
        date: new Date().toISOString()
    };
    
    // 2. Add to the local 'expenses' array (add new items at the start for "Recent")
    expenses.unshift(newExpense);

    // 3. Save, clear inputs, and re-render
    saveExpenses();
    renderExpenses();

    titleInput.value = "";
    amountInput.value = "";
    categorySelect.value = "Food"; // Reset category
    titleInput.focus(); 
}


function deleteExpense(expenseId) {
    const item = document.querySelector(`.expense-item[data-id="${expenseId}"]`);
    
    // Add the 'deleting' class to trigger the smooth CSS transition
    item.classList.add('deleting');

    // Remove the expense from the array after the animation is complete (0.5s)
    setTimeout(() => {
        // Filter out the deleted expense
        expenses = expenses.filter(e => e.id !== expenseId);
        
        // Save and re-render the list
        saveExpenses();
        // Since the array index changes, we re-render everything to update the display smoothly
        renderExpenses(); 
    }, 500); // Match this time to the CSS transition duration
}

// --- Initializer ---

document.addEventListener('DOMContentLoaded', () => {
    // Initial load and render
    renderExpenses();
    
    // Event listeners for 'Enter' key press on inputs
    document.getElementById('amount').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addExpense();
        }
    });
    document.getElementById('title').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('amount').focus();
        }
    });
});