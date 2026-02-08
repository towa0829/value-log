document.addEventListener('DOMContentLoaded', function() {

    setTodayDate();

    const satisfaction_slider = document.getElementById('satisfaction');
    const satisfaction_display = document.getElementById('satisfactionDisplay');

    satisfaction_slider.addEventListener('input', function() {
        satisfaction_display.textContent = this.value;
    });

    const form = document.getElementById('expenseForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const date = document.getElementById('date').value;
        const amount = document.getElementById('amount').value;
        const memo = document.getElementById('memo').value;
        const satisfaction = document.getElementById('satisfaction').value;
        const category = document.getElementById('category').value;

        if (!date) {
            alert('日付を入力してください');
            return;
        }
        if(!amount || amount <= 0) {
            alert('支出額を正しく入力してください');
            return;
        }
        
        const expenseData = {
            date: date,
            amount: Number(amount),
            memo: memo,
            satisfaction: Number(satisfaction),
            category: category
        };
        
        saveExpense(expenseData);

        console.log('保存しました:', expenseData);

        form.reset();
        setTodayDate();
        satisfaction_display.textContent = document.getElementById('satisfaction').value;
    });
});

function setTodayDate() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function saveExpense(data) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push(data);
    localStorage.setItem('expenses', JSON.stringify(expenses));
}