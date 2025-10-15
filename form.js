document.getElementById('saju-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.contact || !data.agree) {
        alert("연락처와 동의 항목은 필수입니다.");
        return;
    }

    document.getElementById("result").innerText = "신청이 완료되었습니다. (미리보기)";
    console.log("제출된 데이터:", data);
});
