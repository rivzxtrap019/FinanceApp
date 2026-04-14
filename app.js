

document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://localhost:3000";

  // REGISTER
  document.getElementById("register-btn").addEventListener("click", async () => {
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const currency = document.getElementById("register-currency").value;

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, currency })
      });

      const text = await res.text();
      alert(text);

    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  });

  // LOGIN (✅ moved inside)
  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        alert("Invalid login");
        return;
      }

      const user = await res.json();

      localStorage.setItem("user", JSON.stringify(user));

      // Set current user in state
      state.currentUser = user;
      state.isLoggedIn = true;

      // 👇 ADD HERE
      loadAccounts();
      loadCategories();

      saveToLocalStorage();

      document.getElementById("auth-container").classList.add("hidden");
      document.getElementById("main-app").classList.remove("hidden");
      
      // Update user info in sidebar
      document.getElementById('user-name').textContent = state.currentUser.name;
      document.getElementById('user-email').textContent = state.currentUser.email;

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
    async function loadAccounts() {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(`${API_URL}/accounts/${user.id}`);
      const accounts = await res.json();

      const select = document.getElementById("transaction-account");

      select.innerHTML = "";

      accounts.forEach(acc => {
        select.innerHTML += `
          <option value="${acc.id}">${acc.name}</option>
        `;
      });
    }
    async function loadCategories() {
        const user = JSON.parse(localStorage.getItem("user"));

        const res = await fetch(`${API_URL}/categories/${user.id}`);
        const categories = await res.json();

        const select = document.getElementById("transaction-category");

        select.innerHTML = "";

        categories.forEach(cat => {
          select.innerHTML += `
            <option value="${cat.id}">${cat.name}</option>
          `;
        });
      }
  });

});


// Utility functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatCurrency(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: firstDay, end: lastDay };
}

// Default data
const defaultCategories = [
  { id: 'cat-1', name: 'Groceries', type: 'expense', color: '#F56565', icon: 'shopping-cart' },
  { id: 'cat-2', name: 'Dining', type: 'expense', color: '#ED8936', icon: 'utensils' },
  { id: 'cat-3', name: 'Transportation', type: 'expense', color: '#ECC94B', icon: 'car' },
  { id: 'cat-4', name: 'Utilities', type: 'expense', color: '#48BB78', icon: 'bolt' },
  { id: 'cat-5', name: 'Entertainment', type: 'expense', color: '#38B2AC', icon: 'film' },
  { id: 'cat-6', name: 'Health', type: 'expense', color: '#4299E1', icon: 'medkit' },
  { id: 'cat-7', name: 'Housing', type: 'expense', color: '#0BC5EA', icon: 'home' },
  { id: 'cat-8', name: 'Shopping', type: 'expense', color: '#9F7AEA', icon: 'shopping-bag' },
  { id: 'cat-9', name: 'Personal', type: 'expense', color: '#ED64A6', icon: 'user' },
  { id: 'cat-10', name: 'Salary', type: 'income', color: '#48BB78', icon: 'money-bill' },
  { id: 'cat-11', name: 'Investments', type: 'income', color: '#38B2AC', icon: 'chart-line' },
  { id: 'cat-12', name: 'Gifts', type: 'income', color: '#9F7AEA', icon: 'gift' },
  { id: 'cat-13', name: 'Other', type: 'expense', color: '#718096', icon: 'question' },
  { id: 'cat-14', name: 'Other Income', type: 'income', color: '#4299E1', icon: 'plus' },
];

// App State
let state = {
  currentUser: null,
  isLoggedIn: false,
  isDarkMode: false,
  accounts: [],
  transactions: [],
  categories: [],
  budgets: [],
  goals: [],
  edit: {
    transaction: null,
    account: null,
    category: null,
    budget: null,
    goal: null
  }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  loadFromLocalStorage();
  setupEventListeners();
  
  // Check if user is logged in
  if (state.isLoggedIn && state.currentUser) {
    showMainApp();
    loadDashboard();
  } else {
    showAuthScreen();
  }
  
  // Apply dark mode if enabled
  if (state.isDarkMode) {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Storage functions
function loadFromLocalStorage() {
  const savedState = localStorage.getItem('myFinance');
  if (savedState) {
    state = JSON.parse(savedState);
    
    // Convert string dates back to Date objects
    if (state.transactions && state.transactions.length > 0) {
      state.transactions.forEach(t => {
        t.date = new Date(t.date);
        t.createdAt = new Date(t.createdAt);
      });
    }
    
    if (state.goals && state.goals.length > 0) {
      state.goals.forEach(g => {
        g.deadline = new Date(g.deadline);
        g.createdAt = new Date(g.createdAt);
      });
    }
    
    if (state.budgets && state.budgets.length > 0) {
      state.budgets.forEach(b => {
        b.startDate = new Date(b.startDate);
        b.endDate = b.endDate ? new Date(b.endDate) : null;
      });
    }
    
    if (state.currentUser) {
      state.currentUser.createdAt = new Date(state.currentUser.createdAt);
    }
    
    if (state.accounts && state.accounts.length > 0) {
      state.accounts.forEach(a => {
        a.createdAt = new Date(a.createdAt);
      });
    }
  }
}

function saveToLocalStorage() {
  localStorage.setItem('myFinance', JSON.stringify(state));
}

// Event listeners setup
function setupEventListeners() {
  // Auth tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      
      if (tabName) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
      }
      
      if (this.dataset.categoryType) {
        document.querySelectorAll('[data-category-type]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderCategories(this.dataset.categoryType);
      }
    });
  });
  
  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageName = this.dataset.page;
      navigateTo(pageName);
    });
  });
  
  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
  
  // New transaction button
  document.getElementById('new-transaction-btn').addEventListener('click', () => openTransactionModal());
  
  // New account button
  document.getElementById('new-account-btn').addEventListener('click', () => openAccountModal());
  
  // New category button
  document.getElementById('new-category-btn').addEventListener('click', () => openCategoryModal());
  
  // New budget button
  document.getElementById('new-budget-btn').addEventListener('click', () => openBudgetModal());
  
  // New goal button
  document.getElementById('new-goal-btn').addEventListener('click', () => openGoalModal());
  
  // Save transaction button
  document.getElementById('save-transaction-btn').addEventListener('click', saveTransaction);
  
  // Save account button
  document.getElementById('save-account-btn').addEventListener('click', saveAccount);
  
  // Save category button
  document.getElementById('save-category-btn').addEventListener('click', saveCategory);
  
  // Save budget button
  document.getElementById('save-budget-btn').addEventListener('click', saveBudget);
  
  // Save goal button
  document.getElementById('save-goal-btn').addEventListener('click', saveGoal);
  
  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Filter transactions
  document.getElementById('filter-account').addEventListener('change', filterTransactions);
  document.getElementById('filter-category').addEventListener('change', filterTransactions);
  document.getElementById('filter-type').addEventListener('change', filterTransactions);
  document.getElementById('filter-date').addEventListener('change', filterTransactions);
  
  // Transaction type radio change
  document.querySelectorAll('input[name="transaction-type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      updateCategoriesInForm(this.value);
    });
  });
  
  // View all links
  document.querySelectorAll('.view-all').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(this.dataset.page);
    });
  });
}

// Auth functions
function handleLogout() {
  state.currentUser = null;
  state.isLoggedIn = false;
  saveToLocalStorage();
  showAuthScreen();
  showToast('Logged out successfully', 'success');
}

function createDefaultData(userId) {
  // Create default categories
  state.categories = defaultCategories.map(cat => ({
    ...cat,
    userId: userId
  }));
  
  // Create default accounts
  state.accounts = [
    {
      id: generateUUID(),
      userId,
      name: 'Checking Account',
      type: 'checking',
      balance: 2500,
      accountNumber: '****1234',
      currency: state.currentUser.currency,
      color: '#4299E1',
      createdAt: new Date()
    },
    {
      id: generateUUID(),
      userId,
      name: 'Savings Account',
      type: 'savings',
      balance: 10000,
      accountNumber: '****5678',
      currency: state.currentUser.currency,
      color: '#48BB78',
      createdAt: new Date()
    },
    {
      id: generateUUID(),
      userId,
      name: 'Credit Card',
      type: 'credit',
      balance: -1500,
      accountNumber: '****9012',
      currency: state.currentUser.currency,
      color: '#F56565',
      createdAt: new Date()
    }
  ];
  
  // Create sample transactions
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  
  state.transactions = [
    {
      id: generateUUID(),
      userId,
      accountId: state.accounts[0].id,
      categoryId: state.categories.find(c => c.name === 'Salary').id,
      type: 'income',
      amount: 3500,
      description: 'Monthly Salary',
      date: new Date(today.getFullYear(), today.getMonth(), 1),
      paymentMethod: 'bank',
      createdAt: new Date()
    },
    {
      id: generateUUID(),
      userId,
      accountId: state.accounts[0].id,
      categoryId: state.categories.find(c => c.name === 'Groceries').id,
      type: 'expense',
      amount: 150,
      description: 'Weekly Grocery Shopping',
      date: lastWeek,
      paymentMethod: 'debit',
      createdAt: new Date()
    },
    {
      id: generateUUID(),
      userId,
      accountId: state.accounts[0].id,
      categoryId: state.categories.find(c => c.name === 'Dining').id,
      type: 'expense',
      amount: 85,
      description: 'Restaurant Dinner',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      paymentMethod: 'credit',
      createdAt: new Date()
    },
    {
      id: generateUUID(),
      userId,
      accountId: state.accounts[2].id,
      categoryId: state.categories.find(c => c.name === 'Transportation').id,
      type: 'expense',
      amount: 45,
      description: 'Gas Station',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      paymentMethod: 'credit',
      createdAt: new Date()
    },
    {
      id: generateUUID(),
      userId,
      accountId: state.accounts[1].id,
      categoryId: state.categories.find(c => c.name === 'Investments').id,
      type: 'income',
      amount: 200,
      description: 'Dividend Payment',
      date: twoWeeksAgo,
      paymentMethod: 'bank',
      createdAt: new Date()
    }
  ];
  
  // Create sample budget
  const monthRange = getCurrentMonthRange();
  state.budgets = [
    {
      id: generateUUID(),
      userId,
      categoryId: state.categories.find(c => c.name === 'Groceries').id,
      startDate: monthRange.start,
      endDate: monthRange.end,
      amount: 600,
      spent: 150
    },
    {
      id: generateUUID(),
      userId,
      categoryId: state.categories.find(c => c.name === 'Dining').id,
      startDate: monthRange.start,
      endDate: monthRange.end,
      amount: 300,
      spent: 85
    },
    {
      id: generateUUID(),
      userId,
      categoryId: state.categories.find(c => c.name === 'Transportation').id,
      startDate: monthRange.start,
      endDate: monthRange.end,
      amount: 200,
      spent: 45
    }
  ];
  
  // Create sample goal
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  
  state.goals = [
    {
      id: generateUUID(),
      userId,
      name: 'Emergency Fund',
      targetAmount: 10000,
      savedAmount: 3000,
      deadline: sixMonthsFromNow,
      createdAt: new Date()
    }
  ];
}

function loadUserData(userId) {
  // This would typically fetch data from a server
  // But for our example, we'll just filter the existing state
  
  // Reset data arrays
  state.accounts = [];
  state.transactions = [];
  state.categories = [];
  state.budgets = [];
  state.goals = [];
  
  // Check if we have default categories
  if (!localStorage.getItem('myFinance')) {
    createDefaultData(userId);
  }
}

// UI functions
function showAuthScreen() {
  document.getElementById('auth-container').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  
  // Update user info in sidebar
  document.getElementById('user-name').textContent = state.currentUser.name;
  document.getElementById('user-email').textContent = state.currentUser.email;
  
  // Load all data for current user
  renderAccounts();
  renderTransactions();
  renderCategories();
  renderBudgets();
  renderGoals();
  
  // Set up filter dropdowns
  populateAccountsDropdown();
  populateCategoriesDropdown();
}

function navigateTo(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show selected page
  document.getElementById(`${pageName}-page`).classList.add('active');
  
  // Update page title
  document.getElementById('page-title').textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`.nav-link[data-page="${pageName}"]`).classList.add('active');
  
  // Perform any specific page initialization
  if (pageName === 'dashboard') {
    loadDashboard();
  }
}

function toggleDarkMode() {
  state.isDarkMode = !state.isDarkMode;
  document.body.classList.toggle('dark-mode');
  
  const themeToggle = document.getElementById('theme-toggle');
  if (state.isDarkMode) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
  
  saveToLocalStorage();
  
  // Refresh charts if on dashboard
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    renderIncomeExpenseChart();
    renderCategoryChart();
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toastIcon.className = 'fas fa-exclamation-circle';
  } else {
    toastIcon.className = 'fas fa-check-circle';
  }
  
  toast.classList.remove('hidden');
  
  // Hide toast after 5 seconds
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}

// Dashboard functions
function loadDashboard() {
  updateDashboardSummary();
  renderRecentTransactions();
  renderIncomeExpenseChart();
  renderCategoryChart();
}

function updateDashboardSummary() {
  // Get total balance across all accounts
  const totalBalance = state.accounts.reduce((sum, account) => sum + account.balance, 0);
  document.getElementById('total-balance').textContent = formatCurrency(totalBalance, state.currentUser.currency);

  // Calculate total income and expenses for the current month
  const { start, end } = getCurrentMonthRange();

  const currentMonthTransactions = state.transactions.filter(t =>
    new Date(t.date) >= start && new Date(t.date) <= end
  );

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Initialize to 0 if there are no transactions
  document.getElementById('total-income').textContent = formatCurrency(totalIncome || 0, state.currentUser.currency);
  document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses || 0, state.currentUser.currency);
}

function renderRecentTransactions() {
  const container = document.getElementById('dashboard-transactions');
  container.innerHTML = '';
  
  // Get 5 most recent transactions
  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  if (recentTransactions.length === 0) {
    container.innerHTML = '<div class="empty-state">No transactions yet.</div>';
    return;
  }
  
  recentTransactions.forEach(transaction => {
    const category = state.categories.find(c => c.id === transaction.categoryId);
    const account = state.accounts.find(a => a.id === transaction.accountId);
    
    const transactionEl = document.createElement('div');
    transactionEl.className = 'transaction-item';
    
    const iconColor = category ? category.color : (transaction.type === 'income' ? '#48BB78' : '#F56565');
    const iconClass = category ? category.icon : (transaction.type === 'income' ? 'arrow-down' : 'arrow-up');
    
    transactionEl.innerHTML = `
      <div class="transaction-icon" style="background-color: ${iconColor}">
        <i class="fas fa-${iconClass}"></i>
      </div>
      <div class="transaction-details">
        <div class="transaction-description">${transaction.description}</div>
        <div class="transaction-meta">
          <div class="transaction-date">${formatDate(transaction.date)}</div>
          <div class="transaction-category">${category ? category.name : 'Uncategorized'}</div>
          <div class="transaction-account">${account ? account.name : 'Unknown Account'}</div>
        </div>
      </div>
      <div class="transaction-amount ${transaction.type}">
        ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount, state.currentUser.currency)}
      </div>
    `;
    
    container.appendChild(transactionEl);
  });
}

function renderIncomeExpenseChart() {
  const ctx = document.getElementById('income-expense-chart').getContext('2d');
  
  // Get data for the last 6 months
  const today = new Date();
  const monthLabels = [];
  const incomeData = [];
  const expenseData = [];
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = month.toLocaleDateString('en-US', { month: 'short' });
    monthLabels.push(monthName);
    
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const monthTransactions = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
    
    const monthlyIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    incomeData.push(monthlyIncome);
    expenseData.push(monthlyExpense);
  }
  
  // Destroy existing chart if it exists
  if (window.incomeExpenseChart) {
    window.incomeExpenseChart.destroy();
  }
  
  // Create new chart
  window.incomeExpenseChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(72, 187, 120, 0.2)',
          borderColor: 'rgba(72, 187, 120, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(245, 101, 101, 0.2)',
          borderColor: 'rgba(245, 101, 101, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: state.isDarkMode ? '#E2E8F0' : '#1A202C'
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: state.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: state.isDarkMode ? '#E2E8F0' : '#1A202C'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: state.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            callback: function(value) {
              return formatCurrency(value, state.currentUser.currency).split('.')[0];
            },
            color: state.isDarkMode ? '#E2E8F0' : '#1A202C'
          }
        }
      }
    }
  });
}

function renderCategoryChart() {
  const ctx = document.getElementById('category-chart').getContext('2d');
  
  // Get current month expenses by category
  const { start, end } = getCurrentMonthRange();
  
  const currentMonthExpenses = state.transactions.filter(t => 
    t.type === 'expense' && 
    new Date(t.date) >= start && 
    new Date(t.date) <= end
  );
  
  // Group expenses by category
  const expensesByCategory = {};
  currentMonthExpenses.forEach(t => {
    const categoryId = t.categoryId;
    if (!expensesByCategory[categoryId]) {
      expensesByCategory[categoryId] = 0;
    }
    expensesByCategory[categoryId] += t.amount;
  });
  
  // Prepare data for chart
  const labels = [];
  const data = [];
  const backgroundColors = [];
  
  Object.keys(expensesByCategory).forEach(categoryId => {
    const category = state.categories.find(c => c.id === categoryId);
    if (category) {
      labels.push(category.name);
      data.push(expensesByCategory[categoryId]);
      backgroundColors.push(category.color);
    }
  });
  
  // Destroy existing chart if it exists
  if (window.categoryChart) {
    window.categoryChart.destroy();
  }
  
  // Create new chart
  window.categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor: state.isDarkMode ? 'rgba(26, 32, 44, 1)' : '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: state.isDarkMode ? '#E2E8F0' : '#1A202C'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = formatCurrency(context.parsed, state.currentUser.currency);
              return `${context.label}: ${value}`;
            }
          }
        }
      }
    }
  });
}

// Account functions
function renderAccounts() {
  const container = document.getElementById('accounts-list');
  container.innerHTML = '';
  
  if (state.accounts.length === 0) {
    container.innerHTML = '<div class="empty-state">No accounts yet. Create your first account!</div>';
    return;
  }
  
  state.accounts.forEach(account => {
    const accountEl = document.createElement('div');
    accountEl.className = 'account-card';
    accountEl.innerHTML = `
      <div class="account-color" style="background-color: ${account.color}"></div>
      <div class="account-header">
        <div>
          <div class="account-name">${account.name}</div>
          <div class="account-type">${account.type}</div>
        </div>
      </div>
      ${account.accountNumber ? `<div class="account-number">${account.accountNumber}</div>` : ''}
      <div class="account-balance">${formatCurrency(account.balance, state.currentUser.currency)}</div>
      <div class="account-actions">
        <button class="btn btn-outline btn-sm edit-account" data-id="${account.id}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-outline btn-sm delete-account" data-id="${account.id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    container.appendChild(accountEl);
    
    // Add event listeners
    accountEl.querySelector('.edit-account').addEventListener('click', () => openAccountModal(account.id));
    accountEl.querySelector('.delete-account').addEventListener('click', () => deleteAccount(account.id));
  });
}

function openAccountModal(accountId = null) {
  const modal = document.getElementById('account-modal');
  const modalTitle = document.getElementById('account-modal-title');
  const form = document.getElementById('account-form');
  
  // Reset form
  form.reset();
  
  // Open overlay
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  if (accountId) {
    // Edit mode
    const account = state.accounts.find(a => a.id === accountId);
    if (account) {
      modalTitle.textContent = 'Edit Account';
      document.getElementById('account-id').value = account.id;
      document.getElementById('account-name').value = account.name;
      document.getElementById('account-type').value = account.type;
      document.getElementById('account-balance').value = account.balance;
      document.getElementById('account-number').value = account.accountNumber || '';
      document.getElementById('account-color').value = account.color;
      
      state.edit.account = account;
    }
  } else {
    // New mode
    modalTitle.textContent = 'New Account';
    document.getElementById('account-id').value = '';
    state.edit.account = null;
  }
  
  // Set currency symbol
  document.getElementById('account-currency-symbol').textContent = getCurrencySymbol(state.currentUser.currency);
  
  // Show modal
  modal.classList.remove('hidden');
}

function saveAccount() {
  const form = document.getElementById('account-form');
  
  // Get form values
  const id = document.getElementById('account-id').value;
  const name = document.getElementById('account-name').value;
  const type = document.getElementById('account-type').value;
  const balance = parseFloat(document.getElementById('account-balance').value);
  const accountNumber = document.getElementById('account-number').value;
  const color = document.getElementById('account-color').value;
  
  // Validate
  if (!name || isNaN(balance)) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  if (id && state.edit.account) {
    // Edit existing account
    const account = state.accounts.find(a => a.id === id);
    if (account) {
      // Calculate balance difference for updating transactions
      const balanceDifference = balance - account.balance;
      
      account.name = name;
      account.type = type;
      account.balance = balance;
      account.accountNumber = accountNumber;
      account.color = color;
      
      showToast('Account updated successfully', 'success');
    }
  } else {
    // Create new account
    const newAccount = {
      id: generateUUID(),
      userId: state.currentUser.id,
      name,
      type,
      balance,
      accountNumber,
      color,
      currency: state.currentUser.currency,
      createdAt: new Date()
    };
    
    state.accounts.push(newAccount);
    showToast('Account created successfully', 'success');
  }
  
  // Save and update UI
  saveToLocalStorage();
  closeAllModals();
  renderAccounts();
  populateAccountsDropdown();
  
  // Refresh dashboard if open
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboard();
  }
}

function deleteAccount(accountId) {
  if (confirm('Are you sure you want to delete this account? All associated transactions will also be deleted.')) {
    // Delete account
    state.accounts = state.accounts.filter(a => a.id !== accountId);
    
    // Delete associated transactions
    state.transactions = state.transactions.filter(t => t.accountId !== accountId);
    
    // Save and update UI
    saveToLocalStorage();
    renderAccounts();
    renderTransactions();
    populateAccountsDropdown();
    
    // Refresh dashboard if open
    if (document.getElementById('dashboard-page').classList.contains('active')) {
      loadDashboard();
    }
    
    showToast('Account deleted successfully', 'success');
  }
}

function populateAccountsDropdown() {
  const transactionAccountSelect = document.getElementById('transaction-account');
  const filterAccountSelect = document.getElementById('filter-account');
  
  // Clear existing options except the "All Accounts" option in filter
  transactionAccountSelect.innerHTML = '';
  
  // Only clear custom options in filter select
  while (filterAccountSelect.options.length > 1) {
    filterAccountSelect.remove(1);
  }
  
  // Add account options
  state.accounts.forEach(account => {
    const transactionOption = document.createElement('option');
    transactionOption.value = account.id;
    transactionOption.textContent = account.name;
    transactionAccountSelect.appendChild(transactionOption);
    
    const filterOption = document.createElement('option');
    filterOption.value = account.id;
    filterOption.textContent = account.name;
    filterAccountSelect.appendChild(filterOption);
  });
}

// Transaction functions
function renderTransactions(filteredTransactions = null) {
  const container = document.getElementById('transactions-list');
  container.innerHTML = '';
  
  const transactions = filteredTransactions || state.transactions;
  
  if (transactions.length === 0) {
    container.innerHTML = '<div class="empty-state">No transactions found.</div>';
    return;
  }
  
  // Create table
  const table = document.createElement('table');
  table.className = 'transactions-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Account</th>
        <th>Amount</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;
  
  const tbody = table.querySelector('tbody');
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedTransactions.forEach(transaction => {
    const category = state.categories.find(c => c.id === transaction.categoryId);
    const account = state.accounts.find(a => a.id === transaction.accountId);
    
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${formatDate(transaction.date)}</td>
      <td>${transaction.description}</td>
      <td>
        <span class="category-badge" style="background-color: ${category ? category.color : '#718096'}">
          ${category ? category.name : 'Uncategorized'}
        </span>
      </td>
      <td>${account ? account.name : 'Unknown'}</td>
      <td class="${transaction.type === 'income' ? 'income' : 'expense'}">
        ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount, state.currentUser.currency)}
      </td>
      <td>
        <button class="action-btn edit" data-id="${transaction.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" data-id="${transaction.id}">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(tr);
    
    // Add event listeners
    tr.querySelector('.edit').addEventListener('click', () => openTransactionModal(transaction.id));
    tr.querySelector('.delete').addEventListener('click', () => deleteTransaction(transaction.id));
  });
  
  container.appendChild(table);
}

function openTransactionModal(transactionId = null) {
  const modal = document.getElementById('transaction-modal');
  const modalTitle = document.getElementById('transaction-modal-title');
  const form = document.getElementById('transaction-form');
  
  // Reset form
  form.reset();
  
  // Set today as default date
  document.getElementById('transaction-date').valueAsDate = new Date();
  
  // Open overlay
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  if (transactionId) {
    // Edit mode
    const transaction = state.transactions.find(t => t.id === transactionId);
    if (transaction) {
      modalTitle.textContent = 'Edit Transaction';
      document.getElementById('transaction-id').value = transaction.id;
      
      // Set transaction type radio
      document.querySelector(`input[name="transaction-type"][value="${transaction.type}"]`).checked = true;
      
      document.getElementById('transaction-amount').value = transaction.amount;
      document.getElementById('transaction-description').value = transaction.description;
      document.getElementById('transaction-date').valueAsDate = new Date(transaction.date);
      document.getElementById('transaction-account').value = transaction.accountId;
      
      // Update categories dropdown based on transaction type
      updateCategoriesInForm(transaction.type, transaction.categoryId);
      
      document.getElementById('transaction-payment').value = transaction.paymentMethod || 'other';
      document.getElementById('transaction-note').value = transaction.note || '';
        document.getElementById("save-transaction-btn").addEventListener("click", async () => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("You must be logged in");
    return;
  }

  const data = {
    user_id: user.id,
    account_id: document.getElementById("transaction-account").value,
    category_id: document.getElementById("transaction-category").value,
    type: document.querySelector('input[name="transaction-type"]:checked').value,
    amount: document.getElementById("transaction-amount").value,
    description: document.getElementById("transaction-description").value,
    date: document.getElementById("transaction-date").value,
    payment_method: document.getElementById("transaction-payment").value,
    note: document.getElementById("transaction-note").value
  };

  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const text = await res.text();
    alert(text);

  } catch (err) {
    console.error(err);
    alert("Error saving transaction");
  }

});
      state.edit.transaction = transaction;
    }
  } else {
    // New mode
    modalTitle.textContent = 'New Transaction';
    document.getElementById('transaction-id').value = '';
    
    // Default to expense type
    document.querySelector('input[name="transaction-type"][value="expense"]').checked = true;
    
    // Update categories dropdown for expense
    updateCategoriesInForm('expense');
    
    state.edit.transaction = null;
  }
  
  // Set currency symbol
  document.getElementById('currency-symbol').textContent = getCurrencySymbol(state.currentUser.currency);
  
  // Show modal
  modal.classList.remove('hidden');
}

function updateCategoriesInForm(transactionType, selectedCategoryId = null) {
  const categorySelect = document.getElementById('transaction-category');
  categorySelect.innerHTML = '';
  
  const filteredCategories = state.categories.filter(c => c.type === transactionType);
  
  filteredCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
  
  // Set selected category if provided
  if (selectedCategoryId) {
    categorySelect.value = selectedCategoryId;
  }
}

function saveTransaction() {
  // Get form values
  const id = document.getElementById('transaction-id').value;
  const type = document.querySelector('input[name="transaction-type"]:checked').value;
  const amount = parseFloat(document.getElementById('transaction-amount').value);
  const description = document.getElementById('transaction-description').value;
  const date = document.getElementById('transaction-date').valueAsDate;
  const accountId = document.getElementById('transaction-account').value;
  const categoryId = document.getElementById('transaction-category').value;
  const paymentMethod = document.getElementById('transaction-payment').value;
  const note = document.getElementById('transaction-note').value;
  
  // Validate
  if (!amount || isNaN(amount) || !description || !date || !accountId || !categoryId) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  const account = state.accounts.find(a => a.id === accountId);
  if (!account) {
    showToast('Selected account not found', 'error');
    return;
  }
  
  if (id && state.edit.transaction) {
    // Edit existing transaction
    const transaction = state.transactions.find(t => t.id === id);
    if (transaction) {
      // Update account balance (remove old impact, add new impact)
      const oldAccount = state.accounts.find(a => a.id === transaction.accountId);
      if (oldAccount) {
        // Reverse previous effect
        if (transaction.type === 'income') {
          oldAccount.balance -= transaction.amount;
        } else {
          oldAccount.balance += transaction.amount;
        }
      }
      
      // Apply new effect to selected account
      if (type === 'income') {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
      
      transaction.type = type;
      transaction.amount = amount;
      transaction.description = description;
      transaction.date = date;
      transaction.accountId = accountId;
      transaction.categoryId = categoryId;
      transaction.paymentMethod = paymentMethod;
      transaction.note = note;
      
      showToast('Transaction updated successfully', 'success');
    }
  } else {
    // Create new transaction
    const newTransaction = {
      id: generateUUID(),
      userId: state.currentUser.id,
      accountId,
      categoryId,
      type,
      amount,
      description,
      date,
      paymentMethod,
      note,
      createdAt: new Date()
    };
    
    // Update account balance
    if (type === 'income') {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }
    
    state.transactions.push(newTransaction);
    showToast('Transaction created successfully', 'success');
  }
  
  // Update budget if it's an expense
  if (type === 'expense') {
    updateBudgetSpending(categoryId, amount, id ? state.edit.transaction : null);
  }
  
  // Save and update UI
  saveToLocalStorage();
  closeAllModals();
  renderTransactions();
  renderAccounts();
  
  // Refresh dashboard if open
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    loadDashboard();
  }
}

function updateBudgetSpending(categoryId, newAmount, oldTransaction = null) {
  const { start, end } = getCurrentMonthRange();
  
  const budget = state.budgets.find(b => 
    b.categoryId === categoryId &&
    new Date(b.startDate) <= new Date() &&
    (!b.endDate || new Date(b.endDate) >= new Date())
  );
  
  if (budget) {
    // If editing, subtract old amount first
    if (oldTransaction && oldTransaction.type === 'expense' && oldTransaction.categoryId === categoryId) {
      budget.spent -= oldTransaction.amount;
    }
    
    // Add new amount to spent
    budget.spent += newAmount;
    
    // Ensure spent is not negative
    if (budget.spent < 0) budget.spent = 0;
  }
}

function deleteTransaction(transactionId) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    const transaction = state.transactions.find(t => t.id === transactionId);
    
    if (transaction) {
      // Update account balance
      const account = state.accounts.find(a => a.id === transaction.accountId);
      if (account) {
        if (transaction.type === 'income') {
          account.balance -= transaction.amount;
        } else {
          account.balance += transaction.amount;
        }
      }
      
      // Update budget if it's an expense
      if (transaction.type === 'expense') {
        const budget = state.budgets.find(b => b.categoryId === transaction.categoryId);
        if (budget) {
          budget.spent -= transaction.amount;
          if (budget.spent < 0) budget.spent = 0;
        }
      }
      
      // Remove transaction
      state.transactions = state.transactions.filter(t => t.id !== transactionId);
      
      // Save and update UI
      saveToLocalStorage();
      renderTransactions();
      renderAccounts();
      
      // Refresh dashboard if open
      if (document.getElementById('dashboard-page').classList.contains('active')) {
        loadDashboard();
      }
      
      showToast('Transaction deleted successfully', 'success');
    }
  }
}

function filterTransactions() {
  const accountId = document.getElementById('filter-account').value;
  const categoryId = document.getElementById('filter-category').value;
  const type = document.getElementById('filter-type').value;
  const dateRange = document.getElementById('filter-date').value;
  
  let filtered = [...state.transactions];
  
  // Filter by account
  if (accountId !== 'all') {
    filtered = filtered.filter(t => t.accountId === accountId);
  }
  
  // Filter by category
  if (categoryId !== 'all') {
    filtered = filtered.filter(t => t.categoryId === categoryId);
  }
  
  // Filter by type
  if (type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }
  
  // Filter by date range
  if (dateRange !== 'all') {
    const today = new Date();
    let startDate;
    
    if (dateRange === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (dateRange === 'quarter') {
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    } else if (dateRange === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
    }
    
    filtered = filtered.filter(t => new Date(t.date) >= startDate);
  }
  
  renderTransactions(filtered);
}

// Category functions
function renderCategories(typeFilter = 'all') {
  const container = document.getElementById('categories-list');
  container.innerHTML = '';
  
  let filteredCategories = [...state.categories];
  
  // Apply type filter
  if (typeFilter !== 'all') {
    filteredCategories = filteredCategories.filter(c => c.type === typeFilter);
  }
  
  if (filteredCategories.length === 0) {
    container.innerHTML = '<div class="empty-state">No categories found.</div>';
    return;
  }
  
  filteredCategories.forEach(category => {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'category-card';
    categoryEl.innerHTML = `
      <div class="category-color" style="background-color: ${category.color}">
        <i class="fas fa-${category.icon || (category.type === 'income' ? 'arrow-down' : 'arrow-up')}"></i>
      </div>
      <div class="category-name">${category.name}</div>
      <div class="category-type">${category.type === 'income' ? 'Income' : 'Expense'}</div>
      <div class="category-actions">
        <button class="action-btn edit" data-id="${category.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" data-id="${category.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    container.appendChild(categoryEl);
    
    // Add event listeners
    categoryEl.querySelector('.edit').addEventListener('click', () => openCategoryModal(category.id));
    categoryEl.querySelector('.delete').addEventListener('click', () => deleteCategory(category.id));
  });
}

function openCategoryModal(categoryId = null) {
  const modal = document.getElementById('category-modal');
  const modalTitle = document.getElementById('category-modal-title');
  const form = document.getElementById('category-form');
  
  // Reset form
  form.reset();
  
  // Open overlay
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  if (categoryId) {
    // Edit mode
    const category = state.categories.find(c => c.id === categoryId);
    if (category) {
      modalTitle.textContent = 'Edit Category';
      document.getElementById('category-id').value = category.id;
      document.getElementById('category-name').value = category.name;
      document.querySelector(`input[name="category-type"][value="${category.type}"]`).checked = true;
      document.getElementById('category-color').value = category.color;
      
      state.edit.category = category;
    }
  } else {
    // New mode
    modalTitle.textContent = 'New Category';
    document.getElementById('category-id').value = '';
    
    // Default to expense type
    document.querySelector('input[name="category-type"][value="expense"]').checked = true;
    
    state.edit.category = null;
  }
  
  // Show modal
  modal.classList.remove('hidden');
}

function saveCategory() {
  // Get form values
  const id = document.getElementById('category-id').value;
  const name = document.getElementById('category-name').value;
  const type = document.querySelector('input[name="category-type"]:checked').value;
  const color = document.getElementById('category-color').value;
  
  // Validate
  if (!name) {
    showToast('Please enter a category name', 'error');
    return;
  }
  
  if (id && state.edit.category) {
    // Edit existing category
    const category = state.categories.find(c => c.id === id);
    if (category) {
      category.name = name;
      category.type = type;
      category.color = color;
      
      showToast('Category updated successfully', 'success');
    }
  } else {
    // Create new category
    const newCategory = {
      id: generateUUID(),
      userId: state.currentUser.id,
      name,
      type,
      color,
      icon: getCategoryIcon(name)
    };
    
    state.categories.push(newCategory);
    showToast('Category created successfully', 'success');
  }
  
  // Save and update UI
  saveToLocalStorage();
  closeAllModals();
  renderCategories('all');
  populateCategoriesDropdown();
  
  // Refresh dashboard if open
  if (document.getElementById('dashboard-page').classList.contains('active')) {
    renderCategoryChart();
  }
}

function getCategoryIcon(name) {
  const lowerName = name.toLowerCase();
  
  // Common category names and their icons
  const iconMap = {
    groceries: 'shopping-cart',
    dining: 'utensils',
    restaurant: 'utensils',
    food: 'hamburger',
    transportation: 'car',
    travel: 'plane',
    utilities: 'bolt',
    electric: 'plug',
    water: 'tint',
    entertainment: 'film',
    health: 'medkit',
    medical: 'hospital',
    housing: 'home',
    rent: 'building',
    mortgage: 'home',
    shopping: 'shopping-bag',
    clothes: 'tshirt',
    personal: 'user',
    education: 'graduation-cap',
    school: 'school',
    books: 'book',
    salary: 'money-bill',
    income: 'dollar-sign',
    investments: 'chart-line',
    stocks: 'chart-line',
    gifts: 'gift',
    charity: 'hand-holding-heart',
    donation: 'hand-holding-heart',
    insurance: 'shield-alt',
    gym: 'dumbbell',
    fitness: 'running',
    pet: 'paw',
    childcare: 'baby',
    streaming: 'tv',
    subscription: 'repeat',
    phone: 'mobile-alt',
    internet: 'wifi'
  };
  
  // Check if any keyword matches
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(keyword)) {
      return icon;
    }
  }
  
  // Default icons
  return 'tag';
}

function deleteCategory(categoryId) {
  if (confirm('Are you sure you want to delete this category? Transactions with this category will be set to uncategorized.')) {
    // Remove category
    state.categories = state.categories.filter(c => c.id !== categoryId);
    
    // Update transactions that use this category
    state.transactions.forEach(t => {
      if (t.categoryId === categoryId) {
        // Find suitable "Other" category of the same type
        const transactionType = t.type;
        const replacementCategory = state.categories.find(c => 
          c.type === transactionType && (c.name === 'Other' || c.name === 'Other Income')
        );
        
        t.categoryId = replacementCategory ? replacementCategory.id : null;
      }
    });
    
    // Remove budgets for this category
    state.budgets = state.budgets.filter(b => b.categoryId !== categoryId);
    
    // Save and update UI
    saveToLocalStorage();
    renderCategories('all');
    populateCategoriesDropdown();
    
    // Refresh other views
    if (document.getElementById('dashboard-page').classList.contains('active')) {
      renderCategoryChart();
    }
    
    showToast('Category deleted successfully', 'success');
  }
}

function populateCategoriesDropdown() {
  const filterCategorySelect = document.getElementById('filter-category');
  const budgetCategorySelect = document.getElementById('budget-category');
  
  // Clear existing options except the "All Categories" option in filter
  while (filterCategorySelect.options.length > 1) {
    filterCategorySelect.remove(1);
  }
  
  // Clear budget category dropdown
  if (budgetCategorySelect) {
    budgetCategorySelect.innerHTML = '';
  }
  
  // Add categories
  state.categories.forEach(category => {
    const filterOption = document.createElement('option');
    filterOption.value = category.id;
    filterOption.textContent = category.name;
    filterCategorySelect.appendChild(filterOption);
    
    // Add expense categories to budget dropdown
    if (budgetCategorySelect && category.type === 'expense') {
      const budgetOption = document.createElement('option');
      budgetOption.value = category.id;
      budgetOption.textContent = category.name;
      budgetCategorySelect.appendChild(budgetOption);
    }
  });
}

// Budget functions
function renderBudgets() {
  const container = document.getElementById('budgets-list');
  container.innerHTML = '';
  
  if (state.budgets.length === 0) {
    container.innerHTML = '<div class="empty-state">No budgets yet. Create your first budget!</div>';
    return;
  }
  
  state.budgets.forEach(budget => {
    const category = state.categories.find(c => c.id === budget.categoryId);
    
    // Calculate percentage
    const percentage = budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0;
    
    // Determine status class
    let statusClass = '';
    if (percentage >= 90) {
      statusClass = 'danger';
    } else if (percentage >= 70) {
      statusClass = 'warning';
    }
    
    const budgetEl = document.createElement('div');
    budgetEl.className = 'budget-card';
    budgetEl.innerHTML = `
      <div class="budget-category">
        <div class="category-indicator" style="background-color: ${category ? category.color : '#718096'}"></div>
        <h3>${category ? category.name : 'Uncategorized'}</h3>
      </div>
      <div class="budget-dates">
        ${formatDate(budget.startDate)} - ${budget.endDate ? formatDate(budget.endDate) : 'Ongoing'}
      </div>
      <div class="budget-progress">
        <div class="progress-bar">
          <div class="progress-fill ${statusClass}" style="width: ${percentage}%"></div>
        </div>
      </div>
      <div class="budget-stats">
        <div class="budget-spent">${formatCurrency(budget.spent, state.currentUser.currency)}</div>
        <div class="budget-limit">of ${formatCurrency(budget.amount, state.currentUser.currency)}</div>
        <div class="budget-percentage">${percentage.toFixed(0)}%</div>
      </div>
      <div class="budget-actions">
        <button class="btn btn-outline btn-sm edit-budget" data-id="${budget.id}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-outline btn-sm delete-budget" data-id="${budget.id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    container.appendChild(budgetEl);
    
    // Add event listeners
    budgetEl.querySelector('.edit-budget').addEventListener('click', () => openBudgetModal(budget.id));
    budgetEl.querySelector('.delete-budget').addEventListener('click', () => deleteBudget(budget.id));
  });
}

function openBudgetModal(budgetId = null) {
  const modal = document.getElementById('budget-modal');
  const modalTitle = document.getElementById('budget-modal-title');
  const form = document.getElementById('budget-form');
  
  // Reset form
  form.reset();
  
  // Make sure categories are populated
  populateCategoriesDropdown();
  
  // Set today as default start date
  document.getElementById('budget-start-date').valueAsDate = new Date();
  
  // Open overlay
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  if (budgetId) {
    // Edit mode
    const budget = state.budgets.find(b => b.id === budgetId);
    if (budget) {
      modalTitle.textContent = 'Edit Budget';
      document.getElementById('budget-id').value = budget.id;
      document.getElementById('budget-category').value = budget.categoryId;
      document.getElementById('budget-amount').value = budget.amount;
      document.getElementById('budget-start-date').valueAsDate = new Date(budget.startDate);
      
      if (budget.endDate) {
        document.getElementById('budget-end-date').valueAsDate = new Date(budget.endDate);
      }
      
      state.edit.budget = budget;
    }
  } else {
    // New mode
    modalTitle.textContent = 'New Budget';
    document.getElementById('budget-id').value = '';
    state.edit.budget = null;
  }
  
  // Set currency symbol
  document.getElementById('budget-currency-symbol').textContent = getCurrencySymbol(state.currentUser.currency);
  
  // Show modal
  modal.classList.remove('hidden');
}

function saveBudget() {
  // Get form values
  const id = document.getElementById('budget-id').value;
  const categoryId = document.getElementById('budget-category').value;
  const amount = parseFloat(document.getElementById('budget-amount').value);
  const startDate = document.getElementById('budget-start-date').valueAsDate;
  let endDate = document.getElementById('budget-end-date').valueAsDate;
  
  // Validate
  if (!categoryId || !amount || isNaN(amount) || !startDate) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // If end date is provided, ensure it's after start date
  if (endDate && endDate < startDate) {
    showToast('End date must be after start date', 'error');
    return;
  }
  
  // Get existing expenses for this category in the date range
  let spent = 0;
  const transactions = state.transactions.filter(t => 
    t.categoryId === categoryId && 
    t.type === 'expense' &&
    new Date(t.date) >= startDate && 
    (!endDate || new Date(t.date) <= endDate)
  );
  
  spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (id && state.edit.budget) {
    // Edit existing budget
    const budget = state.budgets.find(b => b.id === id);
    if (budget) {
      budget.categoryId = categoryId;
      budget.amount = amount;
      budget.startDate = startDate;
      budget.endDate = endDate;
      budget.spent = spent;
      
      showToast('Budget updated successfully', 'success');
    }
  } else {
    // Check if a budget for this category already exists
    const existingBudget = state.budgets.find(b => 
      b.categoryId === categoryId &&
      (
        (startDate >= new Date(b.startDate) && startDate <= (b.endDate ? new Date(b.endDate) : new Date(9999, 11, 31))) ||
        (endDate && endDate >= new Date(b.startDate) && endDate <= (b.endDate ? new Date(b.endDate) : new Date(9999, 11, 31)))
      )
    );
    
    if (existingBudget) {
      showToast('A budget for this category already exists in this date range', 'error');
      return;
    }
    
    // Create new budget
    const newBudget = {
      id: generateUUID(),
      userId: state.currentUser.id,
      categoryId,
      startDate,
      endDate,
      amount,
      spent
    };
    
    state.budgets.push(newBudget);
    showToast('Budget created successfully', 'success');
  }
  
  // Save and update UI
  saveToLocalStorage();
  closeAllModals();
  renderBudgets();
}

function deleteBudget(budgetId) {
  if (confirm('Are you sure you want to delete this budget?')) {
    state.budgets = state.budgets.filter(b => b.id !== budgetId);
    
    // Save and update UI
    saveToLocalStorage();
    renderBudgets();
    
    showToast('Budget deleted successfully', 'success');
  }
}

// Goal functions
function renderGoals() {
  const container = document.getElementById('goals-list');
  container.innerHTML = '';
  
  if (state.goals.length === 0) {
    container.innerHTML = '<div class="empty-state">No financial goals yet. Create your first goal!</div>';
    return;
  }
  
  state.goals.forEach(goal => {
    // Calculate percentage
    const percentage = goal.targetAmount > 0 ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100) : 0;
    
    // Check if deadline has passed
    const isExpired = new Date(goal.deadline) < new Date();
    
    const goalEl = document.createElement('div');
    goalEl.className = 'goal-card';
    goalEl.innerHTML = `
      <div class="goal-header">
        <div class="goal-name">${goal.name}</div>
        <div class="goal-deadline ${isExpired ? 'error' : ''}">
          ${isExpired ? 'Expired: ' : 'Target: '}${formatDate(goal.deadline)}
        </div>
      </div>
      <div class="goal-amount">
        <div class="amount-saved">
          <div class="amount-value">${formatCurrency(goal.savedAmount, state.currentUser.currency)}</div>
          <div class="amount-label">Saved</div>
        </div>
        <div class="amount-target">
          <div class="amount-value">${formatCurrency(goal.targetAmount, state.currentUser.currency)}</div>
          <div class="amount-label">Target</div>
        </div>
      </div>
      <div class="budget-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
      <div class="budget-stats">
        <div class="budget-percentage">${percentage.toFixed(0)}% complete</div>
        <div class="budget-remaining">
          ${formatCurrency(goal.targetAmount - goal.savedAmount, state.currentUser.currency)} to go
        </div>
      </div>
      <div class="goal-actions">
        <button class="btn btn-outline btn-sm edit-goal" data-id="${goal.id}">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn btn-outline btn-sm delete-goal" data-id="${goal.id}">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    container.appendChild(goalEl);
    
    // Add event listeners
    goalEl.querySelector('.edit-goal').addEventListener('click', () => openGoalModal(goal.id));
    goalEl.querySelector('.delete-goal').addEventListener('click', () => deleteGoal(goal.id));
  });
}

function openGoalModal(goalId = null) {
  const modal = document.getElementById('goal-modal');
  const modalTitle = document.getElementById('goal-modal-title');
  const form = document.getElementById('goal-form');
  
  // Reset form
  form.reset();
  
  // Set tomorrow as default goal date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('goal-date').valueAsDate = tomorrow;
  
  // Open overlay
  document.getElementById('modal-overlay').classList.remove('hidden');
  
  if (goalId) {
    // Edit mode
    const goal = state.goals.find(g => g.id === goalId);
    if (goal) {
      modalTitle.textContent = 'Edit Goal';
      document.getElementById('goal-id').value = goal.id;
      document.getElementById('goal-name').value = goal.name;
      document.getElementById('goal-target').value = goal.targetAmount;
      document.getElementById('goal-saved').value = goal.savedAmount;
      document.getElementById('goal-date').valueAsDate = new Date(goal.deadline);
      
      state.edit.goal = goal;
    }
  } else {
    // New mode
    modalTitle.textContent = 'New Goal';
    document.getElementById('goal-id').value = '';
    state.edit.goal = null;
  }
  
  // Set currency symbols
  document.getElementById('goal-currency-symbol').textContent = getCurrencySymbol(state.currentUser.currency);
  document.getElementById('goal-saved-currency-symbol').textContent = getCurrencySymbol(state.currentUser.currency);
  
  // Show modal
  modal.classList.remove('hidden');
}

function saveGoal() {
  // Get form values
  const id = document.getElementById('goal-id').value;
  const name = document.getElementById('goal-name').value;
  const targetAmount = parseFloat(document.getElementById('goal-target').value);
  const savedAmount = parseFloat(document.getElementById('goal-saved').value);
  const deadline = document.getElementById('goal-date').valueAsDate;
  
  // Validate
  if (!name || !targetAmount || isNaN(targetAmount) || isNaN(savedAmount) || !deadline) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Ensure saved amount is not greater than target
  if (savedAmount > targetAmount) {
    showToast('Saved amount cannot exceed target amount', 'error');
    return;
  }
  
  // Ensure deadline is in the future
  if (deadline < new Date()) {
    showToast('Deadline must be in the future', 'error');
    return;
  }
  
  if (id && state.edit.goal) {
    // Edit existing goal
    const goal = state.goals.find(g => g.id === id);
    if (goal) {
      goal.name = name;
      goal.targetAmount = targetAmount;
      goal.savedAmount = savedAmount;
      goal.deadline = deadline;
      
      showToast('Goal updated successfully', 'success');
    }
  } else {
    // Create new goal
    const newGoal = {
      id: generateUUID(),
      userId: state.currentUser.id,
      name,
      targetAmount,
      savedAmount,
      deadline,
      createdAt: new Date()
    };
    
    state.goals.push(newGoal);
    showToast('Goal created successfully', 'success');
  }
  
  // Save and update UI
  saveToLocalStorage();
  closeAllModals();
  renderGoals();
}

function deleteGoal(goalId) {
  if (confirm('Are you sure you want to delete this goal?')) {
    state.goals = state.goals.filter(g => g.id !== goalId);
    
    // Save and update UI
    saveToLocalStorage();
    renderGoals();
    
    showToast('Goal deleted successfully', 'success');
  }
}

// Modal functions
function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.add('hidden');
  });
  
  document.getElementById('modal-overlay').classList.add('hidden');
  
  // Reset edit state
  state.edit = {
    transaction: null,
    account: null,
    category: null,
    budget: null,
    goal: null
  };
}

// Utility functions
function getCurrencySymbol(currencyCode = 'USD') {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': '$'
  };
  
  return symbols[currencyCode] || '$';
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("register-btn").addEventListener("click", () => {
    console.log("REGISTER CLICKED");
  });
  
  // ... rest of your event listeners here
});