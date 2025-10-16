// form.js (진짜 진짜 최종 완전체 코드)

// ===== 디버깅 로그 1 =====
console.log("form.js 파일이 성공적으로 로드되었습니다. 버전: final-debug-full");

document.addEventListener('DOMContentLoaded', function() {
    // ===== 디버깅 로그 2 =====
    console.log("DOMContentLoaded 이벤트 발생. 페이지 구성 시작...");

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    const productSelect = document.getElementById('product');
    const priceListContainer = document.getElementById('price-list');
    
    window.handlePriceData = function(result) {
        // ===== 디버깅 로그 5 (가장 중요) =====
        console.log("Apps Script로부터 JSONP 응답을 성공적으로 받았습니다:", result);
        
        if (result && result.success) {
            const allProducts = result.data;
            const is2P = !!document.querySelector('[name="p2_name"]');
            const pageType = is2P ? '2인용' : '1인용';
            if (priceListContainer) {
                priceListContainer.innerHTML = '';
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
                        itemDiv.innerHTML = `<div class="price-details"><div class="name">${product.name}</div><div class="desc">${product.description}</div></div><div class="price-tag">${Number(product.price).toLocaleString()}원</div>`;
                        categoryDiv.appendChild(itemDiv);
                    });
                    return categoryDiv;
                };
                const section1P = createPriceSection('단품 풀이', allProducts['1인용']);
                const section2P = createPriceSection('패키지 풀이', allProducts['2인용']);
                if(section1P) priceListContainer.appendChild(section1P);
                if(section2P) priceListContainer.appendChild(section2P);
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
            console.error("Apps Script가 오류를 반환했습니다:", result ? result.error : "응답 없음");
            if (priceListContainer) priceListContainer.innerHTML = '<p style="color: red;">상품 정보 로딩에 실패했습니다 (서버 오류).</p>';
        }
    };

    if (priceListContainer) {
        priceListContainer.innerHTML = '<p>상품 정보 로딩 중...</p>';
        const script = document.createElement('script');
        script.id = 'jsonp-script';
        const finalUrl = `${APPS_SCRIPT_URL}?callback=handlePriceData&cache_buster=${new Date().getTime()}`;
        script.src = finalUrl;
        script.onerror = () => {
            console.error("JSONP 스크립트 로드 중 네트워크 오류 발생! URL:", finalUrl);
            priceListContainer.innerHTML = '<p style="color: red;">데이터 로딩 중 네트워크 오류가 발생했습니다.</p>';
        };
        console.log("JSONP 스크립트 태그를 생성하고 문서에 추가합니다. 요청 URL:", finalUrl);
        document.head.appendChild(script);
    } else {
        console.error("가격표를 표시할 영역(<div id='price-list'>)을 찾을 수 없습니다.");
    }
    
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
});

function setupHourMinuteSync(personPrefix) {
    const hourSelect = document.querySelector(`select[name="${personPrefix}_hour"]`);
    const minuteSelect = document.querySelector(`select[name="${personPrefix}_minute"]`);
    if (!hourSelect || !minuteSelect) return;
    hourSelect.addEventListener('change', function() {
        if (this.value === "") { minuteSelect.value = ""; minuteSelect.disabled = true; } 
        else { minuteSelect.disabled = false; }
    });
    if (hourSelect.value === "") minuteSelect.disabled = true;
}

document.getElementById('saju-form').addEventListener('submit', function(event) {
    console.log("폼 제출 이벤트가 발생했습니다.");
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
    function getBirthDate(prefix) { const year = formData.get(`${prefix}_birth_year`); const month = formData.get(`${prefix}_birth_month`); const day = formData.get(`${prefix}_birth_day`); if (year && month && day) { const paddedMonth = String(month).padStart(2, '0'); const paddedDay = String(day).padStart(2, '0'); return `${year}-${paddedMonth}-${paddedDay}`; } return ''; }
    let fullContact; if (formData.get('contact')) { fullContact = formData.get('contact') || ''; } else { const contact1 = formData.get('contact1') || ''; const contact2 = formData.get('contact2') || ''; const contact3 = formData.get('contact3') || ''; fullContact = `${contact1}${contact2}${contact3}`; } data['연락처'] = "'" + fullContact.replace(/\D/g, ''); data['상품명'] = formData.get('product'); data['이메일'] = formData.get('email'); data['이름1'] = formData.get('p1_name'); data['양음력1'] = formData.get('p1_solarlunar'); const birth1 = getBirthDate('p1'); if (birth1) { [data['생년1'], data['생월1'], data['생일1']] = birth1.split('-'); } data['생시1'] = formData.get('p1_hour'); data['생분1'] = formData.get('p1_minute'); data['성별1'] = formData.get('p1_gender'); if (form.querySelector('[name="p2_name"]')) { data['이름2'] = formData.get('p2_name'); data['양음력2'] = formData.get('p2_solarlunar'); const birth2 = getBirthDate('p2'); if (birth2) { [data['생년2'], data['생월2'], data['생일2']] = birth2.split('-'); } data['생시2'] = formData.get('p2_hour'); data['생분2'] = formData.get('p2_minute'); data['성별1'] = '남자'; data['성별2'] = '여자'; }
    const urlEncodedData = new URLSearchParams(data);
    fetch(APPS_SCRIPT_URL, { method: 'POST', body: urlEncodedData, })
    .then(response => response.json())
    .then(result => {
        if (result.success) { window.location.href = 'thankyou.html'; } 
        else { console.error('Apps Script Error:', result.error); resultDiv.innerText = `⚠️ 신청 실패: ${result.error || '알 수 없는 오류'}`; }
    })
    .catch(error => { console.error('Fetch Error:', error); resultDiv.innerText = "⚠️ 신청 중 네트워크 오류가 발생했습니다. 다시 시도해주세요."; })
    .finally(() => { button.disabled = false; button.innerText = "사주분석 신청하기"; });
});
