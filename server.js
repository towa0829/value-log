import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { CATEGORY_MAP } from './js/modules/comfig.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// AI分析エンドポイント
app.post('/api/analyze', async (req, res) => {
    try {
        const analysisData = req.body;

        const prompt = `
        以下の支出データを分析し，ユーザーの支出傾向と改善点を日本語で提示してください．
        【期間】${analysisData.period}
        【合計支出額】${analysisData.totalAmount}円
        【後悔コスト】${analysisData.regretCost}円
        【平均満足度】${analysisData.averageSatisfaction}%

        【カテゴリ別内訳】
        ${analysisData.categoryBreakdown.map(cat => 
            `- ${cat.category}: ${cat.amount}円 (${cat.percentage}%, 満足度${cat.averageSatisfaction}%)`
        ).join('\n')}

        【カテゴリ対応表】
        ${Object.entries(CATEGORY_MAP).map(([key, label]) => `- ${key}: ${label}`).join('\n')}

        【前期比較】
        - 支出額変化: ${analysisData.previousPeriodComparison.amountChange > 0 ? '+' : ''}${analysisData.previousPeriodComparison.amountChange}円
        - 満足度変化: ${analysisData.previousPeriodComparison.satisfactionChange > 0 ? '+' : ''}${analysisData.previousPeriodComparison.satisfactionChange}%

        簡潔に3〜5行程度で分析結果を提示してください。
        重要なことは<storong>タグを使って強調してください．
        例： <strong>支出が増加傾向にあります</strong>
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "あなたは家計分析の専門家です．"},
                { role: "user", content: prompt}
            ]
        });

        res.json({
            analysis: completion.choices[0].message.content
        });
    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ error: error.message});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

