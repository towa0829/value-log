// 後悔コスト計算
export function calculateRegretCost(amount, satisfaction) {
    return Math.floor(amount * (100 - satisfaction) / 100);
}

// 月/年別集計
export function groupByPeriod(expenses, mode='monthly') {
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


// カテゴリー別に計算
function groupByCategory(expenses) {
    const categoryMap = {};
    expenses.forEach((e) => {
        const cat = e.category || 'その他';
        if (!categoryMap[cat]) {
            categoryMap[cat] = { total: 0, regret: 0, satisfactionSum: 0, count: 0};
        }
        categoryMap[cat].total += e.amount;
        categoryMap[cat].satisfactionSum += e.satisfaction;
        categoryMap[cat].count += 1;
    });
    return categoryMap;
}

function getPreviousPeriod(period) {
    if (period.length === 4) {
        return String(Number(period) - 1);
    } else {

        const [year, month] =period.split('-').map(Number);
        if (month === 1) {
            return `${year - 1}-12`;
        } else {
            return `${year}-${String(month - 1).padStart(2, '0')}`;
        }
    }
}


/*
* AI分析用のJSONデータを生成
* @param {string} period - 期間（YYYY-MM または YYYY）
* @param {Array} expenses - 支出データ配列
* @return {Object} - AI分析用JSONオブジェクト
*/
export function generateAnalysisData(period, expenses) {
    const mode = period.length === 4 ? 'yearly' : 'monthly';

    // 期間別集計を取得
    const periodMap = groupByPeriod(expenses, mode);
    const currentData = periodMap[period] || { total: 0, regret: 0, satisfactionSum: 0, count: 0};

    // 前期間を取得
    const previousPeriod = getPreviousPeriod(period);
    const previousData = periodMap[previousPeriod] || { total:0, regret:0, satisfactionSum:0, count:0};

    // 対象データを抽出してカテゴリ別集計
    const targetExpenses = expenses.filter(e => e.date.startsWith(period));
    const categoryMap = groupByCategory(targetExpenses);

    // カテゴリ別内訳を整形
    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
        category: cat,
        amount: Math.round(categoryMap[cat].total),
        percentage: currentData.total > 0
            ? Math.round((categoryMap[cat].total / currentData.total) * 1000) / 10
            : 0,
        averageSatisfaction: categoryMap[cat].count > 0
            ? Math.round((categoryMap[cat].satisfactionSum / categoryMap[cat].count) * 10) /10
            : 0
    }));

    return {
        period: period,
        totalAmount: Math.round(currentData.total),
        regretCost: Math.round(currentData.regret),
        averageSatisfaction: currentData.count > 0
            ? Math.round((currentData.satisfactionSum / currentData.count) * 10) / 10
            : 0,
        categoryBreakdown: categoryBreakdown,
        previousPeriodComparison: {
            amountChange: Math.round(currentData.total - previousData.total),
            satisfactionChange: currentData.count > 0 && previousData.count > 0
                ? Math.round(((currentData.satisfactionSum / currentData.count) - (previousData.satisfactionSum / previousData.count)) * 10) / 10
                : 0
        }
    };
}



// 割合マップ変換
export function toPercentMap(amountMap) {
    const total = Object.values(amountMap)
        .reduce((sum, v) => sum + v, 0);

    const percentMap = {};
    for (const key in amountMap) {
        percentMap[key] = (amountMap[key] / total * 100);
    }
    return percentMap;
}
