// form.js (ON/OFF 스위치 + 단순화된 HTML 구조 - 최종 전체 코드)

// --- 페이지 로드 시 JSONP로 데이터 로딩 및 스위치 처리 ---
document.addEventListener('DOMContentLoaded', function() {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    const productSelect = document.getElementById('product');
    const autoPriceSection = document.getElementById('auto-price-section');
    const manualPriceImage = document.querySelector('.manual-price-image');
    
    // JSONP 응답 처리 함수
    window.handlePriceData = function(result) {
        if (result && result.success) {
            
            // ===== 👇 스위치 로직 시작 =====
            if (result.switch === 'ON') {
                // 스위치 ON: 수동 이미지는 숨기고, 자동 가격표를 보여주고 그립니다.
                if (manualPriceImage) manualPriceImage.style.display = 'none';
                if (autoPriceSection) autoPriceSection.style.display = 'block';
                
                const allProducts = result.data;
                const is2P = !!document.querySelector('[name="p2_name"]');
                const pageType = is2P ? '2인 사주용' : '1인 사주용';

                if (autoPriceSection) {
                    // 가격표 그리기 로직 (이전과 동일)
                    autoPriceSection.innerHTML = '';
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
                    const singles = allProductList.filter(p => p.name && !p.name.includes('패키지'));
                    const packages = allProductList.filter(p => p.name && p.name.includes('패키지'));
                    const section1 = createPriceSection('단품 풀이', singles);
                    const section2 = createPriceSection('패키지 풀이', packages);
                    if(section1) autoPriceSection.appendChild(section1);
                    if(section2) autoPriceSection.appendChild(section2);
                }

                if (productSelect) {
                    // 드롭다운 채우기 로직 (이전과 동일)
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
                // 스위치 OFF: 자동 가격표 영역은 숨기고, 수동 이미지를 보여줍니다.
                if (autoPriceSection) autoPriceSection.style.display = 'none';
                if (manualPriceImage) manualPriceImage.style.display = 'block';
            }
            // ===== 👆 스위치 로직 끝 =====

        } else {
            console.error('Data loading error:', result ? result.error : 'No response');
            if (autoPriceSection) autoPriceSection.innerHTML = '<p style="text-align: center; color: red;">상품 정보를 불러오는데 실패했습니다.</p>';
        }
    };

    // JSONP 요청 보내기
    if (autoPriceSection) {
        autoPriceSection.innerHTML = '<p style="text-align: center;">설정 확인 중...</p>';
        const script = document.createElement('script');
        script.src = `${APPS_SCRIPT_URL}?callback=handlePriceData&cache_buster=${new Date().getTime()}`;
        script.onerror = () => {
            autoPriceSection.innerHTML = '<p style="text-align: center; color: red;">데이터 로딩 중 네트워크 오류가 발생했습니다.</p>';
        };
        document.head.appendChild(script);
    }
    
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
});


// --- 시간/분 드롭다운 연동 로직 (수정 없음) ---
function setupHourMinuteSync(personPrefix) {
    const hourSelect = document.querySelector(`select[name="${personPrefix}_hour"]`);
    const minuteSelect = document.querySelector(`select[name="${personPrefix}_minute"]`);
    if (!hourSelect || !minuteSelect) return;
    hourSelect.addEventListener('change', function() { if (this.value === "") { minuteSelect.value = ""; minuteSelect.disabled = true; } else { minuteSelect.disabled = false; } });
    if (hourSelect.value === "") minuteSelect.disabled = true;
}


// --- 폼 제출 로직 (수정 없음) ---
document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button');
    const resultDiv = document.getElementById('result');
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    
    button.disabled = true; button.innerText = "신청하는 중..."; resultDiv.innerText = "";
    
    const formData = new FormData(form);
    const data = {};

    function getBirthDate(prefix) { const year = formData.get(`${prefix}_birth_year`); const month = formData.get(`${prefix}_birth_month`); const day = formData.get(`${prefix}_birth_day`); if (year && month && day) { return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; } return ''; }
    let fullContact; if (formData.get('contact')) { fullContact = formData.get('contact') || ''; } else { const contact1 = formData.get('contact1') || ''; const contact2 = formData.get('contact2') || ''; const contact3 = formData.get('contact3') || ''; fullContact = `${contact1}${contact2}${contact3}`; } data['연락처'] = "'" + fullContact.replace(/\D/g, '');
    data['상품명'] = formData.get('product'); data['이메일'] = formData.get('email'); data['이름1'] = formData.get('p1_name'); data['양음력1'] = formData.get('p1_solarlunar'); const birth1 = getBirthDate('p1'); if (birth1) { [data['생년1'], data['생월1'], data['생일1']] = birth1.split('-'); } data['생시1'] = formData.get('p1_hour'); data['생분1'] = formData.get('p1_minute'); data['성별1'] = formData.get('p1_gender');
    if (form.querySelector('[name="p2_name"]')) { data['이름2'] = formData.get('p2_name'); data['양음력2'] = formData.get('p2_solarlunar'); const birth2 = getBirthDate('p2'); if (birth2) { [data['생년2'], data['생월2'], data['생일2']] = birth2.split('-'); } data['생시2'] = formData.get('p2_hour'); data['생분2'] = formData.get('p2_minute'); data['성별1'] = '남자'; data['성별2'] = '여자'; }
    
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
