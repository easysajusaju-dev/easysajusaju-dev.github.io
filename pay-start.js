// ✅ PG 기본 설정
const NICE_CLIENT_ID = "발급받은 클라이언트 키"; // 예: R2_xxx...
const CALLBACK_URL = "https://easysajusaju-dev.github.io/payment-callback.html";

// ✅ URL 파라미터 읽기
function getParam(k){ return new URLSearchParams(location.search).get(k); }

document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payBtn");
  if (!payBtn) return;

  payBtn.addEventListener("click", () => {
    const orderId = getParam("oid");
    const product = getParam("product");
    const price = getParam("price");

    if(!orderId || !price){
      alert("주문정보를 찾을 수 없습니다.");
      return;
    }

    // ✅ nicepay 결제창 호출
    const payData = {
      clientId: NICE_CLIENT_ID,
      method: "CARD",
      orderId: orderId,
      amount: Number(price),
      goodsName: product,
      returnUrl: CALLBACK_URL,
      mid: "발급받은 상점 MID" // ex) nicepay00m ...
    };

    // ✅ PG 창 열기
    window.location.href = `https://pay.nicepay.co.kr/v1/pay?${new URLSearchParams(payData)}`;
  });
});
