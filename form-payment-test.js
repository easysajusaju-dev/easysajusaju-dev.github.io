$(document).ready(function() {
  console.log('테스트 시작!');
  
  $('#sajuForm').off('submit').on('submit', function(e) {
    e.preventDefault();
    console.log('=== 클릭 잡음! ===');  // 이 로그 뜨면 제 핸들러 OK
    
    var name = $('input[name="name"]').val();
    if (!name) { alert('이름 입력!'); return; }
    
    // 결제 탭 열기 (이게 핵심!)
    var payUrl = 'https://testpay.nicepayments.co.kr/pg/pay.jsp?MID=SIMPLETEST&Price=50000&GoodsName=사주&BuyerName=' + encodeURIComponent(name) + '&ReturnUrl=https://easysajusaju-dev.github.io/thankyou.html';
    window.open(payUrl, '_blank');
    alert('결제 탭 열렸어요!');
    
    // Sheets 저장 (기존처럼)
    $.post('https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec', $(this).serialize(), function() {
      console.log('Sheets OK!');
      window.location.href = 'thankyou.html';  // thankyou로 가기
    });
    
    return false;
  });
});
