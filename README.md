# recipe_apps
https://github.com/user-attachments/assets/b7173e71-6d18-4311-88cc-c208d97b5d60

## 概要
食材を管理し、選択した食材を使うレシピを絞り込みながら、料理をお盆に並べて献立を考えられる Web アプリです。  
React、Node.js、Express、SQLite に加えて、Amazon Bedrock を使った料理区分判定と料理画像生成を取り入れています。

## 公開URL
https://my-recipe.tatukotatu.com

## 制作背景
フロントエンドだけでなく、API 経由でデータを登録・取得し、データベースへ保存する流れを理解するために制作しました。  
当初は HTML + JavaScript で実装し、その後 React に書き換えることで、状態管理やコンポーネント設計も学びました。  
現在は AI 機能も組み込み、食材管理アプリに「料理区分の自動判定」と「料理ビジュアル生成」を追加しています。

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

### AI / インフラ
- Amazon Bedrock
- AWS EC2
- Nginx

### 開発補助
- DBeaver
- Git / GitHub

## 主な機能
- 食材一覧の表示
- 食材の追加・削除
- レシピ一覧の表示
- レシピの追加・削除
- 選択した食材を使うレシピの絞り込み表示
- Amazon Bedrock を使った料理の `主食 / 主菜 / 副菜` 自動判定
- Amazon Bedrock を使った料理 SVG 画像の生成
- お盆プレビューへの料理配置
- API 経由でのデータ取得・登録・削除
- SQLite へのデータ永続化

## 工夫した点
- 初期実装では `localStorage` を利用していましたが、学習範囲を広げるため API + DB 保存へ移行しました
- React 化にあたり、機能ごとにコンポーネントを分割して責務を整理しました
- `fetch` の処理は `frontend/src/services/api.js` にまとめ、UI と通信処理を分離しました
- 食材の選択状態を親コンポーネントで管理し、レシピ一覧の絞り込みに反映する構成にしました
- Bedrock に料理名と材料を渡して料理区分を推定し、登録時の入力負荷を減らしました
- 生成した料理画像をお盆プレビューに配置できるようにし、献立の見た目がわかる体験にしました

## 起動方法
### API サーバー
```bash
cd api
npm install
npm run dev
```

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

## 本番デプロイ時の補足
- フロントエンドは `npm run build` でビルドし、Nginx から配信します
- API は EC2 上で起動し、Nginx から `/api` にリバースプロキシします
- Bedrock を使うため、EC2 には Bedrock 呼び出し権限を持つ IAM ロールが必要です

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
        TrayPreview.jsx
      services/
        api.js
```
