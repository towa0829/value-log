import { categoryMap } from './modules/config.js';
import { loadExpenses } from './modules/storage.js';
import { calculateRegretCost } from './modules/calc.js'

const monthSelect = document.getElementById('monthSelect');
const summaryTbody = document.querySelector('#monthlySummaryTable tbody');
let categoryChart, categoryBarChart;

// 月別集計
function groupByMonth(expenses) {
    const map = {};
    expenses.forEach((e) => {
        const month = e.date.slice(0, 7);
        if (!map[month]) {
            map[month] = { total: 0, regret: 0, satisfactionSum: 0, count: 0};
        }
        const regret = calculateRegretCost(e.amount, e.satisfaction);
        map[month].total += e.amount;
        map[month].regret += regret;
        map[month].satisfactionSum += e.satisfaction;
        map[month].count += 1;
    });
    return map;
}


// 月別集計の表示
function renderMonthlySummary(expenses) {
    const monthly = groupByMonth(expenses);
    summaryTbody.innerHTML = '';

    const months= Object.keys(monthly).sort().reverse();
    if(months.length === 0) {
        summaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">データがありません</td></tr>';
    }

    months.forEach((month) => {
        const data = monthly[month];
        const avgSatisfaction = Math.round(data.satisfactionSum / data.count);
        const row =summaryTbody.insertRow();
        row.insertCell(0).textContent = month;
        row.insertCell(1).textContent = data.total.toLocaleString() + '円';
        row.insertCell(2).textContent = avgSatisfaction + '%';
        row.insertCell(3).textContent = data.regret.toLocaleString() + '円';
    });
}

// カテゴリ別集計
function groupByCategory(expenses) {
    const map = {};
    expenses.forEach((e) => {
        const name = categoryMap[e.category] || '未分類';
        map[name] = (map[name] || 0) + e.amount;
    });
    return map;
}

// カテゴリ別円グラフ
function renderCategoryChart(expenses) {
    const byCat = groupByCategory(expenses);
    const labels = Object.keys(byCat);
    const data = labels.map((k) => byCat[k]);

    if(categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#4E79A7', // blue
                    '#F28E2B', // orange
                    '#E15759', // red
                    '#76B7B2', // teal
                    '#59A14F', // green
                    '#EDC948', // yellow
                    '#B07AA1', // purple
                    ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom"}
            }
        }
    });
}

// カテゴリ別棒グラフ
function renderCategoryBarChart(expenses) {
    const byCat = groupByCategory(expenses);
    const labels = Object.keys(byCat);
    const data = labels.map((k) => byCat[k]);

    if(categoryBarChart) {
        categoryBarChart.destroy();
    }

    categoryBarChart = new Chart(document.getElementById('categoryBarChart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '支出金額（円）',
                data,
                backgroundColor: [
                    '#4E79A7', // blue
                    '#F28E2B', // orange
                    '#E15759', // red
                    '#76B7B2', // teal
                    '#59A14F', // green
                    '#EDC948', // yellow
                    '#B07AA1', // purple
                    ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () =>{
    const expenses = loadExpenses();

    if (expenses.length === 0) {
        summaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">データがありません</td></tr>';
        return;
    }

    renderMonthlySummary(expenses);
    renderCategoryChart(expenses);
    renderCategoryBarChart(expenses);
})