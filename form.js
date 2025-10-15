// form.js 파일 전체를 이 코드로 교체해주세요.

// --- 페이지 로드 시 가격표/상품목록 자동 생성 ---
document.addEventListener('DOMContentLoaded', function() {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";
    const productSelect = document.getElementById('product');
    const priceListContainer = document.getElementById('price-list');
    
    const is2P = !!document.querySelector('[name="p2_name"]');
    const pageType = is2P ? '2인용' : '1인용';

    if (priceListContainer) {
        fetch(`${APPS_SCRIPT_URL}?action=getProducts`)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const allProducts = result.data;

                    // --- 가격표 생성 ---
                    priceListContainer.innerHTML = '<h3>상품 구성 및 가격</h3>';
                    const productsForThisPage = allProducts[pageType] || [];
                    productsForThisPage.forEach(product => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'price-item';
                        itemDiv.innerHTML = `
                            <div class="price-details">
                                <div class="name">${product.name}</div>
                                <div class="desc">${product.description}</div>
                            </div>
                            <div class="price-tag">${Number(product.price).toLocaleString()}원</div>
                        `;
                        priceListContainer.appendChild(itemDiv);
                    });

                    // --- 상품 드롭다운 생성 ---
                    productSelect.innerHTML = '';
                    productsForThisPage.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.name;
                        option.textContent = product.name;
                        productSelect.appendChild(option);
                    });
                }
            });
    }
    
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
});

// --- 시간/분 드롭다운 연동 로직 ---
function setupHourMinuteSync(personPrefix) {
    // ... (이전과 동일한 코드, 생략)
}

// --- 폼 제출 로직 ---
document.getElementById('saju-form').addEventListener('submit', function(event) {
    // ... (이전과 동일한 코드, 생략)
});
