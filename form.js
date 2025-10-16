// form.js (JSONP 적용 진짜 최종 완성 버전 - 생략 없음)

// --- 페이지 로드 시 JSONP로 가격표/상품목록 자동 생성 ---
document.addEventListener('DOMContentLoaded', function() {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybI4Xl2K4WVoqOmA-L5CPo-eU9gIxg44-Uvsn1IPbvvZmkhWCjVLfYFKXMZOUElxR6/exec";
    const productSelect = document.getElementById('product');
    const priceListContainer = document.getElementById('price-list');
    
    // JSONP 응답을 처리할 함수를 전역 window 객체에 정의합니다.
    window.handlePriceData = function(result) {
        if (result && result.success) {
            const allProducts = result.data;
            const is2P = !!document.querySelector('[name="p2_name"]');
            const pageType = is2P ? '2인용' : '1인용';

            if (priceListContainer) {
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
            if (priceListContainer) {
                priceListContainer.innerHTML = '<p style="text-align: center; color: red;">상품 정보를 불러오는데 실패했습니다.</p>';
            }
            console.error('Data loading error:', result ? result.error : 'No response');
        }
    };

    if (priceListContainer) {
        priceListContainer.innerHTML = '<p style="text-align: center;">상품 정보를 불러오는 중입니다...</p>';
        const oldScript = document.getElementById('jsonp-script');
        if (oldScript) oldScript.remove();
        const script = document.createElement('script');
        script.id = 'jsonp-script';
        script.src = `${APPS_SCRIPT_URL}?callback=handlePriceData`;
        script.onerror = () => {
            priceListContainer.innerHTML = '<p style="text-align: center; color: red;">데이터 로딩 중 네트워크 오류가 발생했습니다.</p>';
        };
        document.head.appendChild(script);
    }
    
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


// --- 폼 제출 로직 ---
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

    function getBirthDate(prefix) {
        const year = formData.get(`${prefix}_birth_year`);
        const month = formData.get(`${prefix}_birth_month`);
        const day = formData.get(`${prefix}_birth_day`);
        if (year && month && day) {
            const paddedMonth = String(month).padStart(2, '0');
            const paddedDay = String(day).padStart(2, '0');
            return `${year}-${paddedMonth}-${paddedDay}`;
        }
        return '';
    }

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
    
    data['이름1'] = formData.get('p1_name');
    data['양음력1'] = formData.get('p1_solarlunar');
    const birth1 = getBirthDate('p1');
    if (birth1) {
        [data['생년1'], data['생월1'], data['생일1']] = birth1.split('-');
    }
    data['생시1'] = formData.get('p1_hour');
    data['생분1'] = formData.get('p1_minute');
    data['성별1'] = formData.get('p1_gender');

    if (form.querySelector('[name="p2_name"]')) {
        data['이름2'] = formData.get('p2_name');
        data['양음력2'] = formData.get('p2_solarlunar');
        const birth2 = getBirthDate('p2');
        if (birth2) {
            [data['생년2'], data['생월2'], data['생일2']] = birth2.split('-');
        }
        data['생시2'] = formData.get('p2_hour');
        data['생분2'] = formData.get('p2_minute');
        data['성별1'] = '남자';
        data['성별2'] = '여자';
    }
    
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
