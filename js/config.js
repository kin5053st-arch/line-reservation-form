/**
 * LIFF予約フォーム 設定ファイル
 * 
 * このファイルで設定値を一元管理します。
 * Webhook URLやメニュー設定は、ここで変更してください。
 */

// ============================================
// 基本設定
// ============================================

/**
 * n8n Webhook URL
 * 予約データの送信先です。本番環境に合わせて変更してください。
 */
const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/reservation';

/**
 * LIFF ID
 * LINE Developersコンソールで取得したLIFF IDを設定してください。
 */
const LIFF_ID = 'your-liff-id-here';

/**
 * ヘッダータイトル（必要に応じて変更可能）
 */
const HEADER_TITLE = 'ご予約';

/**
 * 予約の送信元（richmenu または chat）
 * URLパラメータで上書き可能
 */
const DEFAULT_SOURCE = 'richmenu';

// ============================================
// 営業時間設定
// ============================================

/**
 * 営業時間の設定
 * startHour: 開始時間（24時間表記）
 * endHour: 終了時間（24時間表記）
 * interval: 時間枠の間隔（分）
 */
const BUSINESS_HOURS = {
  startHour: 9,
  endHour: 18,
  interval: 60, // 60分刻み
};

/**
 * 予約可能な日数（今日から何日先まで表示するか）
 */
const AVAILABLE_DAYS = 7;

// ============================================
// 施術メニュー設定
// ============================================

/**
 * 初診用メニュー
 */
const FIRST_VISIT_MENU = {
  id: 'first_consult',
  name: '相談して決めたい',
  durationMin: 60,
  description: '初めての方は、まずご相談ください',
};

/**
 * 施術メニュー一覧
 * 追加・削除・変更はこの配列を編集してください
 */
const TREATMENT_MENUS = [
  {
    id: 'shoulder',
    name: '肩こり',
    durationMin: 30,
    description: '肩や首のこり・痛みの改善',
  },
  {
    id: 'back',
    name: '腰痛',
    durationMin: 30,
    description: '腰の痛み・重さの改善',
  },
  {
    id: 'posture',
    name: '姿勢矯正',
    durationMin: 45,
    description: '猫背や姿勢の乱れを改善',
  },
  {
    id: 'postpartum',
    name: '産後骨盤',
    durationMin: 45,
    description: '産後の骨盤ケア',
  },
  {
    id: 'accident',
    name: '交通事故',
    durationMin: 60,
    description: '交通事故によるケガの治療',
  },
  {
    id: 'headache',
    name: '頭痛',
    durationMin: 30,
    description: '頭痛・偏頭痛の改善',
  },
  {
    id: 'sports',
    name: 'スポーツ障害',
    durationMin: 45,
    description: 'スポーツによるケガや痛み',
  },
];

/**
 * 来院区分
 */
const VISIT_TYPES = {
  first: {
    id: 'first',
    name: '初診',
    description: '初めてご来院の方',
    defaultDuration: 60,
  },
  revisit: {
    id: 'revisit',
    name: '再診',
    description: '2回目以降の方',
    defaultDuration: 30,
  },
};

// ============================================
// バリデーション設定
// ============================================

const VALIDATION_RULES = {
  name: {
    minLength: 1,
    maxLength: 50,
    required: true,
  },
  phone: {
    pattern: /^[0-9\-]+$/,
    minLength: 10,
    maxLength: 14,
    required: true,
  },
  symptomNote: {
    maxLength: 200,
    required: false,
  },
  memo: {
    maxLength: 200,
    required: false,
  },
};

// ============================================
// エラーメッセージ
// ============================================

const ERROR_MESSAGES = {
  name: {
    required: 'お名前を入力してください',
    maxLength: 'お名前は50文字以内で入力してください',
  },
  phone: {
    required: '電話番号を入力してください',
    pattern: '電話番号は数字とハイフンのみで入力してください',
    length: '電話番号は10〜14桁で入力してください',
  },
  symptomNote: {
    maxLength: 'お悩みや症状は200文字以内で入力してください',
  },
  memo: {
    maxLength: '連絡事項は200文字以内で入力してください',
  },
  menu: {
    required: '施術メニューを選択してください',
  },
  date: {
    required: '希望日を選択してください',
  },
  time: {
    required: '希望時間を選択してください',
  },
};

// ============================================
// 将来の拡張用設定
// ============================================

/**
 * 空き枠取得API（将来的にn8nから取得）
 * 現在は使用していません
 */
const AVAILABILITY_API_URL = '';

/**
 * 空き枠取得を有効にするか
 */
const ENABLE_AVAILABILITY_CHECK = false;

// 設定をエクスポート
const CONFIG = {
  WEBHOOK_URL,
  LIFF_ID,
  HEADER_TITLE,
  DEFAULT_SOURCE,
  BUSINESS_HOURS,
  AVAILABLE_DAYS,
  FIRST_VISIT_MENU,
  TREATMENT_MENUS,
  VISIT_TYPES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  AVAILABILITY_API_URL,
  ENABLE_AVAILABILITY_CHECK,
};
