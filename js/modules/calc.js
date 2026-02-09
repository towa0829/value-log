// 後悔コスト計算
export function calculateRegretCost(amount, satisfaction) {
    return Math.floor(amount * (100 - satisfaction) / 100);
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
