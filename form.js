// ==============================
// form.js (UI + 시트저장 + 토큰결제 완성형)
// ==============================

// 페이지 로드 시점 기록
const pageLoadTime = new Date();

// ✅ Google Apps Script WebApp 주소 (시트 기록용)
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

// ✅ Vercel 서버 (결제용)
const API_BASE = "https://pay.easysaju.kr/api/pay";


/* ------------------------------
 * 공통 UI 헬퍼
 * ------------------------------ */
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

function setupHourMinuteSync(person) {
  const h = document.querySelector(`select[name="${person}_hour"]`);
  const mm = document.querySelector(`select[name="${person}_minute"]`);
  if (!h || !mm) return;
  if (mm.options.length < 10) {
    for (let i = 0; i <= 23; i++) h.add(new Option(i + "시", i));
    for (let i = 0; i <= 59; i++) mm.add(new Option(i + "분", i));
  }
  h.addEventListener("change", () => {
    mm.disabled = h.value === "";
  });
  if (h.value === "") mm.disabled = true;
}

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

  document.querySelectorAll(".toggle-text").forEach((t) => {
    if (t.tagName === "BUTTON" && !t.getAttribute("type")) t.setAttribute("type", "button");
    t.addEventListener("click", () => {
      const box = t.closest(".agree-box");
      const tb = box?.querySelector(".terms-box");
      if (tb) tb.style.display = tb.style.display === "block" ? "none" : "block";
    });
  });
}

function setupImageJump() {
  const imgs = document.querySelectorAll(".image-section img");
  const formEl = document.getElementById("saju-form");
  function go() {
    if (!formEl) return;
    const top = formEl.getBoundingClientRect().top + window.scrollY - 180;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => {
      const fi = formEl.querySelector("input,select,textarea");
      if (fi) fi.focus();
    }, 800);
  }
  imgs.forEach((img) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      go();
    });
  });
  const headerBtn = document.querySelector(".header-button");
  if (headerBtn)
    headerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      go();
    });
}

/* ------------------------------
 * 상품 선택값 추출 헬퍼
 * ------------------------------ */
function getSelectedProductInfo() {
  const sel = document.querySelector("#product");
  if (!sel) return { id: "", name: "", price: 0 };

  const id = sel.value || "";
  const label = sel.options[sel.selectedIndex]?.text || "";
  const name = label.split("(")[0].trim();

  let price = 0;
  const m = label.match(/\(([\d,\.]+)\s*원?\)/);
  if (m && m[1]) price = Number(m[1].replace(/[^\d]/g, "")) || 0;

  return { id, name, price };
}

/* ------------------------------
 * 폼 제출 및 결제 리다이렉트
 * ------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // ✅ UI 초기화
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
    if (btn) {
      btn.disabled = true;
      btn.innerText = "신청 중...";
    }

    try {
      const fd = new FormData(formEl);
      const data = {};
      const orderId = "EZ" + Date.now();
      data["오더ID"] = orderId;

      // 생년월일 조합 함수
      function getBirth(prefix) {
        const y = fd.get(`${prefix}_birth_year`);
        const m = fd.get(`${prefix}_birth_month`);
        const d = fd.get(`${prefix}_birth_day`);
        return y && m && d ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` : "";
      }

      /// 연락처
      let contact =
       fd.get("contact") ||
       (fd.get("contact1") || "") + (fd.get("contact2") || "") + (fd.get("contact3") || "");

     // 공백/숫자 아닌 문자 제거
       contact = contact.replace(/\D/g, "");

     // 한국형 전화번호 포맷 강제 적용
     if (contact.startsWith("82")) contact = "0" + contact.slice(2); // +82 → 0 변환
    if (contact.length === 11) {
        contact = contact.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else if (contact.length === 10) {
     contact = contact.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
   }

    // 시트 기록 시 "'"로 감싸면 구글시트가 자동 하이픈 제거하지 않음
     data["연락처"] = "'" + contact;
      
      // 상품 정보
      const { id: productId, name: productName, price: productPrice } = getSelectedProductInfo();
      data["상품ID"] = productId;
      data["상품명"] = productName;
      data["상품금액"] = productPrice;

      // 기본 필드
      data["이메일"] = fd.get("email") || "";
      data["이름1"] = fd.get("p1_name") || "";
      data["양음력1"] = fd.get("p1_solarlunar") || "";

      const b1 = getBirth("p1");
      if (b1) {
        const [yy, mm, dd] = b1.split("-");
        data["생년1"] = yy;
        data["생월1"] = mm;
        data["생일1"] = dd;
      }
      data["생시1"] = fd.get("p1_hour") || "";
      data["생분1"] = fd.get("p1_minute") || "";
      data["성별1"] = fd.get("p1_gender") || "";

      // 2인용 폼 처리
      if (formEl.querySelector('[name="p2_name"]')) {
        data["이름2"] = fd.get("p2_name") || "";
        data["양음력2"] = fd.get("p2_solarlunar") || "";
        const b2 = getBirth("p2");
        if (b2) {
          const [y2, m2, d2] = b2.split("-");
          data["생년2"] = y2;
          data["생월2"] = m2;
          data["생일2"] = d2;
        }
        data["생시2"] = fd.get("p2_hour") || "";
        data["생분2"] = fd.get("p2_minute") || "";
        data["성별1"] = "남자";
        data["성별2"] = "여자";
      }

      // UTM 및 기타 로그정보
      const stay = Math.round((new Date() - pageLoadTime) / 1000);
      data["유입경로"] = document.referrer || "직접입력";
      data["체류시간"] = `${Math.floor(stay / 60)}분 ${stay % 60}초`;
      data["기기정보"] = navigator.userAgent;

      const urlParams = new URLSearchParams(window.location.search);
      data["UTM소스"] = urlParams.get("utm_source") || sessionStorage.getItem("utm_source") || "직접입력";
      data["UTM매체"] = urlParams.get("utm_medium") || sessionStorage.getItem("utm_medium") || "없음";
      data["UTM캠페인"] = urlParams.get("utm_campaign") || sessionStorage.getItem("utm_campaign") || "없음";

      // 동의사항
      const agree2 = document.getElementById("agree2");
      data["개인정보수집동의"] = agree1 && agree1.checked ? "동의" : "미동의";
      data["광고정보수신동의"] = agree2 && agree2.checked ? "동의" : "미동의";

// ✅ [1] Google Sheet 기록 (헤더 강제 추가 버전)
const body = new URLSearchParams(data);
const r = await fetch(APPS_SCRIPT_URL, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body,
});
const t = await r.text();
let j = {};
try { j = JSON.parse(t); } catch {}
const saved = (j && j.success) || j.row || /"success"\s*:\s*true/i.test(t);
if (!saved) throw new Error("시트 저장 실패");

if (!saved) throw new Error("시트 저장 실패");

// ✅ [추가] Meta Pixel 전환 추적 코드 (Lead 이벤트)
if (typeof fbq === "function") {
  fbq('track', 'Lead'); // 신청 완료 시 Meta에 “리드 전환”으로 기록
}
      
      // ✅ [2] 서버에 토큰 요청 후 리다이렉트
      const startRes = await fetch(`${API_BASE}/api/pay/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oid: orderId, goodsName: productName }),
      });

      const startData = await startRes.json();
      if (!startData.ok) throw new Error(startData.error || "주문 시작 실패");

      window.location.href = `/payment.html?token=${encodeURIComponent(startData.token)}`;
    } catch (err) {
      console.error("❌ 신청 실패:", err);
      alert(err?.message || "⚠️ 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "사주분석 신청하기";
      }
    }
  });
});
