/* ============================================
   📌 이지사주 – 가격표 자동 생성 (최종 안정 버전)
   ============================================ */
(function () {
  // 🔥 상품 목록 API (GAS WebApp)
  const PRODUCTS_API =
    "https://script.google.com/macros/s/AKfycbzi-6WMsfTiDCR8OlPvx4Z6V8NMPxr94nmow-kO48HDCDMyvufOzrS9ZbZu9LWo2sMEDg/exec";

  // 🔥 category → 랜딩 매핑
  const CATEGORY_MAP = {
    p_1: "saju_1p.html",
    p_2: "saju_2p.html",
    p_free: "saju_free.html",
    p_exam: "saju_exam.html",
  };

  // 금액 표시 9,900원 포맷
  function formatPrice(value) {
    const num = Number(String(value).replace(/[^\d]/g, "")) || 0;
    return num.toLocaleString("ko-KR") + "원";
  }

  // 섹션 렌더링
  function renderSection(title, items) {
    if (!items.length) return "";
    let html = "";
    html += `<div class="price-section-title">${title}</div>`;

    items.forEach((item) => {
      const name = item.name || "";
      const desc = item.desc || "";
      const cat = item.category || "";
      const id = item.id || "";
      const price = formatPrice(item.price);

      html += `
        <div class="price-row">
          <div class="price-main">
            <div class="price-name">${name}</div>
            <div class="price-desc">${desc}</div>
          </div>
          <div class="price-side">
            <div class="price-value">${price}</div>
            <button class="price-apply-btn"
                    data-category="${cat}"
                    data-id="${id}">
              신청하기
            </button>
          </div>
        </div>
      `;
    });

    return html;
  }

  // 가격보드 생성
  async function buildPriceBoard() {
    const container = document.getElementById("dynamic-price-board");
    if (!container) return;

    let items = [];

    try {
      const res = await fetch(PRODUCTS_API, { cache: "no-store" });
      const data = await res.json();

      if (data && data.ok && Array.isArray(data.items)) {
        items = data.items;
      } else if (Array.isArray(data)) {
        items = data;
      }
       // 🔥 메뉴=1(ON) 상품만 표시
        items = items.filter(it => String(it.menu) === "1");
       
    } catch (err) {
      console.error("가격표 상품 로딩 실패:", err);
      return;
    }

    if (!items.length) return;
// 🔥 특가상품 MINI 배너 추가
const miniItem = items.find(p => p.id === "mini");
if (miniItem) {
    html += `
        <div class="special-banner">
            🔥 ${miniItem.name} — 지금만 ${miniItem.price.toLocaleString()}원!
        </div>
    `;
}

    // mini 상품 = id p001 또는 첫 번째
    const mini =
      items.find((it) => String(it.id) === "p001") || items[0];

    // 구분: 단품, 패키지, 기타
    const singles = items.filter(
      (it) =>
        it.category === "p_1" &&
        !String(it.name).includes("패키지")
    );

    const packages = items.filter(
      (it) =>
        it.category === "p_1" &&
        String(it.name).includes("패키지")
    );

    const others = items.filter((it) => it.category !== "p_1");

    // HTML 생성
    let html = "";
    html += specialBannerHTML; 
    html += `<div class="price-board">`;
    html += `<div class="price-board-title">사주 상품 구성</div>`;

    // 초록띠
    html += `
      <div class="price-board-mini">
        <div class="price-board-mini-left">
          <div class="price-board-mini-name">${mini.name || ""}</div>
          <div class="price-board-mini-desc">${mini.desc || ""}</div>
        </div>
        <div class="price-board-mini-price">${formatPrice(mini.price)}</div>
      </div>
    `;

    // 섹션들
    html += renderSection("단품 풀이", singles);
    html += renderSection("패키지 풀이", packages);
    if (others.length) html += renderSection("기타 상품", others);

    // 빨간 CTA
    html += `</div>`;
    html += `<div class="price-big-cta">운명 보고서 신청하기</div>`;

    container.innerHTML = html;

    // 버튼 동작 (랜딩 이동)
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".price-apply-btn");
      if (!btn) return;

      const category = btn.dataset.category;
      const productId = btn.dataset.id;
      const target = CATEGORY_MAP[category];

      if (!target) {
        alert("온라인 신청이 준비되지 않은 상품입니다.");
        return;
      }

      window.location.href = `${target}?product=${encodeURIComponent(
        productId
      )}`;
    });
  }

  document.addEventListener("DOMContentLoaded", buildPriceBoard);
})();
