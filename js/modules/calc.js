// 後悔コスト計算
function calculateRegretCost(amount, satisfaction) {
    return Math.floor(amount * (100 - satisfaction) / 100);
}