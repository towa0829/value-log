import { CATEGORY_MAP, CHART_COLORS } from './modules/config.js';
import { loadExpenses } from './modules/storage.js';
import { calculateRegretCost } from './modules/calc.js';


const btnMonthly = document.getElementById('btnMonthly');
const btnYearly = document.getElementById('btnYearly');

const summaryTbody = document.querySelector('#monthlySummaryTable tbody');
const yearSelector = document.getElementById('yearSelector');
let categoryChart, categoryBarChart;

// 月別集計
function groupByPeriod(expenses, mode='monthly') {
    const map = {};
    expenses.forEach((e) => {
        const period = mode === 'yearly' ? e.date.slice(0, 4) : e.date.slice(0, 7);
        if (!map[period]) {
            map[period] = { total: 0, regret: 0, satisfactionSum: 0, count: 0};
        }
        const regret = calculateRegretCost(e.amount, e.satisfaction);
        map[period].total += e.amount;
        map[period].regret += regret;
        map[period].satisfactionSum += e.satisfaction;
        map[period].count += 1;
    });
    return map;
}

// 月別集計の表示
function renderSummaryTable(expenses, mode = 'monthly') {
    const grouped = groupByPeriod(expenses, mode);
    summaryTbody.innerHTML = '';

    const keys = Object.keys(grouped).sort().reverse();
    if (keys.length === 0) {
        summaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">データがありません</td></tr>';
        yearSelector.style.display = 'none';
        return;
    }

    if (mode === 'yearly') {
        yearSelector.style.display = 'none';
        keys.forEach((key) => {
            const data = grouped[key];
            const avgSatisfaction = Math.round(data.satisfactionSum / data.count);

            const row = summaryTbody.insertRow();
            row.classList.add('period-row');
            row.dataset.period = key;

            row.insertCell(0).textContent = key;
            row.insertCell(1).textContent = data.total.toLocaleString() + '円';
            row.insertCell(2).textContent = avgSatisfaction + '%';
            row.insertCell(3).textContent = data.regret.toLocaleString() + '円';

            row.style.cursor = 'pointer';
            row.onclick = () => {
                const filtered = filterByPeriod(expenses, key, mode);
                renderCategoryChart(filtered);
                renderCategoryBarChart(filtered);
            }
        });
        return;
    }

    const yearMap = {};
    keys.forEach((key) => {
        const year = key.slice(0, 4);
        if (!yearMap[year]) yearMap[year] = [];
        yearMap[year].push(key);
    });

    const years = Object.keys(yearMap).sort().reverse();
    const latestYear = years[0];

    yearSelector.style.display = 'block';
    yearSelector.innerHTML = years
        .map((y) => `<button type="button" class="year-select ${y === latestYear ? 'active' : ''}" data-year="${y}">${y}年</button>`)
        .join(' ');

    yearSelector.onclick = (e) => {
        const yearBtn = e.target.closest('.year-select');
        if (yearBtn) {
            const year = yearBtn.dataset.year;
            yearSelector.querySelectorAll('.year-select').forEach((b) => b.classList.remove('active'));
            yearBtn.classList.add('active');

            summaryTbody.querySelectorAll('tr.month-row').forEach((r) => {
                r.style.display = r.dataset.year === year ? '' : 'none';
            });
         }
    };

    years.forEach((year) => {
        yearMap[year].forEach((key) => {
            const data = grouped[key];
            const avgSatisfaction = Math.round(data.satisfactionSum / data.count);

            const row = summaryTbody.insertRow();
            row.classList.add('month-row');
            row.dataset.year = year;
            row.dataset.period = key;

            const month = parseInt(key.slice(5));
            row.insertCell(0).textContent = month + '月';
            row.insertCell(1).textContent = data.total.toLocaleString() + '円';
            row.insertCell(2).textContent = avgSatisfaction + '%';
            row.insertCell(3).textContent = data.regret.toLocaleString() + '円';

            row.style.cursor = 'pointer';
            row.onclick = () => {
                const filtered = filterByPeriod(expenses, key, mode);
                renderCategoryChart(filtered);
                renderCategoryBarChart(filtered);
            }
            if (year !== latestYear) row.style.display = 'none';
        });
    });
}

function filterByPeriod(expenses, periodKey, mode = 'monthly') {
    return expenses.filter((e) => {
        const key = mode === 'yearly' ? e.date.slice(0, 4) : e.date.slice(0,7);
        return key === periodKey;
    })
}

// カテゴリ別集計
function groupByCategory(expenses) {
    const map = {};
    expenses.forEach((e) => {
        const name = CATEGORY_MAP[e.category] || '未分類';
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
                backgroundColor: CHART_COLORS
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
                backgroundColor: CHART_COLORS
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

function getLatestPeriodKey(expenses, mode = 'monthly') {
    const grouped = groupByPeriod(expenses, mode);
    const keys = Object.keys(grouped).sort().reverse();
    return keys.length > 0 ? keys[0] : null;
}

function renderLatestPeriodCharts(expenses, mode = 'monthly') {
    const latestKey = getLatestPeriodKey(expenses, mode);
    if (!latestKey) return;
    const filtered = filterByPeriod(expenses, latestKey, mode);
    renderCategoryChart(filtered);
    renderCategoryBarChart(filtered);
}

function handlePeriodChange(mode) {
    const button = mode === 'monthly' ? btnMonthly : btnYearly;
    const otherButton = mode === 'monthly' ? btnYearly : btnMonthly;


    button.classList.add('active');
    otherButton.classList.remove('active');

    const expenses = loadExpenses();
    renderSummaryTable(expenses, mode);
    renderLatestPeriodCharts(expenses, mode);
}

btnMonthly.addEventListener('click', () => {
    handlePeriodChange('monthly');
});

btnYearly.addEventListener('click', () => {
    handlePeriodChange('yearly');
});

document.addEventListener('DOMContentLoaded', () =>{
    const expenses = loadExpenses();

    if (expenses.length === 0) {
        summaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">データがありません</td></tr>';
        return;
    }

    renderSummaryTable(expenses, 'monthly');
    renderLatestPeriodCharts(expenses, 'monthly');
})