// script_index.js
// -----------------------------
// HTML 문서 로딩이 끝나면, 아래의 모든 기능을 실행
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. 부드러운 스크롤 기능 ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // --- 2. 푸터 사업자 정보 펼치기/접기 기능 ---
  const toggleButton = document.getElementById('info-toggle-button');
  const details = document.getElementById('business-info-details');
  const arrow = document.getElementById('info-arrow');

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      details.classList.toggle('active');
      if (details.classList.contains('active')) {
        arrow.textContent = '▲';
      } else {
        arrow.textContent = '▼';
      }
    });
  }

  // --- 3. 후기 슬라이더 드래그 스크롤 기능 ---
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
      const walk = (x - startX) * 1.2; // 이동 속도 조절
      slider.scrollLeft = scrollLeft - walk;
    });
  }

});
