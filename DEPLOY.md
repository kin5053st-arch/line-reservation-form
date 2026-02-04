# Vercelへのデプロイ手順

GitHubと連携してVercelでこの予約フォームを公開する手順です。

## 1. Gitの準備（ローカル）

ターミナル（コマンドプロンプトやPowerShell）で以下のコマンドを実行します。

```bash
# Gitの初期化
git init

# 全ファイルをステージング
git add .

# コミット
git commit -m "Initial commit: LIFF Reservation Form"
```

## 2. GitHubリポジトリの作成

1. [GitHub](https://github.com/)にログインして、右上の「+」から「New repository」を選択します。
2. **Repository name** を入力（例: `liff-reservation-form`）。
3. **Public**（公開）または **Private**（非公開）を選択します。
4. 「Create repository」をクリックします。

## 3. GitHubへプッシュ

GitHubのリポジトリ作成後の画面に表示されるコマンドを実行します。

```bash
# リモートリポジトリを追加（URLは自分のものに書き換えてください）
git remote add origin https://github.com/YOUR_USERNAME/liff-reservation-form.git

# メインブランチ名をmainに変更
git branch -M main

# プッシュ
git push -u origin main
```

## 4. Vercelでの設定

1. [Vercel](https://vercel.com/)にログインします。
2. ダッシュボードの「Add New...」ボタンから「Project」を選択します。
3. 「Import Git Repository」のリストから、先ほど作成した `liff-reservation-form` の「Import」ボタンを押します。
4. 設定画面が表示されますが、基本的にはそのままでOKです。
   - **Framework Preset**: Other (または自動検出)
   - **Build Command**: 空欄でOK
   - **Output Directory**: 空欄でOK
5. 「Deploy」をクリックします。

数秒〜数十秒でデプロイが完了し、URL（例: `https://liff-reservation-form.vercel.app`）が発行されます。

## 5. 動作確認とLIFF設定

発行されたVercelのURLにアクセスして表示を確認してください。

その後、LINE DevelopersコンソールでLIFFアプリの設定を変更します：
- **Endpoint URL**: 発行されたVercelのURLを設定

これで、LINEアプリから開いたときもVercel上の最新版が表示されるようになります。GitHubにプッシュするたびに、Vercelが自動的に最新版をデプロイしてくれます。
