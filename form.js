// form.js 파일 전체를 이 코드로 교체하세요.

// --- 시간/분 드롭다운 연동 로직 ---
function setupHourMinuteSync(personPrefix) {
    const hourSelect = document.querySelector(`select[name="${personPrefix}_hour"]`);
    const minuteSelect = document.querySelector(`select[name="${personPrefix}_minute"]`);

    // 해당 필드가 페이지에 없을 경우(예: 1인용 폼에서 p2 필드) 함수 종료
    if (!hourSelect || !minuteSelect) {
        return;
    }

    hourSelect.addEventListener('change', function() {
        if (this.value === "") { // "모름"을 선택했을 때
            minuteSelect.value = ""; // 분도 "모름"으로 설정
            minuteSelect.disabled = true; // 분 선택을 비활성화
        } else {
            minuteSelect.disabled = false; // 시간을 선택하면 분 선택을 다시 활성화
        }
    });

    // 페이지 로드 시 초기 상태 설정
    if (hourSelect.value === "") {
        minuteSelect.disabled = true;
    }
}

// "본인 정보(p1)"와 "상대방 정보(p2)" 모두에 대해 함수 실행
document.addEventListener('DOMContentLoaded', function() {
    setupHourMinuteSync('p1'); // 본인 시간/분 연동
    setupHourMinuteSync('p2'); // 상대방 시간/분 연동
});
// --- 로직 끝 ---


// --- 기존 폼 제출 로직 ---
document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button');
    const resultDiv = document.getElementById('result');

    const APPS_SCRIPT_URL = "https.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec"; 
    
    button.disabled = true;
    button.innerText = "신청하는 중...";
    resultDiv.innerText = "";

    const formData = new FormData(form);
    const data = {};

    data['연락처'] = formData.get('contact');
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
            // 폼 리셋 후, 비활성화된 분 필드를 다시 활성화 (선택)
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
