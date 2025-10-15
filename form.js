// form.js 파일 전체를 이 코드로 교체하세요.

// --- 시간/분 드롭다운 연동 로직 ---
function setupHourMinuteSync(personPrefix) {
    const hourSelect = document.querySelector(`select[name="${personPrefix}_hour"]`);
    const minuteSelect = document.querySelector(`select[name="${personPrefix}_minute"]`);

    if (!hourSelect || !minuteSelect) {
        return;
    }

    hourSelect.addEventListener('change', function() {
        if (this.value === "") {
            minuteSelect.value = "";
            minuteSelect.disabled = true;
        } else {
            minuteSelect.disabled = false;
        }
    });

    if (hourSelect.value === "") {
        minuteSelect.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupHourMinuteSync('p1');
    setupHourMinuteSync('p2');
});
// --- 로직 끝 ---


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

    // ===== 👇 여기가 수정된 부분입니다! =====
    // 전화번호를 가져와서 하이픈(-)을 자동으로 추가하고, 텍스트 형식으로 만듦
    const rawContact = formData.get('contact') || '';
    const cleanedContact = rawContact.replace(/\D/g, ''); // 숫자 이외의 문자 모두 제거
    let formattedContact = cleanedContact;

    // 한국 전화번호 형식에 맞게 하이픈 추가
    if (cleanedContact.length === 11) { // 010-1234-5678
        formattedContact = cleanedContact.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleanedContact.length === 10) { // 02-1234-5678 또는 031-123-4567
        formattedContact = cleanedContact.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    } // 그 외의 경우는 일단 그대로 둠

    data['연락처'] = "'" + formattedContact;
    // ===== 👆 수정 끝 =====

    data['상품명'] = formData.get('product');
    data['이름1'] = formData.get('p1_name');
    data['양음력1'] = formData.get('p1_solarlunar');
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
        data['양음력2'] = formData.get('p2_solarlunar');
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
