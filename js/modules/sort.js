// 支出データの並び替え
export function sortExpenses(expenses, mode) {
    const copied = [...expenses];

    switch (mode) {
        case 'created_desc':
            return copied.reverse();
        
        case 'created_asc':
            return copied;

        case 'date_desc': 
            return copied.sort((a, b) => new Date(b.date) - new Date(a.date));

        case 'date_acs':
            return copied.sort((a, b) => new Date(a.date) - new Date(b.date));

        default:
            return copied;
    }
}


// その他を必ず最後に
export function sortCategoryMap(map) {
    const entries = Object.entries(map);

    entries.sort((a, b) => {
        if (a[0] === 'その他') return 1;
        if (b[0] === 'その他') return -1;
        return 0;
    });

    return Object.fromEntries(entries);
}
