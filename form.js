// ==============================
// form.js  (전체 교체본)
// ==============================

const pageLoadTime = new Date();
// Apps Script WebApp /exec 주소
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

/* ------------------------------
 * 공통 UI 유틸
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
    if (h.value === "") {
      mm.value = "";
      mm.disabled = true;
    } else mm.disabled = false;
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
      if (!box) return;
      const tb = box.querySelector(".terms-box");
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
 * 상품 선택값 헬퍼
 * - select#product의 value는 상품ID (p001 …)
 * - 표시 텍스트는 "상품명 (34,900원)" 형태일 수 있음
 * - 시트에는 '상품명'만 저장 (괄호 앞)
 * - 결제/리다이렉트용 가격은 괄호 안 숫자에서 추출
 * ------------------------------ */
function getSelectedProductInfo() {
  const sel = document.querySelector("#product");
  if (!sel) return { id: "", name: "", price: 0, label: "" };

  const id = sel.value || "";
  const label = sel.options[sel.selectedIndex]?.text || "";

  // "상품명 (xx,xxx원)" → name = 괄호 앞
  const name = label.split("(")[0].trim();

  // 괄호 안 금액 추출 → 숫자만
  let price = 0;
  const m = label.match(/\(([\d,\.]+)\s*원?\)/);
  if (m && m[1]) {
    price = Number(String(m[1]).replace(/[^\d]/g, "")) || 0;
  }

  return { id, name, price, label };
}

/* ------------------------------
 * 폼 제출
 * ------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  try {
    populateDateSelects("p1");
    populateDateSelects("p2");
    setupHourMinuteSync("p1");
    setupHourMinuteSync("p2");
    setupAgreement();
    setupImageJump();
  } catch (e) {
    console.error("init error", e);
  }

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
    if (btn) {
      btn.disabled = true;
      btn.innerText = "신청하는 중...";
    }
    if (resDiv) resDiv.innerText = "";

    try {
      const fd = new FormData(formEl);
      const data = {};
      const orderId = "EZ" + Date.now();
      data["오더ID"] = orderId;

      // 생년월일 조합
      function getBirth(prefix) {
        const y = fd.get(`${prefix}_birth_year`);
        const m = fd.get(`${prefix}_birth_month`);
        const d = fd.get(`${prefix}_birth_day`);
        return y && m && d ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}` : "";
      }

      // 연락처
      let contact = "";
      if (fd.get("contact")) contact = fd.get("contact") || "";
      else contact = (fd.get("contact1") || "") + (fd.get("contact2") || "") + (fd.get("contact3") || "");
      data["연락처"] = "'" + contact.replace(/\D/g, "");

      // ✅ 상품 처리 (ID + 이름 + 가격)
      const { id: productId, name: productName, price: productPrice } = getSelectedProductInfo();
      data["상품ID"] = productId;     // 서버/결제용
      data["상품명"] = productName;   // 본사 시트용 (이름만)

      // 나머지 기본 필드
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

      // 2인용 폼일 때만
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
        // (기존 폼 호환용 값 유지)
        data["성별1"] = "남자";
        data["성별2"] = "여자";
      }

      // 유입/체류/UA
      data["유입경로"] = document.referrer || "직접 입력/알 수 없음";
      const stay = Math.round((new Date() - pageLoadTime) / 1000);
      data["체류시간"] = `${Math.floor(stay / 60)}분 ${stay % 60}초`;
      data["기기정보"] = navigator.userAgent;

      // UTM
      const urlParams = new URLSearchParams(window.location.search);
      data["UTM소스"] = urlParams.get("utm_source") || sessionStorage.getItem("utm_source") || "직접입력";
      data["UTM매체"] = urlParams.get("utm_medium") || sessionStorage.getItem("utm_medium") || "없음";
      data["UTM캠페인"] = urlParams.get("utm_campaign") || sessionStorage.getItem("utm_campaign") || "없음";

      // 동의
      const agree2 = document.getElementById("agree2");
      data["개인정보수집동의"] = agree1 && agree1.checked ? "동의" : "미동의";
      data["광고정보수신동의"] = agree2 && agree2.checked ? "동의" : "미동의";

      // 1) 구글 시트 저장
      // 디버그용: 시트로 보내는 값 확인
        console.log("[submit] payload to Apps Script:", data);

        const body = new URLSearchParams(data);
        const r = await fetch(APPS_SCRIPT_URL, { method: "POST", body });
        const t = await r.text();

        let j = {};
        try { 
            j = JSON.parse(t); 
            } catch (_) { /* 구형 응답 호환 */ }

// ✅ Apps Script가 success:false 내려도
// 시트에 row나 traceId가 있으면 저장 성공으로 처리
const saved =
  (j && j.success === true) ||
  Boolean(j && (j.row || j.traceId)) ||
  /"success"\s*:\s*true/i.test(t);

// ✅ 저장 실패 판정 보수화
if (!saved) {
  const msg = (j && j.error) ? j.error : "신청 저장 실패";
  throw new Error(msg);
}


      // 2) 결제/리다이렉트 (PG 붙이기 전까지 임시)
      const priceForRedirect = Number(productPrice || 0);
      const thankYouUrl = `thankyou.html?oid=${encodeURIComponent(orderId)}&product=${encodeURIComponent(
        productName
      )}&price=${priceForRedirect}`;
      // ✅ 고객용 페이지로 이동
window.location.href = thankYouUrl;

// ✅ 개발자 테스트용 페이지 호출 (백그라운드)
fetch(
  `payment.html?oid=${encodeURIComponent(orderId)}&product=${encodeURIComponent(productName)}&price=${priceForRedirect}`,
  { mode: "no-cors" }
);


    } catch (err) {
      console.error(err);
      const resDiv = document.getElementById("result");
      if (resDiv) resDiv.innerText = "⚠️ 오류가 발생했습니다. 다시 시도해주세요.";
      alert(err && err.message ? err.message : "오류가 발생했습니다.");
    } finally {
      const btn = formEl.querySelector("button");
      if (btn) {
        btn.disabled = false;
        btn.innerText = "사주분석 신청하기";
      }
    }
  });
});
