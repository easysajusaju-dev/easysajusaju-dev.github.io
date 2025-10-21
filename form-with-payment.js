// form-with-payment.js (기존 form.js 로직 + 결제 탭 추가)
// jQuery 필요 (saju_1p.html에 있음)

$(document).ready(function() {
  console.log('결제 버전 로드됨!');  // F12 콘솔 확인
  
  $('#sajuForm').on('submit', function(e) {
    e.preventDefault();  // 기본 제출 막기
    
    console.log('신청 버튼 클릭!');  // 로그
    
    // 폼 데이터 수집 (기존처럼)
    var formData = $(this).serialize();
    console.log('폼 데이터:', formData);  // 로그
    
    // 입력 검증 (이름 필수 – 기존에 없으면 추가)
    var name = $('input[name="name"]').val();
    if (!name) {
      alert('이름을 입력하세요!');
      return false;
    }
    
    // 결제 탭 열기 (추가된 부분 – 새 탭으로)
    var amount = 50000;  // 기본 가격 (나중 동적)
    var payUrl = 'https://testpay.nicepayments.co.kr/pg/pay.jsp?' +
                 'MID=SIMPLETEST&' +  // 테스트 MID (실제 바꾸세요)
                 'Price=' + amount +
                 '&GoodsName=1인 사주풀이&' +
                 'BuyerName=' + encodeURIComponent(name) +
                 '&ReturnUrl=https://easysajusaju-dev.github.io/thankyou.html';
    
    window.open(payUrl, '_blank');  // 새 탭 열기
    alert('신청 저장 중... 결제창이 열렸어요! (완료 후 thankyou로 이동)');
    
    // 기존 Sheets 저장 (form.js 로직 그대로)
    $.post('https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec', formData, function(response) {
      console.log('Sheets 저장 성공!', response);
      // thankyou 페이지로 이동 (기존처럼)
      window.location.href = 'thankyou.html';
    }).fail(function(xhr, status, error) {
      console.error('Sheets 오류:', error);
      alert('저장 오류! 콘솔 확인하세요.');
    });
    
    return false;  // 제출 막기
  });
  
  console.log('설정 완료!');  // 로드 로그
});
