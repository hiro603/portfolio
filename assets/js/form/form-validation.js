export const initializeFormValidation = () => {

const form = document.getElementById('contact-form');
const name    = document.getElementById('name');
const email   = document.getElementById('email');
const message = document.getElementById('message');
const agree   = document.getElementById('agree');

// --- フォーカスを外したときのリアルタイムバリデーション ---

name.addEventListener('blur', () => {
  clearError(name);
  if (name.value.trim() === '') {
    showError(name, 'お名前を入力してください');
  }
});

email.addEventListener('blur', () => {
  clearError(email);
  if (email.value.trim() === '') {
    showError(email, 'メールアドレスを入力してください');
  } else if (!isValidEmail(email.value)) {
    showError(email, '正しいメールアドレスを入力してください');
  }
});

message.addEventListener('blur', () => {
  clearError(message);
  if (message.value.trim() === '') {
    showError(message, 'お問い合わせ内容を入力してください');
  }
});

agree.addEventListener('change', () => {
  clearError(agree);
  if (!agree.checked) {
    showError(agree, 'プライバシーポリシーへの同意が必要です');
  }
});

// --- 送信時バリデーション（最終確認） ---

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // 全フィールドにblurを発火させてエラーを出す
  [name, email, message].forEach(input => input.dispatchEvent(new Event('blur')));
  agree.dispatchEvent(new Event('change'));

  if (document.querySelectorAll('.error-message').length === 0) {
    console.log('送信OK');
  }
});

// --- ユーティリティ ---

// 対象フィールド1つのエラーを消す
function clearError(input) {
  input.classList.remove('is-error');
  const error = input.parentNode.querySelector('.error-message');
  if (error) error.remove();
}

function showError(input, message) {
  const error = document.createElement('span');
  error.className = 'error-message';
  error.textContent = message;
  input.classList.add('is-error');
  input.parentNode.appendChild(error);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// honeypotによるボット対策
form.addEventListener('submit', (e) => {
    e.preventDefault();
  
    // honeypotに値が入っていたらボットと判断して弾く
    const honeypot = document.getElementById('honeypot');
    if (honeypot.value !== '') {
      console.log('ボットによる送信を検知');
      return; // 静かに何もしない（エラーも出さない）
    }
  
    [name, email, message].forEach(input => input.dispatchEvent(new Event('blur')));
    agree.dispatchEvent(new Event('change'));
  
    if (document.querySelectorAll('.error-message').length === 0) {
      console.log('送信OK');
    }
  });

  
  // reCAPTCHA v3のトークンを取得
  const SITE_KEY = 'YOUR_SITE_KEY';

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // honeypotチェック
  const honeypot = document.getElementById('honeypot');
  if (honeypot.value !== '') return;

  // blurイベントで全フィールドのバリデーション
  [name, email, message].forEach(input => input.dispatchEvent(new Event('blur')));
  agree.dispatchEvent(new Event('change'));

  if (document.querySelectorAll('.error-message').length > 0) return;

  try {
    // reCAPTCHA v3のトークンを取得
    const token = await grecaptcha.execute(SITE_KEY, { action: 'contact' });
    document.getElementById('recaptcha-token').value = token;

    // トークンをサーバーに送って検証
    const res = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        message: message.value,
        recaptcha_token: token,
      }),
    });

    const data = await res.json();

    if (data.success) {
      console.log('送信成功');
    } else {
      console.log('reCAPTCHA検証失敗');
    }

  } catch (err) {
    console.error('エラー:', err);
  }
});
}

initializeFormValidation();