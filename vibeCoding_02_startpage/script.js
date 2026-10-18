// ===== 시계 =====
function updateClock() {
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = `${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`;
  const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('clock').textContent = `${date} ${time}`;
}
updateClock();
setInterval(updateClock, 30000);

// ===== Google 검색 =====
const searchInput = document.getElementById('search-input');
document.getElementById('search-btn').addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (q) window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank');
});
document.getElementById('lucky-btn').addEventListener('click', () => {
  const q = searchInput.value.trim();
  const url = q
    ? 'https://www.google.com/search?btnI=1&q=' + encodeURIComponent(q)
    : 'https://www.google.com/doodles';
  window.open(url, '_blank');
});

// ===== 오늘의 날씨 (Open-Meteo OpenAPI, API Key 불필요) =====
const cities = [
  { id: 'weather-seoul', lat: 37.5665, lon: 126.9780 },
  { id: 'weather-jeju', lat: 33.4996, lon: 126.5312 }
];

function weatherInfo(code) {
  if (code === 0) return ['☀️', '맑음'];
  if (code <= 2) return ['🌤️', '구름 조금'];
  if (code === 3) return ['☁️', '흐림'];
  if (code === 45 || code === 48) return ['🌫️', '안개'];
  if (code >= 51 && code <= 57) return ['🌦️', '이슬비'];
  if (code >= 61 && code <= 67) return ['🌧️', '비'];
  if (code >= 71 && code <= 77) return ['❄️', '눈'];
  if (code >= 80 && code <= 82) return ['🌧️', '소나기'];
  if (code >= 85 && code <= 86) return ['🌨️', '눈 소나기'];
  if (code >= 95) return ['⛈️', '뇌우'];
  return ['🌡️', '정보 없음'];
}

async function loadWeather(city) {
  const card = document.getElementById(city.id);
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    const [icon, desc] = weatherInfo(data.current.weather_code);
    card.querySelector('.icon').textContent = icon;
    card.querySelector('.temp').textContent = `${Math.round(data.current.temperature_2m)}°C`;
    card.querySelector('.desc').textContent = desc;
    card.querySelector('.minmax').textContent =
      `최고 ${Math.round(data.daily.temperature_2m_max[0])}° / 최저 ${Math.round(data.daily.temperature_2m_min[0])}°`;
  } catch (err) {
    console.error(err);
    card.querySelector('.icon').textContent = '⚠️';
    card.querySelector('.desc').textContent = '날씨 정보를 불러올 수 없습니다';
  }
}
cities.forEach(loadWeather);

// ===== 명언 =====
const quotes = [
  { text: '천 리 길도 한 걸음부터.', author: '속담' },
  { text: '오늘 할 수 있는 일을 내일로 미루지 마라.', author: '벤저민 프랭클린' },
  { text: '배움에는 끝이 없다.', author: '속담' },
  { text: '성공은 매일 반복한 작은 노력들의 합이다.', author: '로버트 콜리어' },
  { text: '시작이 반이다.', author: '아리스토텔레스' },
  { text: '할 수 있다고 믿는 사람은 결국 해낸다.', author: '버질' },
  { text: '실패는 성공의 어머니이다.', author: '토머스 에디슨' },
  { text: '가장 큰 영광은 한 번도 넘어지지 않는 것이 아니라, 넘어질 때마다 일어서는 것이다.', author: '공자' },
  { text: '행동은 모든 성공의 기본 열쇠다.', author: '파블로 피카소' },
  { text: '미래를 예측하는 가장 좋은 방법은 미래를 만들어 내는 것이다.', author: '앨런 케이' }
];
let quoteIndex = new Date().getDate() % quotes.length; // 날짜별 오늘의 명언

function showQuote() {
  document.getElementById('quote-text').textContent = quotes[quoteIndex].text;
  document.getElementById('quote-author').textContent = '- ' + quotes[quoteIndex].author;
}
document.getElementById('quote-btn').addEventListener('click', () => {
  quoteIndex = (quoteIndex + 1) % quotes.length;
  showQuote();
});
showQuote();
