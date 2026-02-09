import { loadExpenses, updateExpense, deleteExpenseAt} from './modules/storage.js';
import { CATEGORY_MAP } from './modules/config.js';
import { calculateRegretCost } from './modules/calc.js';
import { sortExpenses } from './modules/sort.js';

let currentSortMode = 'created_desc';


document.addEventListener('DOMContentLoaded', function() {
    setupSortSelect();
    renderExpenses();
    setupEditModal();
});

function setupSortSelect() {
    const sortSelect = document.getElementById('sortMode');
    if(!sortSelect) return;

    sortSelect.value = currentSortMode;
    sortSelect.addEventListener('change', function() {
        currentSortMode = this.value;
        renderExpenses();
    });
}

function prepareExpensesForView(expenses, sortMode) {
    return sortExpenses(
        expenses.map((e, i) => ({ ...e, originalIndex: i})),
        sortMode
    );
}


// 支出データの読み込みと表示
function renderExpenses() {
    const expenses = loadExpenses();
    const tableBody = document.getElementById('expenseTableBody');

    tableBody.innerHTML = '';

    // データがないときの処理
    if(expenses.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.textContent = 'データがありません';
        cell.style.textAlign = 'center';
        return;
    }

    const viewExpenses = prepareExpensesForView(expenses, currentSortMode);
    viewExpenses.forEach(function(expense) {
        const row = tableBody.insertRow();

        row.insertCell(0).textContent = expense.date;
        row.insertCell(1).textContent = expense.amount + '円';
        row.insertCell(2).textContent = expense.memo || '-';
        row.insertCell(3).textContent = expense.satisfaction + '%';
        row.insertCell(4).textContent = CATEGORY_MAP[expense.category] || '未分類';

        const regretCost = calculateRegretCost(expense.amount, expense.satisfaction);
        row.insertCell(5).textContent = regretCost + '円';

        // 操作ボタン
        const deleteCell = row.insertCell(6);

        // 行をクリック
        row.style.cursor = 'pointer';
        row.addEventListener('click',function() {
            openEditModal(expense.originalIndex);
        });


        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'deleteButton';
        deleteButton.addEventListener('click',function(event) {
            event.stopPropagation();
            if(!confirm('本当に削除しますか?')) {
                return;
            }
            deleteExpenseAt(expense.originalIndex); // storage.js
            closeEditModal();
            renderExpenses();
        });
        deleteCell.appendChild(deleteButton);
    });
}

// 編集モーダルのセットアップ
function setupEditModal() {
    const editSatisfaction = document.getElementById('editSatisfaction');
    const editSatisfactionDisplay = document.getElementById('editSatisfactionDisplay');

    editSatisfaction.addEventListener('input', function() {
        editSatisfactionDisplay.textContent = this.value;
    });

    document.getElementById('cancelEdit').addEventListener('click', function() {
        closeEditModal();
    });

    document.getElementById('editForm').addEventListener('submit', function(event) {
        event.preventDefault();
        saveEdit();
    });
}

// 編集モーダルを開く
function openEditModal(index) {
    const expenses = loadExpenses();
    const expense = expenses[index];

    document.getElementById('editIndex').value = index;
    document.getElementById('editDate').value = expense.date;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editMemo').value = expense.memo;
    document.getElementById('editSatisfaction').value = expense.satisfaction;
    document.getElementById('editSatisfactionDisplay').textContent = expense.satisfaction;
    document.getElementById('editCategory').value = expense.category;

    document.getElementById('edit-item').style.display = 'block';
    document.getElementById('edit-overlay').style.display = 'block';
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('edit-item').style.display = 'none';
    document.getElementById('edit-overlay').style.display = 'none';
}


// 編集した内容を保存
function saveEdit() {
    const index = parseInt(document.getElementById('editIndex').value, 10);

    const expense = {
        date: document.getElementById('editDate').value,
        amount: Number(document.getElementById('editAmount').value),
        memo: document.getElementById('editMemo').value,
        satisfaction: Number(document.getElementById('editSatisfaction').value),
        category: document.getElementById('editCategory').value,
    };

    updateExpense(index, expense);
    closeEditModal();
    renderExpenses();
}

