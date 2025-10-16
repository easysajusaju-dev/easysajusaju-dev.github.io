// form.js (JSONP 적용 최종 완성 버전)

// --- 페이지 로드 시 JSONP로 가격표/상품목록 자동 생성 ---
document.addEventListener('DOMContentLoaded', function() {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    const productSelect = document.getElementById('product');
    const priceListContainer = document.getElementById('price-list');
    
    // JSONP 응답을 처리할 함수를 전역 window 객체에 정의합니다.
    window.handlePriceData = function(result) {
        if (result.success) {
            const allProducts = result.data;
            const is2P = !!document.querySelector('[name="p2_name"]');
            const pageType = is2P ? '2인용' : '1인용';

            priceListContainer.innerHTML = ''; // 로딩 메시지 제거
            
            const createPriceSection = (title, products) => {
                if (!products || products.length === 0) return null;
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'price-category';
                const categoryTitle = document.createElement('h3');
                categoryTitle.textContent = title;
                categoryDiv.appendChild(categoryTitle);
                products.forEach(product => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'price-item';
                    itemDiv.innerHTML = `
                        <div class="price-details"><div class="name">${product.name}</div><div class="desc">${product.description}</div></div>
                        <div class="price-tag">${Number(product.price).toLocaleString()}원</div>`;
                    categoryDiv.appendChild(itemDiv);
                });
                return categoryDiv;
            };
            
            const section1P = createPriceSection('단품 풀이', allProducts['1인용']);
            const section2P = createPriceSection('패키지 풀이', allProducts['2인용']);
            if(section1P) priceListContainer.appendChild(section1P);
            if(section2P) priceListContainer.appendChild(section2P);

            const productsForPage = allProducts[pageType] || [];
            productSelect.innerHTML = '';
            productsForPage.forEach(product => {
                const option = document.createElement('option');
                option.value = product.name;
                option.textContent = product.name;
                productSelect.appendChild(option);
            });
        } else {
            console.error('Data loading error:', result.error);
            priceListContainer.innerHTML = '<p style="text-align: center; color: red;">상품 정보를 불러오는데 실패했습니다.</p>';
        }
    };

    if (priceListContainer) {
        priceListContainer.innerHTML = '<p style="text-align: center;">상품 정보를 불러오는 중입니다...</p>';
        
        // 이전 스크립트 태그가 남아있을 경우를 대비해 제거
        const oldScript = document.getElementById('jsonp-script');
        if (oldScript) oldScript.remove();
        
        // JSONP 요청을 위한 스크립트 태그 생성
        const script = document.createElement('script');
        script.id = 'jsonp-script';
        script.src = `${APPS_SCRIPT_URL}?callback=handlePriceData`; // 호출할 함수 이름을 URL에 포함
        
        script.onerror = () => {
            priceListContainer.innerHTML = '<p style="text-align: center; color: red;">데이터 로딩 중 네트워크 오류가 발생했습니다.</p>';
        };
        
        document.head.appendChild(script);
    }
    
    // 다른 기능 초기화
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
});


// --- 시간/분 드롭다운 연동 로직 ---
function setupHourMinuteSync(personPrefix) {
    const hourSelect = document.querySelector(`select[name="${personPrefix}_hour"]`);
    const minuteSelect = document.querySelector(`select[name="${personPrefix}_minute"]`);
    if (!hourSelect || !minuteSelect) return;
    hourSelect.addEventListener('change', function() {
        if (this.value === "") {
            minuteSelect.value = "";
            minuteSelect.disabled = true;
        } else {
            minuteSelect.disabled = false;
        }
    });
    if (hourSelect.value === "") minuteSelect.disabled = true;
}


// --- 폼 제출 로직 (안정적인 POST 방식 그대로 유지) ---
document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button');
    const resultDiv = document.getElementById('result');
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    
    button.disabled = true;
    button.innerText = "신청하는 중...";
    resultDiv.innerText = "";
    
    const formData = new FormData(form);
    const data = {};

    let fullContact;
    if (formData.get('contact')) {
        fullContact = formData.get('contact') || '';
    } else {
        const contact1 = formData.get('contact1') || '';
        const contact2 = formData.get('contact2') || '';
        const contact3 = formData.get('contact3') || '';
        fullContact = `${contact1}${contact2}${contact3}`;
    }
    data['연락처'] = "'" + fullContact.replace(/\D/g, '');

    data['상품명'] = formData.get('product');
    data['이메일'] = formData.get('email');
    
    function getBirthDate(prefix) { /* ... 생략 ... */ } // 생년월일 조합 함수는 이전과 동일
    
    data['이름1'] = formData.get('p1_name');
    // ... 이하 폼 데이터 준비 로직은 이전과 동일 ...

    const urlEncodedData = new URLSearchParams(data);

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: urlEncodedData,
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            window.location.href = 'thankyou.html';
        } else {
            console.error('Apps Script Error:', result.error);
            resultDiv.innerText = `⚠️ 신청 실패: ${result.error || '알 수 없는 오류'}`;
        }
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        resultDiv.innerText = "⚠️ 신청 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.";
    })
    .finally(() => {
        button.disabled = false;
        button.innerText = "사주분석 신청하기";
    });
});
