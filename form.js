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
            document.querySelectorAll('.agree-section input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = this.checked;
            });
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


// --- 시간/분 드롭다운 연동 로직 (이전과 동일) ---
function setupHourMinuteSync(personPrefix) {
    // ... (이전과 동일한 코드) ...
}

// --- 폼 제출 로직 (생년월일 데이터 조합 기능 추가) ---
document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    // ... (이하 버튼, resultDiv, URL 선언은 이전과 동일) ...

    const formData = new FormData(form);
    const data = {};

    // Helper 함수: YYYY-MM-DD 형식으로 날짜 조합
    function getBirthDate(prefix) {
        const year = formData.get(`${prefix}_birth_year`);
        const month = formData.get(`${prefix}_birth_month`);
        const day = formData.get(`${prefix}_birth_day`);
        if (year && month && day) {
            // 월과 일을 두 자리 숫자로 (예: 1 -> 01)
            const paddedMonth = String(month).padStart(2, '0');
            const paddedDay = String(day).padStart(2, '0');
            return `${year}-${paddedMonth}-${paddedDay}`;
        }
        return '';
    }

    // 데이터 준비
    data['연락처'] = "'" + (formData.get('contact') || '').replace(/\D/g, ''); // 숫자만 남기고, 텍스트 처리
    data['상품명'] = formData.get('product');
    data['이메일'] = formData.get('email');
    
    // 1인 정보 (p1)
    data['이름1'] = formData.get('p1_name');
    data['양음력1'] = formData.get('p1_solarlunar');
    data['p1_birth'] = getBirthDate('p1'); // 생년월일 조합
    data['생시1'] = formData.get('p1_hour');
    data['생분1'] = formData.get('p1_minute');
    data['성별1'] = formData.get('p1_gender');

    // 2인 정보 (p2)
    if (form.querySelector('[name="p2_name"]')) {
        data['이름2'] = formData.get('p2_name');
        data['양음력2'] = formData.get('p2_solarlunar');
        data['p2_birth'] = getBirthDate('p2'); // 생년월일 조합
        data['생시2'] = formData.get('p2_hour');
        data['생분2'] = formData.get('p2_minute');
        data['성별1'] = '남자';
        data['성별2'] = '여자';
    }
    
    // Apps Script로 보낼 최종 데이터에서 p1_birth, p2_birth를 생년,생월,생일로 분리
    if (data.p1_birth) {
        [data['생년1'], data['생월1'], data['생일1']] = data.p1_birth.split('-');
    }
    if (data.p2_birth) {
        [data['생년2'], data['생월2'], data['생일2']] = data.p2_birth.split('-');
    }

    const urlEncodedData = new URLSearchParams(data);

    // ... (fetch 전송 로직은 이전과 동일) ...
});
