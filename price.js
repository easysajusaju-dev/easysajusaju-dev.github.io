/* ============================================
   📌 이지사주 – 가격표 자동 생성 (특가 3안 안정 버전)
   ============================================ */
(function () {
  const PRODUCTS_API =
    "https://script.google.com/macros/s/AKfycbzi-6WMsfTiDCR8OlPvx4Z6V8NMPxr94nmow-kO48HDCDMyvufOzrS9ZbZu9LWo2sMEDg/exec";

  const CATEGORY_MAP = {
    p_1: "saju_1p.html",
    p_2: "saju_2p.html",
    p_free: "saju_free.html",
    p_exam: "saju_exam.html",
  };

  function formatPrice(value) {
    const num = Number(String(value).replace(/[^\d]/g, "")) || 0;
    return num.toLocaleString("ko-KR") + "원";
  }

  function renderSection(title, items) {
    if (!items.length) return "";
    let html = `<div class="price-section-title">${title}</div>`;

    items.forEach((item) => {
      html += `
        <div class="price-row">
          <div class="price-main">
            <div class="price-name">${item.name}</div>
            <div class="price-desc">${item.desc || ""}</div>
          </div>
          <div class="price-side">
            <div class="price-value">${formatPrice(item.price)}</div>
            <button class="price-apply-btn"
              data-category="${item.category}"
              data-id="${item.id}">
              신청하기
            </button>
          </div>
        </div>`;
    });

    return html;
  }

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

      // 메뉴=1만 표시
      items = items.filter((it) => String(it.menu) === "1");
    } catch (err) {
      console.error("가격표 로딩 오류:", err);
      return;
    }

    if (!items.length) return;

    // MINI 상품 찾기 (없으면 첫 번째)
    const mini =
      items.find((it) => String(it.id) === "p001") || items[0];

    /* 🔥 특가 띠 (3안: 미니 초록띠 + 간단 강조) */
    const specialBannerHTML = `
      <div class="special-banner-mini">
        <span class="mini-left">🔥 ${mini.name}</span>
        <span class="mini-right">${formatPrice(mini.price)} → 특가</span>
      </div>
    `;

    const singles = items.filter(
      (it) => it.category === "p_1" && !it.name.includes("패키지")
    );
    const packages = items.filter(
      (it) => it.category === "p_1" && it.name.includes("패키지")
    );
    const others = items.filter((it) => it.category !== "p_1");

    // -------------------------
    // 가격표 전체 HTML 생성
    // -------------------------
    let html = "";
    html += specialBannerHTML;

    html += `<div class="price-board">`;
    html += `<div class="price-board-title">사주 상품 구성</div>`;

    // 초록색 MINI 띠
    html += `
      <div class="price-board-mini">
        <div class="price-board-mini-left">
          <div class="price-board-mini-name">${mini.name}</div>
          <div class="price-board-mini-desc">${mini.desc || ""}</div>
        </div>
        <div class="price-board-mini-price">${formatPrice(mini.price)}</div>
      </div>
    `;

    html += renderSection("단품 풀이", singles);
    html += renderSection("패키지 풀이", packages);
    html += renderSection("기타 상품", others);

    html += `</div>`;
    html += `<div class="price-big-cta">운명 보고서 신청하기</div>`;

    container.innerHTML = html;

    // 버튼 클릭 시 해당 랜딩으로 이동
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".price-apply-btn");
      if (!btn) return;

      const category = btn.dataset.category;
      const id = btn.dataset.id;
      const target = CATEGORY_MAP[category];

      if (!target) {
        alert("신청 페이지가 준비되지 않았습니다.");
        return;
      }

      window.location.href = `${target}?product=${encodeURIComponent(id)}`;
    });
  }

  document.addEventListener("DOMContentLoaded", buildPriceBoard);
})();
