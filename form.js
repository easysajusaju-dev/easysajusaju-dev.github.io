/* ====== 이 파일은 결제 연동 흐름(B안 최종) ======
   흐름: 폼 제출 → Apps Script 저장 → payment.html 이동(결제)
   - 기존 시트/알림톡 흐름 그대로 둠
   - orderId 프론트에서 생성 → 시트 기록 유지
========================================================== */

const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

// ✅ 항상 payment.html로 이동
const REDIRECT_AFTER_SAVE = "payment"; 

function populateDateSelects(prefix){
  const y = document.querySelector(`select[name="${prefix}_birth_year"]`);
  const m = document.querySelector(`select[name="${prefix}_birth_month"]`);
  const d = document.querySelector(`select[name="${prefix}_birth_day"]`);
  if(!y||!m||!d) return;
  if(y.options.length < 10) {
    const cy = new Date().getFullYear();
    for(let i=cy;i>=1930;i--) y.add(new Option(i+'년',i));
    for(let i=1;i<=12;i++) m.add(new Option(i+'월',i));
    for(let i=1;i<=31;i++) d.add(new Option(i+'일',i));
  }
}

function setupHourMinuteSync(person){
  const h = document.querySelector(`select[name="${person}_hour"]`);
  const mm = document.querySelector(`select[name="${person}_minute"]`);
  if(!h||!mm) return;
  if(mm.options.length < 10) {
    for(let i=0;i<=23;i++) h.add(new Option(i+'시',i));
    for(let i=0;i<=59;i++) mm.add(new Option(i+'분',i));
  }
  h.addEventListener('change',()=>{
    if(h.value===""){
      mm.value="";
      mm.disabled=true;
    } else mm.disabled=false;
  });
  if(h.value==="") mm.disabled=true;
}

function setupAgreement(){
  const agreeAll=document.getElementById('agree_all');
  const agree1=document.getElementById('agree1');
  const agree2=document.getElementById('agree2');
  if(!agreeAll) return;
  const items=[agree1,agree2].filter(Boolean);
  function update(){
    const c=items.filter(cb=>cb&&cb.checked).length;
    agreeAll.checked=c===items.length;
    agreeAll.indeterminate=c>0&&c<items.length;
  }
  agreeAll.addEventListener('change',()=>{
    items.forEach(cb=>cb&&(cb.checked=agreeAll.checked)); update();
  });
  items.forEach(cb=>cb&&cb.addEventListener('change',update));
  update();
}

function setupImageJump(){
  const imgs=document.querySelectorAll('.image-section img');
  const formEl=document.getElementById('saju-form');
  function go(){
    if(!formEl) return;
    const top=formEl.getBoundingClientRect().top+window.scrollY-180;
    window.scrollTo({top,behavior:'smooth'});
    setTimeout(()=>{
      const fi=formEl.querySelector('input,select,textarea');
      if(fi) fi.focus();
    },800);
  }
  imgs.forEach(img=>{
    img.style.cursor='pointer';
    img.addEventListener('click',e=>{e.preventDefault(); go();});
  });
}

const PRICE_TABLE = {
  "종합사주 미니": 5000,
  "신년운세": 19900,
  "종합사주": 34900,
  "재물사주": 14900,
  "결혼사주": 12900,
  "연애사주": 9900,
  "연애패키지": 19900,
  "타이밍패키지": 26900,
  "인생패키지": 39900,
  "재회운": 29900,
  "궁합사주": 29900
};

document.addEventListener('DOMContentLoaded', ()=>{
  populateDateSelects('p1'); populateDateSelects('p2');
  setupHourMinuteSync('p1'); setupHourMinuteSync('p2');
  setupAgreement(); setupImageJump();

  const formEl=document.getElementById('saju-form');
  if(!formEl) return;

  formEl.addEventListener('submit', async (event)=>{
    event.preventDefault();

    const agree1=document.getElementById('agree1');
    if(agree1 && !agree1.checked){
      alert('개인정보 수집/이용에 동의하셔야 신청이 가능합니다.');
      return;
    }

    const btn=formEl.querySelector('button'); 
    btn.disabled=true; btn.innerText='신청하는 중...'; 

    try{
      const fd=new FormData(formEl), data={};
      const orderId='EZ'+Date.now(); // ✅ 결제·시트 동일 주문번호
      data['오더ID']=orderId;

      function getBirth(prefix){
        const y=fd.get(`${prefix}_birth_year`), m=fd.get(`${prefix}_birth_month`), d=fd.get(`${prefix}_birth_day`);
        return (y&&m&&d)?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:'';
      }

      let contact='';
      contact=(fd.get('contact1')||'')+(fd.get('contact2')||'')+(fd.get('contact3')||'');
      data['연락처']="'"+String(contact||'').replace(/\D/g,'');

      const productName = fd.get('product') || '';
      data['상품명']=productName;
      data['이메일']=fd.get('email')||'';
      data['이름1']=fd.get('p1_name')||'';
      data['양음력1']=fd.get('p1_solarlunar')||'';

      const b1=getBirth('p1');
      if(b1){
        const [yy,mm,dd]=b1.split('-');
        data['생년1']=yy; data['생월1']=mm; data['생일1']=dd;
      }
      data['생시1']=fd.get('p1_hour')||'';
      data['생분1']=fd.get('p1_minute')||'';
      data['성별1']=fd.get('p1_gender')||'';

      data['유입경로']=document.referrer||'';
      const stay=Math.round((new Date()-pageLoadTime)/1000);
      data['체류시간']=`${Math.floor(stay/60)}분 ${stay%60}초`;
      data['기기정보']=navigator.userAgent;

      const body=new URLSearchParams(data);
      await fetch(APPS_SCRIPT_URL,{method:'POST',body}); // ✅ 시트 기록

      const price = PRICE_TABLE[productName] || 34900;
      const payUrl = `payment.html?oid=${encodeURIComponent(orderId)}&product=${encodeURIComponent(productName)}&price=${price}`;
      window.location.href = payUrl;

    }catch(err){
      alert('네트워크 오류입니다. 잠시 후 다시 시도해주세요.');
    } finally {
      btn.disabled=false;
      btn.innerText='사주분석 신청하기';
    }
  });
});
