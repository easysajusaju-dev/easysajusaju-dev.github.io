/* ====== 이 파일은 기존 흐름 복구(A안) 전용 완성본 ======
   흐름: 폼 제출 → Apps Script doPost 저장 → thankyou.html 이동
   - 기존 시트/알림톡 흐름 유지
   - Thankyou에서 결제 버튼으로 Payment 이동
========================================================== */

const pageLoadTime = new Date();

// 본사 Webhook URL (절대 변경 금지)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

// ✅ 저장 후 THANKYOU 이동
const REDIRECT_AFTER_SAVE = "thankyou";

/* 날짜 셀렉트 */
function populateDateSelects(prefix) {
  const y = document.querySelector(`select[name="${prefix}_birth_year"]`);
  const m = document.querySelector(`select[name="${prefix}_birth_month"]`);
  const d = document.querySelector(`select[name="${prefix}_birth_day"]`);
  if (!y || !m || !d) return;
  if (y.options.length < 10) {
    const cy = new Date().getFullYear();
    for (let i = cy; i >= 1930; i--) y.add(new Option(i + "년", i));
    for (let i = 1; i <= 12; i++) m.add(new Option(i + "월", i));
    for (let i = 1; i <= 31; i++) d.add(new Option(i + "일", i));
  }
}

/* 출생 시간/분 */
function setupHourMinuteSync(person) {
  const h = document.querySelector(`select[name="${person}_hour"]`);
  const mm = document.querySelector(`select[name="${person}_minute"]`);
  if (!h || !mm) return;
  if (mm.options.length < 10) {
    for (let i = 0; i <= 23; i++) h.add(new Option(i + "시", i));
    for (let i = 0; i <= 59; i++) mm.add(new Option(i + "분", i));
  }
  h.addEventListener("change", () => {
    if (h.value === "") {
      mm.value = "";
      mm.disabled = true;
    } else mm.disabled = false;
  });
  if (h.value === "") mm.disabled = true;
}

/* 동의 체크 */
function setupAgreement() {
  const agreeAll = document.getElementById("agree_all");
  const agree1 = document.getElementById("agree1");
  const agree2 = document.getElementById("agree2");
  if (!agreeAll) return;
  const items = [agree1, agree2].filter(Boolean);
  function update() {
    const c = items.filter((cb) => cb && cb.checked).length;
    agreeAll.checked = c === items.length;
    agreeAll.indeterminate = c > 0 && c < items.length;
  }
  agreeAll.addEventListener("change", () => {
    items.forEach((cb) => cb && (cb.checked = agreeAll.checked));
    update();
  });
  items.forEach((cb) => cb && cb.addEventListener("change", update));
  update();
}

/* 이미지 클릭 → 폼 이동 */
function setupImageJump() {
  const imgs = document.querySelectorAll(".image-section img");
  const formEl = document.getElementById("saju-form");
  function go() {
    if (!formEl) return;
    const top = formEl.getBoundingClientRect().top + window.scrollY - 180;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => {
      const fi = formEl.querySelector("input,select,textarea");
      fi && fi.focus();
    }, 800);
  }
  imgs.forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      go();
    });
  });
}

const PRICE_TABLE = {
  "종합사주 미니": 5000,
  "신년운세": 19900,
  "종합사주": 34900,
  "재물사주": 14900,
  "결혼사주": 12900,
  "연애사주": 9900,
  "연애패키지": 19900,
  "타이밍패키지": 26900,
  "인생패키지": 39900,
  "재회운": 29900,
  "궁합사주": 29900
};

document.addEventListener("DOMContentLoaded", () => {
  populateDateSelects("p1");
  populateDateSelects("p2");
  setupHourMinuteSync("p1");
  setupHourMinuteSync("p2");
  setupAgreement();
  setupImageJump();

  const formEl = document.getElementById("saju-form");
  if (!formEl) return;

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const agree1 = document.getElementById("agree1");
    if (agree1 && !agree1.checked) {
      alert("개인정보 수집/이용에 동의하셔야 신청이 가능합니다.");
      return;
    }

    const btn = formEl.querySelector("button");
    const resDiv = document.getElementById("result");
    btn.disabled = true;
    btn.innerText = "신청하는 중...";
    if (resDiv) resDiv.innerText = "";

    try {
      const fd = new FormData(formEl);
      const data = {};

      // ✅ 오더ID 생성
      const orderId = "EZ" + Date.now();
      data["오더ID"] = orderId;

      // ✅ 연락처 정리
      let contact = (fd.get("contact1") || "") + (fd.get("contact2") || "") + (fd.get("contact3") || "");
      data["연락처"] = String(contact).replace(/\D/g, "");

      // ✅ 이름/생년월일
      function birth(prefix) {
        const y = fd.get(`${prefix}_birth_year`);
        const m = fd.get(`${prefix}_birth_month`);
        const d = fd.get(`${prefix}_birth_day`);
        return y && m && d ? { y, m, d } : null;
      }
      const b1 = birth("p1");
      if (fd.get("p1_name")) data["이름1"] = fd.get("p1_name");
      if (fd.get("p1_gender")) data["성별1"] = fd.get("p1_gender");
      if (fd.get("p1_solarlunar")) data["양음력1"] = fd.get("p1_solarlunar");
      if (b1) {
        data["생년1"] = b1.y;
        data["생월1"] = b1.m;
        data["생일1"] = b1.d;
      }
      data["생시1"] = fd.get("p1_hour") || "";
      data["생분1"] = fd.get("p1_minute") || "";

      // ✅ 개인정보동의
      const agree2 = document.getElementById("agree2");
      data["개인정보수집동의"] = agree1 && agree1.checked ? "동의" : "미동의";
      data["광고정보수신동의"] = agree2 && agree2.checked ? "동의" : "미동의";

      // ✅ 트래킹 정보
      const urlParams = new URLSearchParams(location.search);
      data["UTM소스"] = urlParams.get("utm_source") || sessionStorage.getItem("utm_source") || "";
      data["UTM매체"] = urlParams.get("utm_medium") || sessionStorage.getItem("utm_medium") || "";
      data["UTM캠페인"] = urlParams.get("utm_campaign") || sessionStorage.getItem("utm_campaign") || "";

      // ✅ 상품명
      const productName = fd.get("product") || "기본상품";
      data["상품명"] = productName;

      // ✅ UX 정보
      data["유입경로"] = document.referrer || "직접입력";
      const stay = Math.round((new Date() - pageLoadTime) / 1000);
      data["체류시간"] = `${Math.floor(stay / 60)}분 ${stay % 60}초`;
      data["기기정보"] = navigator.userAgent;
      data["이메일"] = fd.get("email") || "";

      // ✅ 서버 전송
      await fetch(APPS_SCRIPT_URL, { method: "POST", body: new URLSearchParams(data) });

      // ✅ 이동
      const price = PRICE_TABLE[productName] || 34900;
      const next = `thankyou.html?oid=${orderId}&product=${encodeURIComponent(productName)}&price=${price}`;
      location.href = next;

    } catch (e) {
      console.error(e);
      alert("신청 중 문제가 발생했습니다. 다시 시도해주세요.");
    }

    btn.disabled = false;
    btn.innerText = "사주분석 신청하기";
  });
});
