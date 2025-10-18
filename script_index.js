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
