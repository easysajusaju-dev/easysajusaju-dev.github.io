// script_index.js

// HTML 문서 로딩이 끝나면, 아래의 모든 기능을 실행
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 부드러운 스크롤 기능 (기존 코드) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });


    // --- 2. 푸터 사업자 정보 펼치기/접기 기능 (새로 추가한 코드) ---
    const toggleButton = document.getElementById('info-toggle-button');
    const details = document.getElementById('business-info-details');
    const arrow = document.getElementById('info-arrow');

    // toggleButton이 페이지에 존재할 때만 아래 코드를 실행 (오류 방지)
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            details.classList.toggle('active');

            if (details.classList.contains('active')) {
                arrow.textContent = '▲';
            } else {
                arrow.textContent = '▼';
            }
        });
    }

});
<script>
  const slider = document.getElementById('reviewSlider');
  let isDown = false;
  let startX, scrollLeft;

  slider.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => isDown = false);
  slider.addEventListener('mouseup', () => isDown = false);
  slider.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });
  // 터치 스와이프는 모바일 브라우저 기본 기능으로 작동함
</script>
// === 후기 슬라이더 드래그 스크롤 ===
const slider = document.getElementById('reviewSlider');
if (slider) {
  let isDown = false;
  let startX, scrollLeft;
  slider.addEventListener('mousedown', e => {
    isDown = true;
    slider.classList.add('dragging');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('dragging');
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('dragging');
  });
  slider.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });
}
