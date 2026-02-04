# LIFF予約フォーム

整骨院向けのLINE LIFF予約フォームです。

## 概要

LINEのトーク内から開く予約フォームで、ユーザーはLINEから離脱せずに最短ステップで予約を完了できます。

## ファイル構成

```
LIFE予約フォーム/
├── index.html          # メインHTMLファイル
├── css/
│   └── style.css       # スタイルシート
├── js/
│   ├── config.js       # 設定ファイル
│   ├── app.js          # メインアプリケーション
│   ├── validation.js   # バリデーション処理
│   └── liff-init.js    # LIFF SDK初期化
└── README.md           # このファイル
```

## セットアップ手順

### 1. LIFF IDの設定

1. [LINE Developers](https://developers.line.biz/)にアクセス
2. LIFFアプリを作成し、LIFF IDを取得
3. `js/config.js`の`LIFF_ID`を取得したIDに変更

```javascript
const LIFF_ID = 'your-liff-id-here';
```

### 2. Webhook URLの設定

n8nなどのWebhook URLを`js/config.js`で設定します。

```javascript
const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/reservation';
```

### 3. 院名の設定

`js/config.js`の`CLINIC_NAME`を変更してください。

```javascript
const CLINIC_NAME = '〇〇整骨院';
```

### 4. デプロイ

1. ファイルをWebサーバーにアップロード
2. LIFFアプリのエンドポイントURLを設定
3. LINE公式アカウントのリッチメニューやメッセージからLIFF URLを呼び出し

## カスタマイズ

### メニューの追加・変更

`js/config.js`の`TREATMENT_MENUS`配列を編集します。

```javascript
const TREATMENT_MENUS = [
  {
    id: 'shoulder',      // メニューID（ユニーク）
    name: '肩こり',       // 表示名
    durationMin: 30,     // 所要時間（分）
    description: '説明', // 説明文（省略可）
  },
  // 追加...
];
```

### 営業時間の変更

`js/config.js`の`BUSINESS_HOURS`を編集します。

```javascript
const BUSINESS_HOURS = {
  startHour: 9,    // 開始時間
  endHour: 18,     // 終了時間
  interval: 60,    // 時間枠の間隔（分）
};
```

### 予約可能日数の変更

```javascript
const AVAILABLE_DAYS = 7;  // 今日から7日分
```

## 送信データ形式

予約確定時にWebhookへ送信されるJSONデータ：

```json
{
  "userId": "Uxxxxxxxxxxxx",
  "source": "richmenu",
  "menuId": "shoulder",
  "menuName": "肩こり",
  "visitType": "first",
  "startDateTime": "2026-02-05T10:00:00+09:00",
  "endDateTime": "2026-02-05T10:30:00+09:00",
  "durationMin": 30,
  "customerName": "山田 太郎",
  "phone": "090-1234-5678",
  "symptomNote": "肩こりがひどいです",
  "memo": "",
  "clientTimestamp": "2026-02-04T15:30:00+09:00"
}
```

## 将来の拡張

### 空き枠のリアルタイム取得

`js/config.js`で以下を設定すると、n8nから空き枠を取得できます。

```javascript
const AVAILABILITY_API_URL = 'https://your-api.com/available-slots';
const ENABLE_AVAILABILITY_CHECK = true;
```

APIは以下の形式でJSONを返してください：

```json
{
  "slots": ["09:00", "10:00", "14:00", "15:00"]
}
```

## ローカルでのテスト

1. HTMLファイルをブラウザで直接開く
2. または、ローカルサーバーを起動（例：VS CodeのLive Server）

※ LIFF機能はLINEアプリ内でのみ動作します。ブラウザでは開発モードで動作します。

## バリデーションルール

| 項目 | ルール |
|------|--------|
| 氏名 | 必須、50文字以内 |
| 電話番号 | 必須、数字とハイフン、10〜11桁 |
| 症状メモ | 任意、200文字以内 |
| 連絡事項 | 任意、200文字以内 |

## サポート

ご不明な点がございましたら、開発者までお問い合わせください。
