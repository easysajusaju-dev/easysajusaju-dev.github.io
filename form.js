/* ===== 기존 흐름 유지: 폼 → 시트 저장 → (저장 성공) 다음페이지 이동 ===== */
const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

/* 상품 가격표 (thankyou/payment 모두 동일 기준) */
const PRICE_TABLE = {
  "종합사주 미니": 5000, "신년운세": 19900, "종합사주": 34900, "재물사주": 14900,
  "결혼사주": 12900, "연애사주": 9900, "연애패키지": 19900, "타이밍패키지": 26900,
  "인생패키지": 39900, "재회운": 29900, "궁합사주": 29900
};

document.addEventListener('DOMContentLoaded', () => {
  const formEl = document.getElementById('saju-form');
  if (!formEl) return;

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = formEl.querySelector('button');
    const agree1 = document.getElementById('agree1');
    if (agree1 && !agree1.checked) {
      alert('개인정보 수집/이용에 동의해야 합니다.');
      return;
    }
    if (btn) { btn.disabled = true; btn.innerText = '신청 중...'; }

    try {
      const fd = new FormData(formEl);
      const orderId = 'EZ' + Date.now();

      // 전화번호 조립 (기존 규칙 그대로)
      let phone = (fd.get('contact') || ((fd.get('contact1')||'')+(fd.get('contact2')||'')+(fd.get('contact3')||''))).replace(/\D/g,'');
      const productName = fd.get('product') || '종합사주';
      const price = PRICE_TABLE[productName] || 34900;

      // 서버(본사 Webhook)로 저장 — 원래 하던 그대로
      const data = new URLSearchParams();
      data.set('오더ID', orderId);
      data.set('상품명', productName);
      data.set('연락처', "'" + phone);  // (기존 시트 포맷 유지)
      data.set('이메일', fd.get('email') || '');
      data.set('이름1', fd.get('p1_name') || '');
      data.set('양음력1', fd.get('p1_solarlunar') || '');
      data.set('생년1', fd.get('p1_birth_year') || '');
      data.set('생월1', fd.get('p1_birth_month') || '');
      data.set('생일1', fd.get('p1_birth_day') || '');
      data.set('생시1', fd.get('p1_hour') || '');
      data.set('생분1', fd.get('p1_minute') || '');
      data.set('성별1', fd.get('p1_gender') || '');

      // 궁합/2인 입력이 있으면 그대로
      if (formEl.querySelector('[name="p2_name"]')) {
        data.set('이름2', fd.get('p2_name') || '');
        data.set('양음력2', fd.get('p2_solarlunar') || '');
        data.set('생년2', fd.get('p2_birth_year') || '');
        data.set('생월2', fd.get('p2_birth_month') || '');
        data.set('생일2', fd.get('p2_birth_day') || '');
        data.set('생시2', fd.get('p2_hour') || '');
        data.set('생분2', fd.get('p2_minute') || '');
        data.set('성별2', fd.get('p2_gender') || '여자');
      }

      // 트래킹/동의 (기존 그대로)
      const qs = new URLSearchParams(location.search);
      data.set('유입경로', document.referrer || '직접 입력/알 수 없음');
      const stay = Math.round((new Date() - pageLoadTime)/1000);
      data.set('체류시간', `${Math.floor(stay/60)}분 ${stay%60}초`);
      data.set('기기정보', navigator.userAgent);
      data.set('UTM소스', qs.get('utm_source') || sessionStorage.getItem('utm_source') || '직접입력');
      data.set('UTM매체', qs.get('utm_medium') || sessionStorage.getItem('utm_medium') || '없음');
      data.set('UTM캠페인', qs.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '없음');
      data.set('개인정보수집동의', (agree1 && agree1.checked) ? '동의' : '미동의');
      const agree2 = document.getElementById('agree2');
      data.set('광고정보수신동의', (agree2 && agree2.checked) ? '동의' : '미동의');

      await fetch(APPS_SCRIPT_URL, { method: 'POST', body: data });
      // === 여기 1줄만 변경 ===
      const next = `payment.html?oid=${encodeURIComponent(orderId)}&product=${encodeURIComponent(productName)}&price=${price}`;
      location.href = next;

    } catch (err) {
      console.error(err);
      alert('신청 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      if (btn) { btn.disabled = false; btn.innerText = '사주분석 신청하기'; }
    }
  });
});
