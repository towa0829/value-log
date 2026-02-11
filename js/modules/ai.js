/*
* AI分析をリクエスト
* @param {Object} analysisData - 分析データ
* @return {Promise<Object>} - AI分析結果
*/

export async function requestAiAnalysis(analysisData) {
    const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisData)
    });

    if(!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
    }

    return await response.json();
}