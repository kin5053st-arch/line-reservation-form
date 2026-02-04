/**
 * LIFF予約フォーム メインアプリケーション
 */

// ============================================
// アプリケーション状態管理
// ============================================

const AppState = {
    currentStep: 1,
    totalSteps: 4,
    visitType: '', // 'first' または 'revisit'
    menuId: '',
    menuName: '',
    durationMin: 0,
    selectedDate: '',
    selectedTime: '',
    customerName: '',
    phone: '',
    symptomNote: '',
    memo: '',
    isSubmitting: false,
    availableSlots: null, // 将来的にn8nから取得
};

// ============================================
// 初期化
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    // LIFF初期化
    await initializeLiff();

    // UIの初期化
    initializeUI();

    // イベントリスナーのセットアップ
    setupEventListeners();

    // リアルタイムバリデーションのセットアップ
    setupRealTimeValidation();
});

/**
 * UIの初期化
 */
function initializeUI() {
    // ヘッダータイトルを設定
    const headerTitleEl = document.getElementById('headerTitle');
    if (headerTitleEl) {
        headerTitleEl.textContent = CONFIG.HEADER_TITLE;
    }
    // メニューボタンを生成
    renderMenuButtons();

    // 日付カードを生成
    renderDateCards();

    // 時間帯ボタンを生成
    renderTimeButtons();

    // ステップ表示を更新
    updateStepIndicator();

    // 最初のステップを表示
    showStep(1);
}

/**
 * イベントリスナーのセットアップ
 */
function setupEventListeners() {
    // 来院区分の選択
    document.querySelectorAll('input[name="visitType"]').forEach(radio => {
        radio.addEventListener('change', handleVisitTypeChange);
    });

    // 戻るボタン
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', goToPreviousStep);
    });

    // 次へボタン（ステップ1）
    const nextBtn1 = document.getElementById('nextBtn1');
    if (nextBtn1) {
        nextBtn1.addEventListener('click', () => goToNextStep(1));
    }

    // 次へボタン（ステップ2）
    const nextBtn2 = document.getElementById('nextBtn2');
    if (nextBtn2) {
        nextBtn2.addEventListener('click', () => goToNextStep(2));
    }

    // 次へボタン（ステップ3）
    const nextBtn3 = document.getElementById('nextBtn3');
    if (nextBtn3) {
        nextBtn3.addEventListener('click', () => goToNextStep(3));
    }

    // 確定ボタン
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleSubmit);
    }

    // 再送信ボタン
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', handleSubmit);
    }

    // LINEに戻るボタン
    document.querySelectorAll('.btn-close-liff').forEach(btn => {
        btn.addEventListener('click', closeLiff);
    });

    // 内容を修正するボタン
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => showStep(1));
    }
}

// ============================================
// ステップ制御
// ============================================

/**
 * ステップを表示
 * @param {number} step - 表示するステップ番号
 */
function showStep(step) {
    // すべてのステップを非表示
    document.querySelectorAll('.step-content').forEach(el => {
        el.classList.remove('active');
    });

    // 指定したステップを表示
    const stepEl = document.getElementById(`step${step}`);
    if (stepEl) {
        stepEl.classList.add('active');
    }

    AppState.currentStep = step;
    updateStepIndicator();

    // ステップ4（確認画面）の場合は内容を更新
    if (step === 4) {
        renderConfirmation();
    }

    // 画面上部にスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 次のステップへ進む
 * @param {number} currentStep - 現在のステップ
 */
function goToNextStep(currentStep) {
    // バリデーション
    let isValid = true;

    switch (currentStep) {
        case 1:
            isValid = validateStep1Form();
            break;
        case 2:
            isValid = validateStep2Form();
            break;
        case 3:
            isValid = validateStep3Form();
            break;
    }

    if (isValid) {
        showStep(currentStep + 1);
    }
}

/**
 * 前のステップへ戻る
 */
function goToPreviousStep() {
    if (AppState.currentStep > 1) {
        showStep(AppState.currentStep - 1);
    }
}

/**
 * ステップインジケーターを更新
 */
function updateStepIndicator() {
    const indicators = document.querySelectorAll('.step-indicator-item');
    indicators.forEach((item, index) => {
        const stepNum = index + 1;
        item.classList.remove('active', 'completed');

        if (stepNum === AppState.currentStep) {
            item.classList.add('active');
        } else if (stepNum < AppState.currentStep) {
            item.classList.add('completed');
        }
    });

    // ステップ番号テキストの更新
    const stepText = document.getElementById('stepText');
    if (stepText) {
        stepText.textContent = `ステップ ${AppState.currentStep} / ${AppState.totalSteps}`;
    }
}

// ============================================
// ステップ1: 来院目的とメニュー選択
// ============================================

/**
 * 来院区分変更ハンドラ
 */
function handleVisitTypeChange(e) {
    AppState.visitType = e.target.value;

    // メニュー表示を更新
    updateMenuDisplay();

    // 選択をクリア
    AppState.menuId = '';
    AppState.menuName = '';
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    clearError('menu');
}

/**
 * メニュー表示を更新
 */
function updateMenuDisplay() {
    const firstVisitSection = document.getElementById('firstVisitMenuSection');
    const menuSection = document.getElementById('menuSection');

    if (AppState.visitType === 'first') {
        // 初診：「相談して決めたい」を目立たせる
        if (firstVisitSection) firstVisitSection.style.display = 'block';
    } else {
        // 再診：通常メニューのみ
        if (firstVisitSection) firstVisitSection.style.display = 'none';
    }

    if (menuSection) {
        menuSection.style.display = AppState.visitType ? 'block' : 'none';
    }
}

/**
 * メニューボタンを生成
 */
function renderMenuButtons() {
    // 初診用メニュー
    const firstVisitContainer = document.getElementById('firstVisitMenuContainer');
    if (firstVisitContainer) {
        const menu = CONFIG.FIRST_VISIT_MENU;
        const btn = createMenuButton(menu, true);
        firstVisitContainer.appendChild(btn);
    }

    // 通常メニュー
    const menuContainer = document.getElementById('menuContainer');
    if (menuContainer) {
        CONFIG.TREATMENT_MENUS.forEach(menu => {
            const btn = createMenuButton(menu, false);
            menuContainer.appendChild(btn);
        });
    }
}

/**
 * メニューボタンを作成
 * @param {object} menu - メニュー情報
 * @param {boolean} isFirstVisit - 初診用メニューか
 * @returns {HTMLElement}
 */
function createMenuButton(menu, isFirstVisit) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `menu-btn ${isFirstVisit ? 'first-visit' : ''}`;
    btn.dataset.menuId = menu.id;
    btn.dataset.menuName = menu.name;
    btn.dataset.duration = menu.durationMin;

    btn.innerHTML = `
    <span class="menu-name">${menu.name}</span>
    ${menu.description ? `<span class="menu-desc">${menu.description}</span>` : ''}
  `;

    btn.addEventListener('click', () => selectMenu(menu));

    return btn;
}

/**
 * メニューを選択
 * @param {object} menu - メニュー情報
 */
function selectMenu(menu) {
    AppState.menuId = menu.id;
    AppState.menuName = menu.name;
    AppState.durationMin = menu.durationMin;

    // 選択状態を更新
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.menuId === menu.id) {
            btn.classList.add('selected');
        }
    });

    clearError('menu');
}

/**
 * ステップ1のフォームバリデーション
 * @returns {boolean}
 */
function validateStep1Form() {
    let isValid = true;

    // 来院区分チェック
    if (!AppState.visitType) {
        showError('visitType', '来院区分を選択してください');
        isValid = false;
    } else {
        clearError('visitType');
    }

    // メニュー選択チェック
    if (!AppState.menuId) {
        showError('menu', CONFIG.ERROR_MESSAGES.menu.required);
        isValid = false;
    } else {
        clearError('menu');
    }

    return isValid;
}

// ============================================
// ステップ2: 日付と時間帯選択
// ============================================

/**
 * 日付カードを生成
 */
function renderDateCards() {
    const container = document.getElementById('dateContainer');
    if (!container) return;

    container.innerHTML = '';

    const today = new Date();

    for (let i = 0; i < CONFIG.AVAILABLE_DAYS; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const card = createDateCard(date, i);
        container.appendChild(card);
    }
}

/**
 * 日付カードを作成
 * @param {Date} date - 日付
 * @param {number} dayOffset - 今日からの日数
 * @returns {HTMLElement}
 */
function createDateCard(date, dayOffset) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'date-card';

    const dateStr = formatDateForData(date);
    card.dataset.date = dateStr;

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayOfWeek = dayNames[date.getDay()];

    let label = '';
    if (dayOffset === 0) label = '今日';
    else if (dayOffset === 1) label = '明日';
    else if (dayOffset === 2) label = '明後日';

    card.innerHTML = `
    <span class="date-label">${label}</span>
    <span class="date-day">${date.getDate()}</span>
    <span class="date-weekday ${date.getDay() === 0 ? 'sunday' : ''} ${date.getDay() === 6 ? 'saturday' : ''}">${dayOfWeek}</span>
  `;

    card.addEventListener('click', () => selectDate(dateStr, card));

    return card;
}

/**
 * 日付を選択
 * @param {string} dateStr - 日付文字列
 * @param {HTMLElement} card - クリックされたカード
 */
function selectDate(dateStr, card) {
    AppState.selectedDate = dateStr;

    // 選択状態を更新
    document.querySelectorAll('.date-card').forEach(c => {
        c.classList.remove('selected');
    });
    card.classList.add('selected');

    clearError('date');

    // 将来的に空き枠を取得する場合はここで呼び出し
    if (CONFIG.ENABLE_AVAILABILITY_CHECK) {
        fetchAvailableSlots(dateStr);
    }
}

/**
 * 時間帯ボタンを生成
 */
function renderTimeButtons() {
    const container = document.getElementById('timeContainer');
    if (!container) return;

    container.innerHTML = '';

    const { startHour, endHour, interval } = CONFIG.BUSINESS_HOURS;

    for (let hour = startHour; hour < endHour; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const btn = createTimeButton(timeStr);
        container.appendChild(btn);
    }
}

/**
 * 時間帯ボタンを作成
 * @param {string} timeStr - 時間文字列
 * @returns {HTMLElement}
 */
function createTimeButton(timeStr) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-btn';
    btn.dataset.time = timeStr;
    btn.textContent = timeStr;

    btn.addEventListener('click', () => selectTime(timeStr, btn));

    return btn;
}

/**
 * 時間を選択
 * @param {string} timeStr - 時間文字列
 * @param {HTMLElement} btn - クリックされたボタン
 */
function selectTime(timeStr, btn) {
    AppState.selectedTime = timeStr;

    // 選択状態を更新
    document.querySelectorAll('.time-btn').forEach(b => {
        b.classList.remove('selected');
    });
    btn.classList.add('selected');

    clearError('time');
}

/**
 * ステップ2のフォームバリデーション
 * @returns {boolean}
 */
function validateStep2Form() {
    let isValid = true;

    if (!AppState.selectedDate) {
        showError('date', CONFIG.ERROR_MESSAGES.date.required);
        isValid = false;
    } else {
        clearError('date');
    }

    if (!AppState.selectedTime) {
        showError('time', CONFIG.ERROR_MESSAGES.time.required);
        isValid = false;
    } else {
        clearError('time');
    }

    return isValid;
}

/**
 * 空き枠を取得（将来の拡張用）
 * @param {string} dateStr - 日付文字列
 */
async function fetchAvailableSlots(dateStr) {
    if (!CONFIG.AVAILABILITY_API_URL) return;

    try {
        const response = await fetch(`${CONFIG.AVAILABILITY_API_URL}?date=${dateStr}`);
        const data = await response.json();
        AppState.availableSlots = data.slots;
        updateTimeButtonsAvailability();
    } catch (error) {
        console.error('空き枠取得エラー:', error);
    }
}

/**
 * 時間帯ボタンの空き状況を更新（将来の拡張用）
 */
function updateTimeButtonsAvailability() {
    if (!AppState.availableSlots) return;

    document.querySelectorAll('.time-btn').forEach(btn => {
        const time = btn.dataset.time;
        const isAvailable = AppState.availableSlots.includes(time);

        btn.disabled = !isAvailable;
        btn.classList.toggle('unavailable', !isAvailable);
    });
}

// ============================================
// ステップ3: お客様情報入力
// ============================================

/**
 * ステップ3のフォームバリデーション
 * @returns {boolean}
 */
function validateStep3Form() {
    // フォームから値を取得
    AppState.customerName = document.getElementById('customerName')?.value || '';
    AppState.phone = document.getElementById('phone')?.value || '';
    AppState.symptomNote = document.getElementById('symptomNote')?.value || '';
    AppState.memo = document.getElementById('memo')?.value || '';

    const result = validateStep3(AppState);

    if (!result.valid) {
        Object.keys(result.errors).forEach(field => {
            showError(field === 'name' ? 'customerName' : field, result.errors[field]);
        });
    }

    return result.valid;
}

// ============================================
// ステップ4: 確認と確定
// ============================================

/**
 * 確認画面の内容を描画
 */
function renderConfirmation() {
    const container = document.getElementById('confirmationContent');
    if (!container) return;

    const visitTypeName = AppState.visitType === 'first' ? '初診' : '再診';
    const dateDisplay = formatDateForDisplay(AppState.selectedDate);

    container.innerHTML = `
    <div class="confirm-section">
      <h3 class="confirm-section-title">予約内容</h3>
      <div class="confirm-item">
        <span class="confirm-label">来院区分</span>
        <span class="confirm-value">${visitTypeName}</span>
      </div>
      <div class="confirm-item">
        <span class="confirm-label">施術メニュー</span>
        <span class="confirm-value">${AppState.menuName}</span>
      </div>
      <div class="confirm-item">
        <span class="confirm-label">希望日時</span>
        <span class="confirm-value">${dateDisplay} ${AppState.selectedTime}〜</span>
      </div>
      <div class="confirm-item">
        <span class="confirm-label">所要時間（目安）</span>
        <span class="confirm-value">約${AppState.durationMin}分</span>
      </div>
    </div>
    
    <div class="confirm-section">
      <h3 class="confirm-section-title">お客様情報</h3>
      <div class="confirm-item">
        <span class="confirm-label">お名前</span>
        <span class="confirm-value">${escapeHtml(AppState.customerName)}</span>
      </div>
      <div class="confirm-item">
        <span class="confirm-label">電話番号</span>
        <span class="confirm-value">${escapeHtml(AppState.phone)}</span>
      </div>
      ${AppState.symptomNote ? `
      <div class="confirm-item">
        <span class="confirm-label">お悩みや症状</span>
        <span class="confirm-value">${escapeHtml(AppState.symptomNote)}</span>
      </div>
      ` : ''}
      ${AppState.memo ? `
      <div class="confirm-item">
        <span class="confirm-label">連絡事項</span>
        <span class="confirm-value">${escapeHtml(AppState.memo)}</span>
      </div>
      ` : ''}
    </div>
  `;
}

// ============================================
// 送信処理
// ============================================

/**
 * 予約を送信
 */
async function handleSubmit() {
    if (AppState.isSubmitting) return;

    AppState.isSubmitting = true;
    showLoading(true);

    try {
        const payload = buildPayload();

        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            showCompletionScreen(payload);
        } else {
            throw new Error(`HTTP error: ${response.status}`);
        }
    } catch (error) {
        console.error('送信エラー:', error);
        showErrorScreen();
    } finally {
        AppState.isSubmitting = false;
        showLoading(false);
    }
}

/**
 * 送信ペイロードを構築
 * @returns {object}
 */
function buildPayload() {
    const startDateTime = buildDateTime(AppState.selectedDate, AppState.selectedTime);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + AppState.durationMin);

    return {
        userId: getLiffUserId(),
        source: getSourceFromUrl(),
        menuId: AppState.menuId,
        menuName: AppState.menuName,
        visitType: AppState.visitType,
        startDateTime: formatDateTimeISO(startDateTime),
        endDateTime: formatDateTimeISO(endDateTime),
        durationMin: AppState.durationMin,
        customerName: AppState.customerName.trim(),
        phone: AppState.phone.trim(),
        symptomNote: AppState.symptomNote.trim(),
        memo: AppState.memo.trim(),
        clientTimestamp: formatDateTimeISO(new Date()),
    };
}

/**
 * ローディング表示の切り替え
 * @param {boolean} show - 表示するか
 */
function showLoading(show) {
    const loading = document.getElementById('loadingOverlay');
    const confirmBtn = document.getElementById('confirmBtn');

    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }

    if (confirmBtn) {
        confirmBtn.disabled = show;
    }
}

/**
 * 完了画面を表示
 * @param {object} payload - 送信したデータ
 */
function showCompletionScreen(payload) {
    // すべてのステップを非表示
    document.querySelectorAll('.step-content').forEach(el => {
        el.classList.remove('active');
    });

    // 完了画面を表示
    const completionScreen = document.getElementById('completionScreen');
    if (completionScreen) {
        completionScreen.classList.add('active');
    }

    // ステップインジケーターを非表示
    const stepIndicator = document.querySelector('.step-indicator');
    if (stepIndicator) {
        stepIndicator.style.display = 'none';
    }

    // 予約内容を表示
    const summaryContainer = document.getElementById('completionSummary');
    if (summaryContainer) {
        const visitTypeName = payload.visitType === 'first' ? '初診' : '再診';
        const dateDisplay = formatDateForDisplay(AppState.selectedDate);

        summaryContainer.innerHTML = `
      <div class="summary-item">
        <span class="summary-icon">📋</span>
        <span>${visitTypeName} - ${payload.menuName}</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">📅</span>
        <span>${dateDisplay} ${AppState.selectedTime}〜</span>
      </div>
      <div class="summary-item">
        <span class="summary-icon">👤</span>
        <span>${escapeHtml(payload.customerName)} 様</span>
      </div>
    `;
    }
}

/**
 * エラー画面を表示
 */
function showErrorScreen() {
    // すべてのステップを非表示
    document.querySelectorAll('.step-content').forEach(el => {
        el.classList.remove('active');
    });

    // エラー画面を表示
    const errorScreen = document.getElementById('errorScreen');
    if (errorScreen) {
        errorScreen.classList.add('active');
    }

    // ステップインジケーターを非表示
    const stepIndicator = document.querySelector('.step-indicator');
    if (stepIndicator) {
        stepIndicator.style.display = 'none';
    }
}

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 日付をデータ用文字列にフォーマット
 * @param {Date} date - 日付
 * @returns {string} - YYYY-MM-DD形式
 */
function formatDateForData(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 日付を表示用文字列にフォーマット
 * @param {string} dateStr - YYYY-MM-DD形式の日付
 * @returns {string} - M月D日（曜日）形式
 */
function formatDateForDisplay(dateStr) {
    const date = new Date(dateStr);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = dayNames[date.getDay()];
    return `${month}月${day}日（${dayOfWeek}）`;
}

/**
 * 日付と時間からDateTimeを構築
 * @param {string} dateStr - YYYY-MM-DD形式
 * @param {string} timeStr - HH:MM形式
 * @returns {Date}
 */
function buildDateTime(dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0);
}

/**
 * DateTimeをISO8601形式でフォーマット（Asia/Tokyo）
 * @param {Date} date - 日付
 * @returns {string}
 */
function formatDateTimeISO(date) {
    const offset = '+09:00';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
}

/**
 * HTMLエスケープ
 * @param {string} str - 文字列
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
