// ✅ 인증 성공 후 넘어온 값들
function getParam(k){ return new URLSearchParams(location.search).get(k); }

(async ()=> {
  const txid = getParam("tid");
  const orderId = getParam("orderId");
  const product = getParam("product");
  const price = getParam("amount");

  if(!txid){
    alert("결제 인증 정보가 없습니다.");
    location.href = "/index.html";
    return;
  }

  // ✅ 서버로 승인요청
  const res = await fetch("https://my-payment-server.vercel.app/api/pay/approve", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ tid: txid, orderId, amount: price })
  });

  const result = await res.json();
  console.log("✅ 승인 결과:", result);

  if(result.success){
    alert("결제가 완료되었습니다!");
    location.href = `thankyou.html?oid=${orderId}&product=${product}&price=${price}`;
  } else {
    alert("결제 승인 실패!");
    location.href = "/index.html";
  }
})();
