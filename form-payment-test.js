// form-payment-test.js (디버그: 핸들러 강제 + 로그 추가)
$(document).ready(function() {
  console.log('jQuery 로드 확인: OK!');
  console.log('테스트 JS 로드됨! jQuery OK.');
  
  // 기존 핸들러 제거 후 새로 붙이기 (강제 우선)
  $('#sajuForm').off('submit').on('submit', function(e) {
    console.log('=== 버튼 클릭됨! (제 핸들러 동작) ===');  // 이 로그가 핵심!
    
    e.preventDefault();  // 기존 제출 완전 막기
    e.stopPropagation();  // 이벤트 버블링 막기 (충돌 방지)
    
    // 입력 확인
    var name = $('input[name="name"]').val();
    console.log('이름:', name);  // 로그: 이름 출력
    if (!name) {
      alert('이름을 입력하세요!');
      return false;
    }
    
    // 결제 실행
    var amount = 50000;
    var payUrl = 'https://testpay.nicepayments.co.kr/pg/pay.jsp?' +
                 'MID=SIMPLETEST&Price=' + amount + 
                 '&GoodsName=1인 사주풀이&BuyerName=' + encodeURIComponent(name) + 
                 '&ReturnUrl=https://easysajusaju-dev.github.io/thankyou.html';
    
    console.log('결제 URL 생성:', payUrl);  // 로그: URL 확인
    window.open(payUrl, '_blank');
    alert('결제창 열렸어요! (기존 신청은 잠시 멈춤.)');
    
    // Sheets는 수동으로 호출 (기존 로직 복사 – form.js 봐서 맞춤)
    var formData = $('#sajuForm').serialize();
    console.log('Sheets 데이터:', formData);
    $.post('https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec', formData, function(response) {
      console.log('Sheets 저장 OK!');
      alert('Sheets 저장됐어요!');
    });
    
    return false;  // 제출 막기
  });
  
  console.log('핸들러 붙임 완료!');  // 로드 후 로그
});
