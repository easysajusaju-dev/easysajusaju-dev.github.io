// form.js (동의 기록 포함 - 진짜 최종 풀코드)

const pageLoadTime = new Date();

document.addEventListener('DOMContentLoaded', function() {
    populateDateSelects('p1');
    populateDateSelects('p2');
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
    setupAgreement();
    setupImageJump();
});
// --- 생년월일 드롭다운을 채우는 함수 ---
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

// --- 시간/분 드롭다운 연동 함수 ---
function setupHourMinuteSync(personPrefix) { 
    const hourSelect = document.querySelector(`select[name="${prefix}_hour"]`); 
    const minuteSelect = document.querySelector(`select[name="${prefix}_minute"]`); 
    if (!hourSelect || !minuteSelect) return; 
    hourSelect.addEventListener('change', function() { if (this.value === "") { minuteSelect.value = ""; 
    minuteSelect.disabled = true; } else { minuteSelect.disabled = false; } }); 
    if (hourSelect.value === "") minuteSelect.disabled = true;
}

// --- 동의 관련 기능을 하나로 묶은 함수 ---
function setupAgreement() { 
    const agreeAll = document.getElementById('agree_all'); 
    const agree1 = document.getElementById('agree1'); 
    const agree2 = document.getElementById('agree2'); 
    if (agreeAll && agree1) { agreeAll.addEventListener('change', function() { agree1.checked = this.checked; if(agree2) agree2.checked = this.checked;
                                                                             });
                             const updateAgreeAll = () => {
                                 if (agree2) {
                                     agreeAll.checked = agree1.checked && agree2.checked; 
                                 } else { agreeAll.checked = agree1.checked;
                                        } 
                             };
                             agree1.addEventListener('change', updateAgreeAll);
                             if(agree2) agree2.addEventListener('change', updateAgreeAll);
                            }
       // 약관 펼쳐보기 기능
    document.querySelectorAll('.toggle-text').forEach(toggle => {
        toggle.addEventListener('click', function() { 
            const termsBox = this.closest('.agree-box').querySelector('.terms-box'); 
            if (termsBox) { 
                if (termsBox.style.display === 'block') { termsBox.style.display = 'none';
                                                        } else {
                    termsBox.style.display = 'block';
                }
            }
        });
    });
}
// --- 이미지 클릭 점프 기능 함수 ---
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

// --- 폼 제출 기능 ---
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
    button.disabled = true; button.innerText = "신청하는 중..."; resultDiv.innerText = "";
    const formData = new FormData(form);
    const data = {};
    function getBirthDate(prefix) { const year = formData.get(`${prefix}_birth_year`); const month = formData.get(`${prefix}_birth_month`); const day = formData.get(`${prefix}_birth_day`); if (year && month && day) { return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; } return ''; }
    let fullContact; if (formData.get('contact')) { fullContact = formData.get('contact') || ''; } else { const contact1 = formData.get('contact1') || ''; const contact2 = formData.get('contact2') || ''; const contact3 = formData.get('contact3') || ''; fullContact = `${contact1}${contact2}${contact3}`; } data['연락처'] = "'" + fullContact.replace(/\D/g, '');
    data['상품명'] = formData.get('product'); data['이메일'] = formData.get('email'); data['이름1'] = formData.get('p1_name'); data['양음력1'] = formData.get('p1_solarlunar'); const birth1 = getBirthDate('p1'); if (birth1) { [data['생년1'], data['생월1'], data['생일1']] = birth1.split('-'); } data['생시1'] = formData.get('p1_hour'); data['생분1'] = formData.get('p1_minute'); data['성별1'] = formData.get('p1_gender');
    if (form.querySelector('[name="p2_name"]')) { data['이름2'] = formData.get('p2_name'); data['양음력2'] = formData.get('p2_solarlunar'); const birth2 = getBirthDate('p2'); if (birth2) { [data['생년2'], data['생월2'], data['생일2']] = birth2.split('-'); } data['생시2'] = formData.get('p2_hour'); data['생분2'] = formData.get('p2_minute'); data['성별1'] = '남자'; data['성별2'] = '여자'; }
    
    data['유입경로'] = document.referrer || '직접 입력/알 수 없음';
    const timeOnPage = Math.round((new Date() - pageLoadTime) / 1000);
    data['체류시간'] = `${Math.floor(timeOnPage / 60)}분 ${timeOnPage % 60}초`;
    data['기기정보'] = navigator.userAgent;
    
    const agree2 = document.getElementById('agree2');
    data['개인정보수집동의'] = agree1 && agree1.checked ? '동의' : '미동의';
    data['광고정보수신동의'] = agree2 && agree2.checked ? '동의' : '미동의';

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
