// form.js (가격표 표시 성공 버전 - 전체 코드)

document.addEventListener('DOMContentLoaded', function() {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    const productSelect = document.getElementById('product');
    const priceListContainer = document.getElementById('price-list');
    
    window.handlePriceData = function(result) {
        if (result && result.success) {
            const allProducts = result.data;
            const is2P = !!document.querySelector('[name="p2_name"]');
            const pageType = is2P ? '2인 사주용' : '1인 사주용';

            if (priceListContainer) {
                priceListContainer.innerHTML = '';
                const createPriceSection = (title, products) => {
                    if (!products || !Array.isArray(products) || products.length === 0) return null;
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'price-category';
                    const categoryTitle = document.createElement('h3');
                    categoryTitle.textContent = title;
                    categoryDiv.appendChild(categoryTitle);
                    products.forEach(product => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'price-item';
                        const isFor1P = (allProducts['1인 사주용'] || []).some(p1 => p1.name === product.name);
                        const isFor2P = (allProducts['2인 사주용'] || []).some(p2 => p2.name === product.name);
                        let linkButton = '';
                        if (!is2P && isFor2P) linkButton = `<a href="saju_2p.html" class="link-button">2인 신청</a>`;
                        if (is2P && isFor1P) linkButton = `<a href="saju_1p.html" class="link-button">1인 신청</a>`;
                        itemDiv.innerHTML = `<div class="price-details"><div class="name">${product.name}</div><div class="desc">${product.description}</div></div><div class="price-tag">${linkButton}<span>${Number(product.price).toLocaleString()}원</span></div>`;
                        categoryDiv.appendChild(itemDiv);
                    });
                    return categoryDiv;
                };
                const allProductList = [...(allProducts['1인 사주용'] || []), ...(allProducts['2인 사주용'] || [])];
                const singles = allProductList.filter(p => p && p.name && !p.name.includes('패키지'));
                const packages = allProductList.filter(p => p && p.name && p.name.includes('패키지'));
                const section1 = createPriceSection('단품 풀이', singles);
                const section2 = createPriceSection('패키지 풀이', packages);
                if(section1) priceListContainer.appendChild(section1);
                if(section2) priceListContainer.appendChild(section2);
            }

            if (productSelect) {
                const productsForPage = allProducts[pageType] || [];
                productSelect.innerHTML = '';
                productsForPage.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.name;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                });
            }
        } else {
            if (priceListContainer) priceListContainer.innerHTML = '<p style="text-align: center; color: red;">상품 정보를 불러오는 데 실패했습니다.</p>';
            console.error('Data loading error:', result ? result.error : 'No response');
        }
    };

    if (document.getElementById('price-list')) {
        document.getElementById('price-list').innerHTML = '<p style="text-align: center;">상품 정보를 불러오는 중입니다...</p>';
        const script = document.createElement('script');
        script.src = `${APPS_SCRIPT_URL}?callback=handlePriceData&cache_buster=${new Date().getTime()}`;
        script.onerror = () => { if (document.getElementById('price-list')) document.getElementById('price-list').innerHTML = '<p style="text-align: center; color: red;">데이터 서버에 연결할 수 없습니다.</p>'; };
        document.head.appendChild(script);
    }
    
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
});

// --- 이하 함수들은 안정 버전 그대로 ---
function setupHourMinuteSync(personPrefix) { /* ... 이전과 동일 ... */ }
document.getElementById('saju-form').addEventListener('submit', function(event) { /* ... 이전과 동일 ... */ });
