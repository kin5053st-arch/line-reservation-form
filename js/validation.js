/**
 * LIFF予約フォーム バリデーション処理
 */

/**
 * 氏名のバリデーション
 * @param {string} name - 氏名
 * @returns {object} - { valid: boolean, message: string }
 */
function validateName(name) {
    const trimmed = name.trim();

    if (!trimmed) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.name.required,
        };
    }

    if (trimmed.length > CONFIG.VALIDATION_RULES.name.maxLength) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.name.maxLength,
        };
    }

    return { valid: true, message: '' };
}

/**
 * 電話番号のバリデーション
 * @param {string} phone - 電話番号
 * @returns {object} - { valid: boolean, message: string }
 */
function validatePhone(phone) {
    const trimmed = phone.trim();

    if (!trimmed) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.phone.required,
        };
    }

    if (!CONFIG.VALIDATION_RULES.phone.pattern.test(trimmed)) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.phone.pattern,
        };
    }

    // ハイフンを除いた数字の桁数をチェック
    const digitsOnly = trimmed.replace(/-/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.phone.length,
        };
    }

    return { valid: true, message: '' };
}

/**
 * テキストエリアのバリデーション（症状メモ、連絡事項）
 * @param {string} text - テキスト
 * @param {string} fieldName - フィールド名（'symptomNote' または 'memo'）
 * @returns {object} - { valid: boolean, message: string }
 */
function validateTextArea(text, fieldName) {
    const trimmed = text.trim();
    const maxLength = CONFIG.VALIDATION_RULES[fieldName].maxLength;

    if (trimmed.length > maxLength) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES[fieldName].maxLength,
        };
    }

    return { valid: true, message: '' };
}

/**
 * メニュー選択のバリデーション
 * @param {string} menuId - メニューID
 * @returns {object} - { valid: boolean, message: string }
 */
function validateMenu(menuId) {
    if (!menuId) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.menu.required,
        };
    }

    return { valid: true, message: '' };
}

/**
 * 日付選択のバリデーション
 * @param {string} date - 日付
 * @returns {object} - { valid: boolean, message: string }
 */
function validateDate(date) {
    if (!date) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.date.required,
        };
    }

    return { valid: true, message: '' };
}

/**
 * 時間選択のバリデーション
 * @param {string} time - 時間
 * @returns {object} - { valid: boolean, message: string }
 */
function validateTime(time) {
    if (!time) {
        return {
            valid: false,
            message: CONFIG.ERROR_MESSAGES.time.required,
        };
    }

    return { valid: true, message: '' };
}

/**
 * ステップ1のバリデーション（メニュー選択）
 * @param {object} data - フォームデータ
 * @returns {object} - { valid: boolean, errors: object }
 */
function validateStep1(data) {
    const errors = {};

    const menuResult = validateMenu(data.menuId);
    if (!menuResult.valid) {
        errors.menu = menuResult.message;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * ステップ2のバリデーション（日時選択）
 * @param {object} data - フォームデータ
 * @returns {object} - { valid: boolean, errors: object }
 */
function validateStep2(data) {
    const errors = {};

    const dateResult = validateDate(data.selectedDate);
    if (!dateResult.valid) {
        errors.date = dateResult.message;
    }

    const timeResult = validateTime(data.selectedTime);
    if (!timeResult.valid) {
        errors.time = timeResult.message;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * ステップ3のバリデーション（お客様情報）
 * @param {object} data - フォームデータ
 * @returns {object} - { valid: boolean, errors: object }
 */
function validateStep3(data) {
    const errors = {};

    const nameResult = validateName(data.customerName);
    if (!nameResult.valid) {
        errors.name = nameResult.message;
    }

    const phoneResult = validatePhone(data.phone);
    if (!phoneResult.valid) {
        errors.phone = phoneResult.message;
    }

    const symptomResult = validateTextArea(data.symptomNote || '', 'symptomNote');
    if (!symptomResult.valid) {
        errors.symptomNote = symptomResult.message;
    }

    const memoResult = validateTextArea(data.memo || '', 'memo');
    if (!memoResult.valid) {
        errors.memo = memoResult.message;
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * 全体のバリデーション
 * @param {object} data - フォームデータ
 * @returns {object} - { valid: boolean, errors: object }
 */
function validateAll(data) {
    const step1 = validateStep1(data);
    const step2 = validateStep2(data);
    const step3 = validateStep3(data);

    return {
        valid: step1.valid && step2.valid && step3.valid,
        errors: {
            ...step1.errors,
            ...step2.errors,
            ...step3.errors,
        },
    };
}

/**
 * エラー表示をクリア
 * @param {string} fieldId - フィールドID
 */
function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    }

    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

/**
 * エラー表示
 * @param {string} fieldId - フィールドID
 * @param {string} message - エラーメッセージ
 */
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }

    if (inputElement) {
        inputElement.classList.add('error');
    }
}

/**
 * リアルタイムバリデーションのセットアップ
 */
function setupRealTimeValidation() {
    // 氏名
    const nameInput = document.getElementById('customerName');
    if (nameInput) {
        nameInput.addEventListener('blur', function () {
            const result = validateName(this.value);
            if (!result.valid) {
                showError('customerName', result.message);
            } else {
                clearError('customerName');
            }
        });

        nameInput.addEventListener('input', function () {
            clearError('customerName');
        });
    }

    // 電話番号
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function () {
            const result = validatePhone(this.value);
            if (!result.valid) {
                showError('phone', result.message);
            } else {
                clearError('phone');
            }
        });

        phoneInput.addEventListener('input', function () {
            clearError('phone');
        });
    }

    // 症状メモ
    const symptomInput = document.getElementById('symptomNote');
    if (symptomInput) {
        symptomInput.addEventListener('input', function () {
            const result = validateTextArea(this.value, 'symptomNote');
            if (!result.valid) {
                showError('symptomNote', result.message);
            } else {
                clearError('symptomNote');
            }
            // 文字数カウンター更新
            updateCharCount('symptomNote', this.value.length, 200);
        });
    }

    // 連絡事項
    const memoInput = document.getElementById('memo');
    if (memoInput) {
        memoInput.addEventListener('input', function () {
            const result = validateTextArea(this.value, 'memo');
            if (!result.valid) {
                showError('memo', result.message);
            } else {
                clearError('memo');
            }
            // 文字数カウンター更新
            updateCharCount('memo', this.value.length, 200);
        });
    }
}

/**
 * 文字数カウンター更新
 * @param {string} fieldId - フィールドID
 * @param {number} current - 現在の文字数
 * @param {number} max - 最大文字数
 */
function updateCharCount(fieldId, current, max) {
    const counter = document.getElementById(`${fieldId}-count`);
    if (counter) {
        counter.textContent = `${current}/${max}`;
        if (current > max) {
            counter.classList.add('over');
        } else {
            counter.classList.remove('over');
        }
    }
}
