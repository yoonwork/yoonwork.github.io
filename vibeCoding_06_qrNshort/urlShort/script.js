const urlInput = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const result = document.getElementById('result');
const copyBtn = document.getElementById('copy-btn');
const message = document.getElementById('message');
const toQr = document.getElementById('to-qr');

// 입력 필드가 비어 있으면 '단축하기' 버튼 비활성화
urlInput.addEventListener('input', () => {
  shortenBtn.disabled = urlInput.value.trim() === '';
});
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !shortenBtn.disabled) shorten();
});

function normalize(url) {
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

// is.gd / v.gd OpenAPI는 CORS를 막기 때문에 JSONP 방식(callback)으로 호출
function jsonpShorten(host, longUrl) {
  return new Promise((resolve, reject) => {
    const cbName = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const script = document.createElement('script');
    const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 8000);

    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      script.remove();
    }
    window[cbName] = (data) => {
      cleanup();
      if (data && data.shorturl) resolve(data.shorturl);
      else reject(new Error((data && data.errormessage) || '응답 오류'));
    };
    script.onerror = () => { cleanup(); reject(new Error('network')); };
    script.src = `https://${host}/create.php?format=json&callback=${cbName}&url=${encodeURIComponent(longUrl)}`;
    document.body.appendChild(script);
  });
}

// 예비 OpenAPI: da.gd (CORS 허용, 텍스트로 응답)
async function dagdShorten(longUrl) {
  const res = await fetch('https://da.gd/s?url=' + encodeURIComponent(longUrl));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = (await res.text()).trim();
  if (!/^https?:\/\//.test(text)) throw new Error(text);
  return text;
}

async function shorten() {
  const longUrl = normalize(urlInput.value);
  shortenBtn.disabled = true;
  shortenBtn.textContent = '단축 중...';
  message.textContent = '';
  message.className = 'message';

  const tries = [
    () => jsonpShorten('is.gd', longUrl),
    () => jsonpShorten('v.gd', longUrl),
    () => dagdShorten(longUrl)
  ];

  let shortUrl = null;
  let lastError = null;
  for (const attempt of tries) {
    try {
      shortUrl = await attempt();
      break;
    } catch (err) {
      lastError = err;
      console.warn('단축 실패, 다음 API 시도:', err);
    }
  }

  shortenBtn.textContent = '단축하기';
  shortenBtn.disabled = urlInput.value.trim() === '';

  if (shortUrl) {
    result.value = shortUrl;
    copyBtn.disabled = false;
    message.textContent = 'URL이 단축되었습니다.';
    message.className = 'message ok';
    toQr.href = '../url2qr/index.html?url=' + encodeURIComponent(shortUrl);
    toQr.classList.remove('hidden');
  } else {
    result.value = '';
    copyBtn.disabled = true;
    toQr.classList.add('hidden');
    message.textContent = '네트워크 오류가 발생했습니다. URL을 확인하고 다시 시도해 주세요.';
    console.error(lastError);
  }
}

shortenBtn.addEventListener('click', shorten);

// '복사' 버튼 → 클립보드 복사 후 알림창
copyBtn.addEventListener('click', async () => {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value);
  } catch (e) {
    result.select();
    document.execCommand('copy');
  }
  alert('복사하였습니다');
});
