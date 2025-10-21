$(document).ready(function() {
  console.log('테스트 시작!');
  
  $('#sajuForm').off('submit').on('submit', function(e) {
    console.log('=== 제 핸들러 잡음! (기존 막기) ===');  // 이 로그 뜨면 성공
    
    e.preventDefault();
    e.stopImmediatePropagation();  // 기존 핸들러 완전 차단 (이게 핵심!)
    
    var name = $('input[name="name"]').val();
    if (!name) { alert('이름 입력!'); return false; }
    
    console.log('이름 OK, 결제 시작');  // 로그 추가
    
    // 결제 탭
    var payUrl = 'https://testpay.nicepayments.co.kr/pg/pay.jsp?MID=SIMPLETEST&Price=50000&GoodsName=사주&BuyerName=' + encodeURIComponent(name) + '&ReturnUrl=https://easysajusaju-dev.github.io/thankyou.html';
    window.open(payUrl, '_blank');
    alert('결제 탭 열렸어요! (Sheets도 저장 중...)');
    
    // Sheets 저장
    $.post('https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec', $(this).serialize(), function() {
      console.log('Sheets OK!');
      // thankyou는 자동 안 감 – 수동으로
      setTimeout(function() { window.location.href = 'thankyou.html'; }, 1000);  // 1초 후 이동
    });
    
    return false;
  });
  
  console.log('핸들러 설정 완료!');
});
