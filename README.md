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
| カテゴリ | 変更可能にしたい |
| 金額 |  |
| 満足度 | 変更可能にしたい |
| 後悔コスト |  |
| 削除ボタン |  |

## 集計・分析機能

| 項目 | 備考 |
| --- | --- |
| 週ごとの集計・分析 |  |
| 月ごとの集計・分析 |  |
| カテゴリ別後悔コスト |  |
| グラフ表示 |  |

# 画面設計

未設計

# データ設計

## 保存データ構造

```jsx
	[
		{
			"id": "string", //uuid
			"date": "string", //YYYY-MM-DD
			"ActualCost": "number", //0以上の整数
			"memo": "string",
			"category": "string", //既存カテゴリから選択
			"satisfaction": "number", //0から100
			"regretCost": "number"
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
│   └─ style.css
│
├─ /js
│   ├─ main.js
│   ├─ list.js
│   ├─ storage.js
│   ├─ calc.js
│   ├─ chart.js
│   └─ ai.js
│
├─ /assets
│   └─ images, icons
│
└─ README.md



# 開発手順

## 全体ロードマップ（4フェーズ）

| Phase | 目的 | 技術の主役 |
| --- | --- | --- |
| 1 | LocalStorage 家計簿を完成 | HTML / CSS / JS |
| 2 | 分析・グラフ・編集機能 | JS / Chart.js |
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
<scriptsrc="js/main.js"></script>
```

main.js

- ボタン取得
- クリック時に各inputの値を console.log

---

## Step3：後悔コスト計算を分離

**触る**

- js/calc.js
- js/main.js

calc.js に計算関数作成

main.js から呼び出して console.log

---

## Step4：LocalStorage専門ファイル

**触る**

- js/storage.js

作る関数

- saveData(data)
- getAllData()
- deleteData(id)

単体で console 確認して動作テスト

---

## Step5：保存処理を完成

**触る**

- js/main.js
- js/storage.js
- js/calc.js

流れ

1．値取得

2．regretCost計算

3．データオブジェクト作成（uuid含む）

4．saveDataへ渡す

ここで保存完成

---

## Step6：一覧画面

**触る**

- list.html
- js/list.js
- js/storage.js

list.html 下部

```html
<scriptsrc="js/storage.js"></script><scriptsrc="js/list.js"></script>
```

list.js

- getAllData()
- ループ表示
- 削除ボタンで deleteData

**Phase1完成**

---

# Phase2：編集・分析・グラフ

## Step7：一覧で編集可能に

**触る**

- js/list.js

変更点

- satisfaction を range に
- category を select に

変更時に LocalStorage 更新処理を書く

---

## Step8：集計ロジック作成

**触る**

- js/chart.js

作る関数

- 週ごとの集計
- 月ごとの集計
- カテゴリ別 regretCost 合計

まだグラフ描画しない

consoleで集計確認

---

## Step9：graph.html と Chart.js

**触る**

- graph.html
- js/chart.js

Chart.js読み込み

集計結果をグラフに渡す

**Phase2完成**

---

# Phase3：AIカテゴリ自動分類

## Step10：未分類データ抽出

**触る**

- js/ai.js
- js/storage.js

getAllData()

categoryが空のものだけ抽出

指定JSONに整形

---

## Step11：OpenAIへ送信

**触る**

- js/ai.js

fetchでJSON送信

JSON受信

---

## Step12：LocalStorage更新

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