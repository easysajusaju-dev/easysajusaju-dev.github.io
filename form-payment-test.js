// form-payment-test.js (테스트용: Sheets 저장 + 결제 새 탭 열기)
// jQuery 필요 (saju_1p.html에 이미 있음)

$(document).ready(function() {
  // 기존 submit 핸들러 오버라이드 (덮어쓰기 – 원래 form.js 영향 안 줌)
  $('#sajuForm').off('submit').on('submit', function(e) {
    e.preventDefault(); // 기본 제출 막기
    
    // 1. 폼 데이터 수집 (당신 기존처럼)
    var formData = $(this).serialize(); // 모든 input 자동으로
    
    // 2. 기존 Sheets 저장 (Script URL 그대로)
    $.post('https://script.google.com/macros/s/AKfycbxw9v5o3g8.../exec', formData, function(response) {
      console.log('Sheets 저장 OK!'); // F12 콘솔에서 확인
      alert('신청이 Sheets에 저장됐어요! 이제 결제창이 열립니다.');
    }).fail(function() {
      alert('Sheets 저장 오류! 콘솔(F12) 확인하세요.');
      return; // 실패 시 결제 스킵
    });
    
    // 3. 결제 금액 (하드코딩 – 기본 50,000원)
    var amount = 50000; // 나중엔 사주 타입별로 바꿈 (e.g., $('select[name="sajuType"]').val())
    
    // 4. NicePayments URL 만들기 (테스트 모드)
    var payUrl = 'https://testpay.nicepayments.co.kr/pg/pay.jsp?' +
                 'MID=SIMPLETEST&' +  // 테스트 MID – 실제로 바꾸세요!
                 'Price=' + amount +
                 '&GoodsName=1인 사주풀이&' +
                 'BuyerName=' + encodeURIComponent($('input[name="name"]').val()) +
                 '&ReturnUrl=https://easysajusaju-dev.github.io/thankyou.html&' +
                 'FailUrl=https://easysajusaju-dev.github.io/saju_1p.html';  // 실패 시 이 페이지로
    
    // 5. 새 탭으로 결제창 열기
    window.open(payUrl, '_blank');
    
    return false; // 제출 막기
  });
});
