// form.js 파일 전체를 이 코드로 교체하세요.

document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button');
    const resultDiv = document.getElementById('result');

    // 1. Apps Script 배포 URL (나중에 채워넣을 부분)
    const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE"; 
    
    // 버튼 비활성화 및 로딩 표시
    button.disabled = true;
    button.innerText = "신청하는 중...";
    resultDiv.innerText = "";

    const formData = new FormData(form);
    const data = {};

    // HTML 폼 데이터를 Apps Script가 기대하는 이름으로 변경
    data['연락처'] = formData.get('contact');
    data['상품명'] = formData.get('product');

    data['이름1'] = formData.get('p1_name');
    data['양음력1'] = formData.get('p1_solarlunar');
    // 생년월일 분리
    const birth1 = formData.get('p1_birth');
    if (birth1) {
        const [year, month, day] = birth1.split('-');
        data['생년1'] = year;
        data['생월1'] = month;
        data['생일1'] = day;
    }
    data['생시1'] = formData.get('p1_hour');
    data['생분1'] = formData.get('p1_minute');
    
    data['이름2'] = formData.get('p2_name');
    data['양음력2'] = formData.get('p2_solarlunar');
    const birth2 = formData.get('p2_birth');
    if (birth2) {
        const [year, month, day] = birth2.split('-');
        data['생년2'] = year;
        data['생월2'] = month;
        data['생일2'] = day;
    }
    data['생시2'] = formData.get('p2_hour');
    data['생분2'] = formData.get('p2_minute');

    // Apps Script로 데이터 전송
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors' // CORS 오류 방지를 위해 추가
    })
    .then(response => {
        // no-cors 모드에서는 상세 응답을 받을 수 없지만, 요청은 성공적으로 전송됩니다.
        resultDiv.innerText = "✅ 신청이 성공적으로 접수되었습니다!";
        form.reset(); // 폼 초기화
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.innerText = "⚠️ 신청 중 오류가 발생했습니다. 다시 시도해주세요.";
    })
    .finally(() => {
        button.disabled = false;
        button.innerText = "사주분석 신청하기";
    });
});
