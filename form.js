function submitForm() {
  const formData = {
    contact: document.querySelector('[name="contact"]').value,
    manName: document.querySelector('[name="man_name"]').value,
    manBirth: document.querySelector('[name="man_birth"]').value,
    product: document.querySelector('[name="product"]').value,
    agree: document.querySelector('[name="agree"]').checked,
    timestamp: new Date().toLocaleString()
  };

  if (!formData.contact || !formData.agree) {
    alert("연락처와 개인정보 동의는 필수입니다.");
    return;
  }

  // ✅ 여기서 Google Sheets 연동 or 알림톡 전송 가능
  document.getElementById("result").innerText = "신청이 완료되었습니다. 감사합니다! 🙏 (미리보기)";

  // 👉 실제 전송하려면 fetch() 로 Apps Script URL로 POST 전송
  // 예시:
  /*
  fetch("YOUR_APPS_SCRIPT_URL", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json"
    }
  })
  */
}
