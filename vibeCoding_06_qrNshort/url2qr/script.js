document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('url-input');
  const generateBtn = document.getElementById('generate-btn');
  const inputArea = document.getElementById('input-area');
  const qrArea = document.getElementById('qr-area');
  const qrBox = document.getElementById('qrcode');
  let currentCanvas = null;

  // ===== 마우스 위치에 따라 그라데이션 색상 변경 =====
  const root = document.documentElement;
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    root.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    root.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    root.style.setProperty('--hue', ((x - 0.5) * 40 + (y - 0.5) * 20).toFixed(1) + 'deg');
  });

  // ===== QR코드 그리기 (qrcode-generator 라이브러리 사용) =====
  function drawQR(text) {
    const qr = qrcode(0, 'M');           // 0 = 자동 크기
    qr.addData(unescape(encodeURIComponent(text))); // 한글 URL도 UTF-8로 처리
    qr.make();

    const count = qr.getModuleCount();
    const margin = 4;
    const scale = Math.floor(600 / (count + margin * 2));
    const size = (count + margin * 2) * scale;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';            // JPG 저장 시 배경이 검게 되지 않도록 흰색 채움
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#3b3355';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect((c + margin) * scale, (r + margin) * scale, scale, scale);
        }
      }
    }
    return canvas;
  }

  function generate() {
    let url = urlInput.value.trim();
    if (!url) {
      alert('URL을 입력해 주세요.');
      urlInput.focus();
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) url = 'https://' + url; // http(s) 생략 시 자동 보완

    try {
      currentCanvas = drawQR(url);
      qrBox.innerHTML = '';
      qrBox.appendChild(currentCanvas);
      qrBox.dataset.url = url;

      // 입력창은 아래로, QR코드는 정중앙으로
      inputArea.classList.remove('center');
      inputArea.classList.add('bottom');
      qrArea.classList.remove('hidden');
      qrArea.classList.add('show');
    } catch (err) {
      console.error(err);
      alert('QR코드 생성 중 오류가 발생했습니다.');
    }
  }

  generateBtn.addEventListener('click', generate);
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generate();
  });

  // ===== QR코드 클릭 → JPG 다운로드 =====
  qrBox.addEventListener('click', () => {
    if (!currentCanvas) return;
    const link = document.createElement('a');
    link.href = currentCanvas.toDataURL('image/jpeg', 0.95);
    link.download = 'qrcode.jpg';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  // 주소에 ?url= 이 붙어 오면 바로 생성 (QRnShort 등 다른 페이지와 연결용)
  const preset = new URLSearchParams(location.search).get('url');
  if (preset) {
    urlInput.value = preset;
    generate();
  }
});
