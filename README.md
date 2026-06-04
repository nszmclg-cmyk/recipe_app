# recipe_apps

## 概要
食材を管理し、選択した食材を使うレシピを絞り込めるWebアプリです。  
フロントエンド・バックエンド・データベースの連携を学ぶことを目的に、React、Node.js、Express、SQLite を使って作成しました。

## 公開URL
https://xxxxx

## 制作背景
フロントエンドだけでなく、API経由でデータを登録・取得し、データベースに保存する流れを理解するために制作しました。  
当初は HTML + JavaScript で実装し、その後 React に書き換えることで、状態管理やコンポーネント設計も学びました。

## 使用技術
### フロントエンド
- React
- Vite
- CSS

### バックエンド
- Node.js
- Express

### データベース
- SQLite

### 開発補助
- DBeaver
- Git / GitHub

## 主な機能
- 食材一覧の表示
- 食材の追加・削除
- レシピ一覧の表示
- レシピの追加・削除
- 選択した食材を使うレシピの絞り込み表示
- API経由でのデータ取得・登録・削除
- SQLiteへのデータ永続化

## 工夫した点
- 初期実装では `localStorage` を利用していましたが、学習目的を広げるため API + DB 保存へ移行しました
- React 化にあたり、`App.jsx` に集まりやすい処理を `IngredientSection` と `RecipeSection` に分割し、責務を整理しました
- `fetch` の処理は `services/api.js` にまとめ、UI と通信処理を分離しました
- 食材の選択状態を親コンポーネントで管理し、レシピ一覧の絞り込みに反映する構成にしました

## 起動方法
### APIサーバー
cd api
npm install
npm run dev

### フロントエンド
cd frontend
npm install
npm run dev

## アプリ構成
```text
recipe_apps/
  api/
    server.js
    recipes.db
  frontend/
    src/
      App.jsx
      App.css
      main.jsx
      components/
        IngredientSection.jsx
        RecipeSection.jsx
      services/
        api.js
