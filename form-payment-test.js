// form-payment-test.js (jQuery 확인 로그 추가)
$(document).ready(function() {
  console.log('jQuery 로드 확인: OK!');  // 이게 새로 추가된 거예요 (F12 콘솔에서 봐요)
  
  console.log('테스트 JS 로드됨! jQuery OK.');  // 기존 로그
  
  // 기존 submit 핸들러에 "추가" (오버라이드 안 함 – 기존 흐름 유지)
  $('#sajuForm').on('submit', function(e) {
    e.preventDefault();  // 자동 제출 완전 막기
    
    console.log('버튼 클릭됨!');  // 콘솔 로그 (F12로 봐요)
    
    // 폼 데이터 수집 (입력 확인)
    var name = $('input[name="name"]').val();
    if (!name) {
      alert('이름을 입력하세요!');  // 빈 폼 방지
      return false;
    }
    
    // 결제 부분만 실행 (Sheets는 기존 JS가 함)
    var amount = 50000;
    var payUrl = 'https://testpay.nicepayments.co.kr/pg/pay.jsp?' +
                 'MID=SIMPLETEST&Price=' + amount + 
                 '&GoodsName=1인 사주풀이&BuyerName=' + encodeURIComponent(name) + 
                 '&ReturnUrl=https://easysajusaju-dev.github.io/thankyou.html';
    
    window.open(payUrl, '_blank');  // 새 탭 열기
    alert('결제창이 열렸어요! (신청도 함께 진행됩니다.)');
    
    return true;  // 기존 제출 허용 (Sheets + thankyou)
  });
});
