/**
 * LIFF SDK 初期化処理
 */

// LIFF初期化状態
let liffInitialized = false;
let liffUserId = '';

/**
 * LIFF SDKの初期化
 * @returns {Promise<void>}
 */
async function initializeLiff() {
    try {
        // LIFFが利用可能かチェック
        if (typeof liff === 'undefined') {
            console.warn('LIFF SDK が読み込まれていません。開発モードで動作します。');
            liffInitialized = false;
            return;
        }

        await liff.init({
            liffId: CONFIG.LIFF_ID,
        });

        liffInitialized = true;
        console.log('LIFF 初期化成功');

        // ログイン状態の確認
        if (liff.isLoggedIn()) {
            await getLiffUserProfile();
        } else {
            console.log('LIFFにログインしていません');
        }

    } catch (error) {
        console.error('LIFF 初期化エラー:', error);
        liffInitialized = false;
    }
}

/**
 * LIFFユーザープロフィールの取得
 * @returns {Promise<void>}
 */
async function getLiffUserProfile() {
    try {
        if (!liffInitialized || !liff.isLoggedIn()) {
            return;
        }

        const profile = await liff.getProfile();
        liffUserId = profile.userId;
        console.log('ユーザーID取得:', liffUserId);

    } catch (error) {
        console.error('プロフィール取得エラー:', error);
    }
}

/**
 * LIFFユーザーIDを取得
 * @returns {string} - ユーザーID（取得できない場合は空文字）
 */
function getLiffUserId() {
    return liffUserId;
}

/**
 * LIFF環境かどうかを判定
 * @returns {boolean}
 */
function isInLiff() {
    if (typeof liff === 'undefined') {
        return false;
    }
    return liff.isInClient();
}

/**
 * LIFFウィンドウを閉じる
 */
function closeLiff() {
    if (isInLiff()) {
        liff.closeWindow();
    } else {
        // LIFF外の場合はメッセージを表示
        console.log('LIFF環境外のため、ウィンドウを閉じられません');
    }
}

/**
 * LINEトークにメッセージを送信（将来の拡張用）
 * @param {string} message - 送信するメッセージ
 * @returns {Promise<boolean>}
 */
async function sendMessageToTalk(message) {
    try {
        if (!isInLiff()) {
            console.log('LIFF環境外のため、メッセージを送信できません');
            return false;
        }

        await liff.sendMessages([
            {
                type: 'text',
                text: message,
            },
        ]);

        return true;
    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        return false;
    }
}

/**
 * URLパラメータからsourceを取得
 * @returns {string} - 'richmenu' または 'chat'
 */
function getSourceFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');

    if (source === 'chat' || source === 'richmenu') {
        return source;
    }

    return CONFIG.DEFAULT_SOURCE;
}
