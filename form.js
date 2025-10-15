document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault(); // 폼의 기본 제출 동작을 막음

    // 폼 데이터 수집
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // 필수 항목 체크
    if (!data.contact || !data.agree) {
        alert("연락처와 개인정보 동의는 필수입니다.");
        return;
    }

    // 현재는 미리보기만
    document.getElementById("result").innerText = "신청이 완료되었습니다. 감사합니다! (미리보기)";
    console.log("제출된 데이터:", data);

    // TODO: 여기에 Google Apps Script URL로 fetch 전송 코드를 넣으면 됩니다.
    /*
    fetch('YOUR_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if(result.success) {
            window.location.href = '/thankyou.html'; // 성공 시 완료 페이지로 이동
        } else {
            alert('신청 중 오류가 발생했습니다.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('신청 중 오류가 발생했습니다.');
    });
    */
});
