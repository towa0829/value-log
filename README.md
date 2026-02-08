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

使用カテゴリ：食費，日用品，衣服，交通費，娯楽，自己投資，その他

## AIカテゴリ自動分類機能

**目的**
カテゴリ設定の支出データをまとめてAIに送信し，一括でカテゴリを付与する．
支出登録時にはAPIを使用しない．

**対象データ**
LocalStorageに保存されている支出データのうち，以下の状態を満たすもの

```jsx
category == “” または null
```

**処理フロー**
1．LocalStorageから全支出データを取得
2．カテゴリ未設定データのみ抽出
3．JSON配列としてOpenAI APIへ送信
4．各データに対応するカテゴリ一覧を取得
5．該当データにカテゴリを反映
6．LocalStorageを更新

**AIに送信するJSON形式（リクエスト）**

```jsx
[
	{
		"id": "string",
		"memo": "string"
	}
]

```

**AIから受け取るJSON形式（レスポンス）**

```jsx
[
	{
		"id": "string",
		"category": "string" //既存カテゴリから選択させる
	}
]
```

## 支出一覧表示機能

| 項目 | 備考 |
| --- | --- |
| 日付 |  |
| カテゴリ | 編集可能 |
| 金額 |  |
| 満足度 | 編集可能 |
| 後悔コスト |  |
| 削除ボタン | あり |

## 集計・分析機能

| 項目 | 備考 |
| --- | --- |
| 月ごとの集計・分析 | 合計金額 / 後悔コスト / 満足度平均 |
| グラフ表示 | カテゴリ別（円グラフ / 棒グラフ） |

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

## OpenAI APIスキーマ

# 使用技術

| 技術 | 用途 |
| --- | --- |
| HTML | 画面構造 |
| CSS | デザイン |
| JavaScript | ロジック処理 |
| LocalStorage | データ保存 |
| Chart.js | グラフ描画 |
| OpenAI API | カテゴリ自動分類 |
| fetchAPI | JSON送信処理 |

# ファイル構成
/value-log
│
├─ index.html
├─ list.html
├─ graph.html
│
├─ /css
│   ├─ ress.css
│   └─ style.css
│
├─ /js
│   ├─ main.js
│   ├─ list.js
│   ├─ chart.js
│   ├─ ai.js
│   └─ /modules
│       ├─ config.js
│       ├─ calc.js
│       └─ storage.js
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
| 3 | AIカテゴリ自動分類 | OpenAI API / fetch |
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
- js/storage.js

list.html 下部

```html
<script src="js/modules/config.js"></script>
<script src="js/modules/calc.js"></script>
<script src="js/modules/storage.js"></script>
<script src="js/list.js"></script>
```

list.js

- loadExpenses() で取得
- ループ表示
- 行クリックで編集
- 削除ボタンで deleteExpenseAt

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

- js/graph.js

作る関数

- 月ごとの集計（合計 / 後悔コスト / 満足度平均）
- カテゴリ別集計（合計 / 割合）

---

## Step8：graph.html と Chart.js

**触る**

- graph.html
- js/graph.js

Chart.js読み込み

- カテゴリ別円グラフ
- カテゴリ別棒グラフ

集計結果を表とグラフに反映

**Phase2完成**

---

# Phase3：AIカテゴリ自動分類

## Step9：未分類データ抽出

**触る**

- js/ai.js
- js/storage.js

getAllData()

categoryが空のものだけ抽出

指定JSONに整形

---

## Step10：OpenAIへ送信

**触る**

- js/ai.js

fetchでJSON送信

JSON受信

---

## Step11：LocalStorage更新

**触る**

- js/ai.js
- js/storage.js

返却された id と category をもとに

既存データを書き換え

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