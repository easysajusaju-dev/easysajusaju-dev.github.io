// form.js (결제 기능 추가 버전)
const pageLoadTime = new Date();

document.addEventListener('DOMContentLoaded', function() {
    populateDateSelects('p1');
    populateDateSelects('p2');
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
    setupAgreement();
    setupImageJump();
});

function populateDateSelects(prefix) { 
    const yearSelect = document.querySelector(`select[name="${prefix}_birth_year"]`); 
    const monthSelect = document.querySelector(`select[name="${prefix}_birth_month"]`); 
    const daySelect = document.querySelector(`select[name="${prefix}_birth_day"]`); 
    if (!yearSelect) return; 
    const currentYear = new Date().getFullYear(); 
    for (let i = currentYear; i >= 1930; i--) yearSelect.add(new Option(i + '년', i)); 
    for (let i = 1; i <= 12; i++) monthSelect.add(new Option(i + '월', i)); 
    for (let i = 1; i <= 31; i++) daySelect.add(new Option(i + '일', i));
}

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

function setupAgreement() {
  const agreeAll = document.getElementById('agree_all');
  const agree1 = document.getElementById('agree1');
  const agree2 = document.getElementById('agree2');
  if (!agreeAll) return;

  const items = [agree1, agree2].filter(Boolean);
  agreeAll.addEventListener('change', () => {
    items.forEach(cb => cb.checked = agreeAll.checked);
    updateAllState();
  });
  items.forEach(cb => cb.addEventListener('change', updateAllState));
  updateAllState();

  function updateAllState() {
    if (items.length === 0) return;
    const checkedCount = items.filter(cb => cb.checked).length;
    agreeAll.checked = checkedCount === items.length;
    agreeAll.indeterminate = checkedCount > 0 && checkedCount < items.length;
  }

  document.querySelectorAll('.toggle-text').forEach(toggle => {
    if (toggle.tagName === 'BUTTON' && !toggle.getAttribute('type')) {
      toggle.setAttribute('type', 'button');
    }
    toggle.addEventListener('click', function() {
      const box = this.closest('.agree-box');
      if (!box) return;
      const termsBox = box.querySelector('.terms-box');
      if (!termsBox) return;
      termsBox.style.display = termsBox.style.display === 'block' ? 'none' : 'block';
    });
  });
}

function setupImageJump() {
    const allImages = document.querySelectorAll('.image-section img'); 
    const formElement = document.getElementById('saju-form'); 
    if (formElement && allImages.length > 0) { 
        allImages.forEach(image => { 
            image.style.cursor = 'pointer'; 
            image.addEventListener('click', function(event) { 
                event.preventDefault(); 
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    } 
     const headerButton = document.querySelector('.header-button');
     if (formElement && headerButton) {
        headerButton.addEventListener('click', function(event) {
            event.preventDefault();
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
}

// 결제 요청 함수 수정
async function requestPayment() {
    const tossPayments = TossPayments("test_ck_DnyRpQWGrNq1zx4q7x4yVKwv1M9E");
    const productName = document.querySelector('select[name="product"]').value;
    
    try {
        // Apps Script에서 가격 조회
        const priceResponse = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: new URLSearchParams({
                action: 'getPrice',
                상품명: productName
            })
        });
        const priceResult = await priceResponse.json();
        
        if (!priceResult.success) {
            throw new Error('가격 조회 실패');
        }

        const amount = priceResult.price;
        
        await tossPayments.requestPayment({
            method: "CARD",
            amount: amount, // 조회된 가격 사용
            orderId: "TEST_" + new Date().getTime(),
            orderName: productName,
            successUrl: window.location.origin + "/thankyou.html",
            failUrl: window.location.origin + "/saju_2p.html"
        });
    } catch (error) {
        console.error("결제 에러:", error);
        alert("결제에 실패했습니다. 다시 시도해주세요.");
    }
}

// 폼 제출 기능 (수정된 버전)
document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const agree1 = document.getElementById('agree1');
    if (agree1 && !agree1.checked) {
        alert("개인정보 수집/이용에 동의하셔야 신청이 가능합니다.");
        return;
    }

    const form = event.target;
    const button = form.querySelector('button');
    const resultDiv = document.getElementById('result');
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";
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
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; 
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
    
    data['유입경로'] = document.referrer || '직접 입력/알 수 없음';
    const timeOnPage = Math.round((new Date() - pageLoadTime) / 1000);
    data['체류시간'] = `${Math.floor(timeOnPage / 60)}분 ${timeOnPage % 60}초`;
    data['기기정보'] = navigator.userAgent;
    
    const agree2 = document.getElementById('agree2');
    data['개인정보수집동의'] = agree1 && agree1.checked ? '동의' : '미동의';
    data['광고정보수신동의'] = agree2 && agree2.checked ? '동의' : '미동의';

    const urlEncodedData = new URLSearchParams(data);
    
    // 1. 먼저 시트에 저장
    fetch(APPS_SCRIPT_URL, { method: 'POST', body: urlEncodedData })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // 2. 저장 성공하면 결제 진행
            requestPayment();
        } else {
            throw new Error(result.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.innerText = "⚠️ 저장 중 오류가 발생했습니다.";
        button.disabled = false;
        button.innerText = "사주분석 신청하기";
    });
});
