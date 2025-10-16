// form.js (최종 안정화 + 픽셀 리디렉션 버전)

function setupHourMinuteSync(personPrefix) {
    const hourSelect = document.querySelector(`select[name="${personPrefix}_hour"]`);
    const minuteSelect = document.querySelector(`select[name="${personPrefix}_minute"]`);
    if (!hourSelect || !minuteSelect) return;
    hourSelect.addEventListener('change', function() { if (this.value === "") { minuteSelect.value = ""; minuteSelect.disabled = true; } else { minuteSelect.disabled = false; } });
    if (hourSelect.value === "") minuteSelect.disabled = true;
}
document.addEventListener('DOMContentLoaded', function() { setupHourMinuteSync('p1'); setupHourMinuteSync('p2'); });

document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
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
