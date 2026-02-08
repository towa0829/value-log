// 支出データを取得
function loadExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

// 支出データを保存
function saveExpenses(expenses) {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// 支出データを追加
function addExpense(expense) {
    const expenses = loadExpenses();
    expenses.push(expense);
    saveExpenses(expenses);
}

// 支出データを更新
function updateExpense(index, expense) {
    const expenses = loadExpenses();
    expenses[index] = expense;
    saveExpenses(expenses);
}

// 支出データを削除
function deleteExpenseAt(index) {
    const expenses = loadExpenses();
    expenses.splice(index, 1);
    saveExpenses(expenses);
}