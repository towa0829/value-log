# システム設計書

# アプリ概要

## アプリ名：ValueLog

## 目的

支出金額だけでなく購入後の満足度を記録し，後悔コストを可視化することで将来の購買行動の改善を促す家計簿アプリを提供する

## コンセプト

お金の見える化→後悔の見える化→行動の改善

# 用語定義

| 満足度 | 購入後に感じた満足度を0～100%で入力する指標 |
| --- | --- |
| 後悔コスト | 満足度をもとに算出される無駄だった可能性のある金額（＝節約できたはずのコスト） |
| 支出データ | 1回の購入記録データ |

# コアロジック

### 後悔コスト計算式

```jsx
後悔コスト = 金額 × (100 - 満足度) / 100　
```

# 機能要件

## 支出入力機能

| 項目 | 備考 |
| --- | --- |
| 日付 | data型入力 |
| 金額 | 数値入力 |
| メモ | テキスト入力 |
| 満足度 | 0～100スライダー |
| カテゴリ | 既存カテゴリから選択 |
| 保存 | ローカルストレージへ保存 |

使用カテゴリ：食費，日用品，交通費，固定費，娯楽，自己投資，その他

## 支出一覧表示機能

| 項目 | 備考 |


## 支出一覧表示機能

| 項目 | 備考 |
| --- | --- |
| 日付 |  |
| カテゴリ | 編集可能 |
| 金額 |  |
| 満足度 | 編集可能 |
| 後悔コスト |  |
| 削除ボタン | あり |
| ソート機能 | 登録の新しい順/古い順、日付の新しい順/古い順 |

## 集計・分析機能

| 項目 | 備考 |
| --- | --- |
| 月ごとの集計・分析 | 合計金額 / 後悔コスト / 満足度平均 |
| 年次集計・分析 | 月次/年次切り替え可能 |
| グラフ表示 | カテゴリ別（円グラフ / 棒グラフ） |
| 期間フィルタ | クリックした期間のグラフを表示 |

# 画面設計

未設計

# データ設計

## 保存データ構造

```jsx
	[
		{
			"date": "string", //YYYY-MM-DD
			"amount": "number", //0以上の整数
			"memo": "string",
			"category": "string", //既存カテゴリから選択（空でも可）
			"satisfaction": "number" //0から100
		}
	]
```

## AI分析機能

**目的**
OpenAI APIを使用して支出データを分析し、ユーザーの支出傾向や改善点をテキストで提示する。

**対象データ**
特定期間（月次または年次）の支出データ全体

**処理フロー**
1. 分析対象期間の支出データを集計
2. 以下の情報をOpenAI APIへ送信
   - 合計金額
   - 後悔コスト
   - 満足度平均
   - カテゴリ別支出割合
   - カテゴリ別満足度平均
   - 前月比（増減傾向）
3. AIからの分析結果（テキスト）を取得
4. 分析結果を画面に表示

**AIに送信するJSON形式（リクエスト）**
```jsx
{
  "period": "string",  // YYYY-MM または YYYY
  "totalAmount": "number",
  "regretCost": "number",
  "averageSatisfaction": "number",
  "categoryBreakdown": [
    {
      "category": "string",
      "amount": "number",
      "percentage": "number",
      "averageSatisfaction": "number"
    }
  ],
  "previousPeriodComparison": {
    "amountChange": "number",  // 前月比の増減額
    "satisfactionChange": "number"  // 前月比の満足度変化
  }
}
```

**AIから受け取るJSON形式（レスポンス）**
```jsx
{
  "analysis": "string"  // 分析結果のテキスト
}
```

**表示場所**
analysis.html の「AI分析」セクション

## OpenAI APIスキーマ

# 使用技術

| 技術 | 用途 |
| --- | --- |
| HTML | 画面構造 |
| CSS | デザイン |
| JavaScript | ロジック処理 |
| LocalStorage | データ保存 |
| Chart.js | グラフ描画 |
| OpenAI API | AI分析 |
| fetchAPI | JSON送信処理 |

# ファイル構成
/value-log
│
├─ index.html
├─ list.html
├─ analysis.html
├─ server.js
│
├─ /css
│   ├─ ress.css
│   └─ style.css
│
├─ /js
│   ├─ main.js
│   ├─ list.js
│   ├─ analysis.js
│   │
│   └─ /modules
│       ├─ config.js
│       ├─ calc.js
│       ├─ storage.js
│       ├─ sort.js
│       └─ ai.js
│
├─ /assets
│   └─ images, icons
│
└─ README.md



# 開発手順

## 全体ロードマップ（4フェーズ）

| Phase | 目的 | 技術の主役 |
| --- | --- | --- |
| 1 | LocalStorage 家計簿（CRUD） | HTML / CSS / JS |
| 2 | 分析・グラフ | JS / Chart.js |
| 3 | AI分析 | OpenAI API / fetch |
| 4 | Next.js化＋DB保存 | React / Next / MySQL |

# Phase1：動く家計簿を完成（CRUD）

## Step1：入力画面の見た目

**触る**

- index.html
- css/style.css

作る入力欄

- date
- amount
- memo
- satisfaction（range）
- category（select）
- 保存ボタン

まだJSなし．

---

## Step2：main.js を接続

**触る**

- index.html
- js/main.js

index.html 最下部

```html
<script src="js/modules/config.js"></script>
<script src="js/modules/calc.js"></script>
<script src="js/modules/storage.js"></script>
<script src="js/main.js"></script>
```

main.js

- ボタン取得
- クリック時に各inputの値を console.log

---

## Step3：共通ロジックを分離

**触る**

- js/modules/calc.js
- js/modules/storage.js

calc.js に計算関数作成
storage.js に LocalStorage 操作を集約

main.js から呼び出して console.log

---

## Step4：保存処理を完成

**触る**

- js/modules/storage.js

作る関数

- loadExpenses()
- saveExpenses(expenses)
- addExpense(expense)
- updateExpense(index, expense)
- deleteExpenseAt(index)

---

## Step5：一覧画面

**触る**

- list.html
- js/list.js
- js/modules/storage.js
- js/modules/sort.js

list.html 下部

```html
<script type="module" src="js/list.js"></script>
```

list.js

- loadExpenses() で取得
- ループ表示
- 行クリックで編集
- 削除ボタンで deleteExpenseAt
- ソート機能（登録順/日付順）を実装

**Phase1完成**

---

# Phase2：編集・分析・グラフ

## Step6：一覧で編集可能に

**触る**

- js/list.js

変更点

- モーダル編集
- 満足度は range
- カテゴリは select
- 更新処理は updateExpense

---

## Step7：集計ロジック作成

**触る**

- js/analysis.js
- js/modules/calc.js
- js/modules/sort.js

作る関数

- 月ごとの集計（合計 / 後悔コスト / 満足度平均）
- 年次集計
- カテゴリ別集計（合計 / 割合）
- カテゴリ並び替え（その他を最後に）

---

## Step8：analysis.html と Chart.js

**触る**

- analysis.html
- js/analysis.js

Chart.js読み込み

- カテゴリ別円グラフ（ドーナツチャート）
- カテゴリ別棒グラフ
- 月次/年次切り替えボタン
- 期間クリックでグラフ更新

集計結果を表とグラフに反映

**Phase2完成**

---

# Phase3：AI分析

## Step9：AI分析機能の実装

**触る**

- js/ai.js
- js/analysis.js

実装内容

- 分析対象期間の支出データを集計
- カテゴリ別満足度平均を計算
- 前月比データを計算
- JSON形式でOpenAI APIへ送信
- 分析結果をanalysis.htmlに表示

**Phase3完成**

---

# Phase4：Next.js化＋DB化

ここは後でやる．

やることは置き換えだけ

| 今 | Next化後 |
| --- | --- |
| storage.js | DBアクセス |
| html | React |
| 集計JS | SQL |

設計そのまま使える．