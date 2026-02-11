import { CATEGORY_MAP, CHART_COLORS } from './modules/config.js';
import { loadExpenses } from './modules/storage.js';
import { groupByPeriod, toPercentMap, generateAnalysisData } from './modules/calc.js';
import { sortCategoryMap } from './modules/sort.js';
import { requestAiAnalysis } from './modules/ai.js';

const btnMonthly = document.getElementById('btnMonthly');
const btnYearly = document.getElementById('btnYearly');
const summaryTbody = document.querySelector('#monthlySummaryTable tbody');
const yearSelector = document.getElementById('yearSelector');

const btnAiAnalysis = document.getElementById('ai-analysis');

const pieChartTitle = document.querySelector('.pie-chart .sec-title');
const barChartTitle = document.querySelector('.bar-chart .sec-title');
let categoryChart, categoryBarChart;


// 月/年別集計の表示
function renderSummaryTable(expenses, mode = 'monthly') {
    const grouped = groupByPeriod(expenses, mode);
    summaryTbody.innerHTML = '';

    const keys = Object.keys(grouped).sort().reverse();
    if (keys.length === 0) {
        summaryTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">データがありません</td></tr>';
        yearSelector.innerHTML = '';
        return;
    }

    if (mode === 'yearly') {
        yearSelector.innerHTML = '';
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
                document.querySelectorAll('.period-row').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
                const filtered = filterByPeriod(expenses, key, mode);
                renderCategoryChart(filtered, key);
                renderCategoryBarChart(filtered, key);
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

    yearSelector.innerHTML = `
        <select id="yearSelect">
            ${years.map((y) => `<option value="${y}" ${y === latestYear ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
    `;

    document.getElementById('yearSelect').addEventListener('change', (e) => {
        const year = e.target.value;
        summaryTbody.querySelectorAll('tr.month-row').forEach((r) => {
            r.style.display = r.dataset.year === year ? '' : 'none';
        });
    });

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
                document.querySelectorAll('.month-row').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
                const filtered = filterByPeriod(expenses, key, mode);
                const month = parseInt(key.slice(5));
                renderCategoryChart(filtered, `${month}月`);
                renderCategoryBarChart(filtered, `${month}月`);
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

// AI分析
btnAiAnalysis.addEventListener('click', async () => {
    try {
        // 現在選択されている期間を取得
        const currentMode = btnMonthly.classList.contains('active') ? 'monthly' : 'yearly';
        const expenses = loadExpenses();

        // 最新期間または選択中の期間を特定
        const activePeriodRow = document.querySelector('.period-row.selected, .month-row.selected');
        let period;

        if (activePeriodRow) {
            period = activePeriodRow.dataset.period;
        } else {
            period = getLatestPeriodKey(expenses, currentMode);
        }

        if (!period) {
            alert('分析対象の期間が見つかりません．');
            return;
        }

        // AI分析用データ生成
        const analysisData = generateAnalysisData(period, expenses);

        // ローディング表示
        const resultArea = document.getElementById('ai-analysis-result');
        resultArea.textContent = '分析中...';

        // AI APIへリクエスト
        const result = await requestAiAnalysis(analysisData);

        // 結果を表示
        resultArea.textContent = result.analysis;
    }catch (error) {
        console.log('AI分析エラー:', error);
        document.getElementById('ai-analysis-result').textContent = 'エラーが発生しました: ' + error.message;
    }
});

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
function renderCategoryChart(expenses, periodLabel = '全期間') {
    const byCat = groupByCategory(expenses);   // 金額
    const sorted = sortCategoryMap(byCat);    // 並び替え（表示用）
    const percent = toPercentMap(sorted);     // 表示用に変換
    const labels = Object.keys(percent);
    const data = labels.map(k => percent[k]);


    pieChartTitle.textContent = `カテゴリ別支出割合（円グラフ）- ${periodLabel}`;

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
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: "right",
                    align: "center"
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                        return `${ctx.label}: ${ctx.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// カテゴリ別棒グラフ
function renderCategoryBarChart(expenses, periodLabel = '全期間') {
    const byCat = groupByCategory(expenses);
    const sorted = sortCategoryMap(byCat);
    const labels = Object.keys(sorted);
    const data = labels.map((k) => sorted[k]);

    barChartTitle.textContent = `カテゴリ別支出（棒グラフ）- ${periodLabel}`;

    if(categoryBarChart) {
        categoryBarChart.destroy();
    }

    categoryBarChart = new Chart(document.getElementById('categoryBarChart'), {
        type: 'bar',
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
                legend: { 
                    display: false 
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                        return `${ctx.label}: ${ctx.raw}円`;
                        }
                    }
                }
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
    const label = mode === 'yearly' ? latestKey : `${parseInt(latestKey.slice(5))}月`;
    renderCategoryChart(filtered, label);
    renderCategoryBarChart(filtered, label);
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