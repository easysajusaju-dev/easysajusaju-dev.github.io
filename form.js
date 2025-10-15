// form.js 파일 전체를 이 코드로 교체해주세요.

// --- 페이지 로드 시 가격표/상품목록 자동 생성 (POST 방식) ---
document.addEventListener('DOMContentLoaded', function() {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec"; // <<-- 배포 후 URL이 바뀌었다면 여기를 수정하세요!
    const productSelect = document.getElementById('product');
    const priceListContainer = document.getElementById('price-list');
    
    const is2P = !!document.querySelector('[name="p2_name"]');
    const pageType = is2P ? '2인용' : '1인용';

    if (priceListContainer) {
        priceListContainer.innerHTML = '<p style="text-align: center;">상품 정보를 불러오는 중입니다...</p>';

        // POST 방식으로 데이터 요청
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getProducts' }), // '데이터 요청'이라는 신호를 JSON으로 보냄
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const allProducts = result.data;
                priceListContainer.innerHTML = ''; // 로딩 메시지 제거
                
                // 가격표 섹션을 만드는 함수
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
                
                // 1인용, 2인용 가격표 섹션을 각각 생성하여 추가
                const section1P = createPriceSection('단품 풀이', allProducts['1인용']);
                const section2P = createPriceSection('패키지 풀이', allProducts['2인용']);
                if(section1P) priceListContainer.appendChild(section1P);
                if(section2P) priceListContainer.appendChild(section2P);

                // 현재 페이지 종류에 맞는 상품으로 드롭다운 채우기
                const productsForPage = allProducts[pageType] || [];
                productSelect.innerHTML = '';
                productsForPage.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.name;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                });
            } else {
                priceListContainer.innerHTML = '<p style="text-align: center; color: red;">상품 정보를 불러오는데 실패했습니다.</p>';
            }
        })
        .catch(err => {
            console.error(err);
            priceListContainer.innerHTML = '<p style="text-align: center; color: red;">데이터 로딩 중 오류가 발생했습니다.</p>';
        });
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
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec"; // <<-- 여기도 URL 확인!
    
    button.disabled = true;
    button.innerText = "신청하는 중...";
    resultDiv.innerText = "";

    const formData = new FormData(form);
    const data = {};

    const rawContact = formData.get('contact') || '';
    const cleanedContact = rawContact.replace(/\D/g, '');
    let formattedContact = cleanedContact;
    if (cleanedContact.length === 11) {
        formattedContact = cleanedContact.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleanedContact.length === 10) {
        formattedContact = cleanedContact.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    }
    data['연락처'] = "'" + formattedContact;
    data['상품명'] = formData.get('product');
    data['이름1'] = formData.get('p1_name');
    data['양음력1'] = formData.get('p1_solunar');
    const birth1 = formData.get('p1_birth');
    if (birth1) {
        const [year, month, day] = birth1.split('-');
        data['생년1'] = year; data['생월1'] = month; data['생일1'] = day;
    }
    data['생시1'] = formData.get('p1_hour');
    data['생분1'] = formData.get('p1_minute');
    data['성별1'] = formData.get('p1_gender');

    if (form.querySelector('[name="p2_name"]')) {
        data['이름2'] = formData.get('p2_name');
        data['양음력2'] = formData.get('p2_solunar');
        const birth2 = formData.get('p2_birth');
        if (birth2) {
            const [year, month, day] = birth2.split('-');
            data['생년2'] = year; data['생월2'] = month; data['생일2'] = day;
        }
        data['생시2'] = formData.get('p2_hour');
        data['생분2'] = formData.get('p2_minute');
        data['성별1'] = '남자';
        data['성별2'] = '여자';
    }

    // 폼 제출은 기존과 동일한 'x-www-form-urlencoded' 방식으로 전송
    const urlEncodedData = new URLSearchParams(data);

    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: urlEncodedData,
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            resultDiv.innerText = "✅ 신청이 성공적으로 접수되었습니다!";
            form.reset();
            document.querySelectorAll('select[name$="_minute"]').forEach(sel => sel.disabled = false);
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
