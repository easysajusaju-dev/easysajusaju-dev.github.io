// form.js 파일 전체를 이 코드로 교체해주세요.

// --- 페이지 로드 시 실행될 함수들 ---
document.addEventListener('DOMContentLoaded', function() {
    // 생년월일 드롭다운 채우기
    populateDateSelects('p1');
    populateDateSelects('p2');

    // 시간/분 연동 로직
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');

    // 전체 동의 체크박스 로직
    const agreeAll = document.getElementById('agree_all');
    if (agreeAll) {
        agreeAll.addEventListener('change', function() {
            // agree1 (필수)과 agree2 (선택) 체크박스를 찾아서 상태 변경
            const agree1 = document.getElementById('agree1');
            const agree2 = document.getElementById('agree2');
            if (agree1) agree1.checked = this.checked;
            if (agree2) agree2.checked = this.checked;
        });
    }
});

// --- 생년월일 드롭다운 옵션 생성 함수 ---
function populateDateSelects(prefix) {
    const yearSelect = document.querySelector(`select[name="${prefix}_birth_year"]`);
    const monthSelect = document.querySelector(`select[name="${prefix}_birth_month"]`);
    const daySelect = document.querySelector(`select[name="${prefix}_birth_day"]`);

    if (!yearSelect) return; // 해당 폼 요소가 없으면 종료

    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1930; i--) {
        yearSelect.add(new Option(i + '년', i));
    }
    for (let i = 1; i <= 12; i++) {
        monthSelect.add(new Option(i + '월', i));
    }
    for (let i = 1; i <= 31; i++) {
        daySelect.add(new Option(i + '일', i));
    }
}


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
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";
    
    button.disabled = true;
    button.innerText = "신청하는 중...";
    resultDiv.innerText = "";
    
    const formData = new FormData(form);
    const data = {};

    // Helper 함수: YYYY-MM-DD 형식으로 날짜 조합
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

    // ===== 👇 여기가 수정된 부분입니다! (연락처 처리) =====
    let fullContact;
    if (formData.get('contact')) { // 2인용 폼처럼 'contact' 필드가 하나일 경우
        fullContact = formData.get('contact') || '';
    } else { // 1인용 폼처럼 'contact1,2,3' 필드로 나뉘어 있을 경우
        const contact1 = formData.get('contact1') || '';
        const contact2 = formData.get('contact2') || '';
        const contact3 = formData.get('contact3') || '';
        fullContact = `${contact1}${contact2}${contact3}`;
    }
    data['연락처'] = "'" + fullContact.replace(/\D/g, ''); // 숫자만 남기고, 텍스트 처리
    // ===== 👆 수정 끝 =====

    data['상품명'] = formData.get('product');
    data['이메일'] = formData.get('email');
    
    // 1인 정보 (p1)
    data['이름1'] = formData.get('p1_name');
    data['양음력1'] = formData.get('p1_solarlunar');
    const birth1 = getBirthDate('p1');
    if (birth1) {
        [data['생년1'], data['생월1'], data['생일1']] = birth1.split('-');
    }
    data['생시1'] = formData.get('p1_hour');
    data['생분1'] = formData.get('p1_minute');
    data['성별1'] = formData.get('p1_gender');

    // 2인 정보 (p2)
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
