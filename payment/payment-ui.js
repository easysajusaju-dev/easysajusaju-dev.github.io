// ✅ 테스트 결제 실행 (가짜)
window.startFakePayment = function () {
  alert("✅ 테스트 결제 페이지입니다.\n지금은 실제 결제가 발생하지 않습니다.");

  const urlParams = new URLSearchParams(window.location.search);
  const oid = urlParams.get("oid");
  const product = urlParams.get("product");
  const price = urlParams.get("price");

  console.log("Fake Pay:", { oid, product, price });

  alert("📦 결제 테스트 완료! (mock)\n이제 결제 완료 페이지로 이동합니다.");

  window.location.href = `/thankyoutest.html?oid=${encodeURIComponent(oid)}&product=${encodeURIComponent(product)}&price=${price}`;
};


// ✅ 실 결제 실행 (MID 발급 전 대기 상태)
window.startRealPayment = function () {
  alert("⚠️ 아직 나이스페이 MID가 없어서 실제 결제는 실행되지 않습니다.\nMID 발급되면 여기 연결됩니다!");

  console.log("Real Pay Pressed — MID not set yet");

  // MID 발급 후 여기에 실제 PG 호출 코드 삽입 예정
};
