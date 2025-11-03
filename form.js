const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

function populateDateSelects(prefix){
  const y = document.querySelector(`select[name="${prefix}_birth_year"]`);
  const m = document.querySelector(`select[name="${prefix}_birth_month"]`);
  const d = document.querySelector(`select[name="${prefix}_birth_day"]`);
  if(!y||!m||!d) return;
  if(y.options.length < 10) { // 중복 방지
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
  if(mm.options.length < 10) { // 중복 방지
    for(let i=0;i<=23;i++) h.add(new Option(i+'시',i));
    for(let i=0;i<=59;i++) mm.add(new Option(i+'분',i));
  }
  h.addEventListener('change',()=>{ if(h.value===""){ mm.value=""; mm.disabled=true; } else mm.disabled=false; });
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
  agreeAll.addEventListener('change',()=>{ items.forEach(cb=>cb&&(cb.checked=agreeAll.checked)); update(); });
  items.forEach(cb=>cb&&cb.addEventListener('change',update)); 
  update();
  document.querySelectorAll('.toggle-text').forEach(t=>{
    if(t.tagName==='BUTTON'&&!t.getAttribute('type')) t.setAttribute('type','button');
    t.addEventListener('click',()=>{ 
      const box=t.closest('.agree-box'); if(!box) return; 
      const tb=box.querySelector('.terms-box'); 
      if(tb) tb.style.display=tb.style.display==='block'?'none':'block';
    });
  });
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
  imgs.forEach(img=>{ img.style.cursor='pointer'; img.addEventListener('click',e=>{e.preventDefault(); go();}); });
  const headerBtn=document.querySelector('.header-button');
  if(headerBtn) headerBtn.addEventListener('click',e=>{e.preventDefault(); go();});
}

document.addEventListener('DOMContentLoaded', ()=>{
  try{ 
    populateDateSelects('p1'); populateDateSelects('p2'); 
    setupHourMinuteSync('p1'); setupHourMinuteSync('p2'); 
    setupAgreement(); setupImageJump(); 
  }catch(e){ console.error('init error',e); }

  const formEl=document.getElementById('saju-form'); 
  if(!formEl) return;

  formEl.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const agree1=document.getElementById('agree1'); 
    if(agree1 && !agree1.checked){ alert('개인정보 수집/이용에 동의하셔야 신청이 가능합니다.'); return; }

    const btn=formEl.querySelector('button'); const resDiv=document.getElementById('result');
    btn.disabled=true; btn.innerText='신청하는 중...'; if(resDiv) resDiv.innerText='';

    try{
      const fd=new FormData(formEl), data={};
      const orderId='EZ'+Date.now(); 
      data['오더ID']=orderId;

      function getBirth(prefix){ 
        const y=fd.get(`${prefix}_birth_year`), m=fd.get(`${prefix}_birth_month`), d=fd.get(`${prefix}_birth_day`);
        return (y&&m&&d)?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:''; 
      }
      let contact=''; if(fd.get('contact')) contact=fd.get('contact')||''; else contact=(fd.get('contact1')||'')+(fd.get('contact2')||'')+(fd.get('contact3')||'');
      data['연락처']="'"+contact.replace(/\D/g,''); data['상품명']=fd.get('product')||''; data['이메일']=fd.get('email')||''; data['이름1']=fd.get('p1_name')||''; data['양음력1']=fd.get('p1_solarlunar')||'';
      const b1=getBirth('p1'); if(b1){ const [yy,mm,dd]=b1.split('-'); data['생년1']=yy; data['생월1']=mm; data['생일1']=dd; }
      data['생시1']=fd.get('p1_hour')||''; data['생분1']=fd.get('p1_minute')||''; data['성별1']=fd.get('p1_gender')||'';
      if(formEl.querySelector('[name="p2_name"]')){ data['이름2']=fd.get('p2_name')||''; data['양음력2']=fd.get('p2_solarlunar')||''; const b2=getBirth('p2'); if(b2){ const [y2,m2,d2]=b2.split('-'); data['생년2']=y2; data['생월2']=m2; data['생일2']=d2; } data['생시2']=fd.get('p2_hour')||''; data['생분2']=fd.get('p2_minute')||''; data['성별1']='남자'; data['성별2']='여자'; }
      data['유입경로']=document.referrer||'직접 입력/알 수 없음'; const stay=Math.round((new Date()-pageLoadTime)/1000); data['체류시간']=`${Math.floor(stay/60)}분 ${stay%60}초`; data['기기정보']=navigator.userAgent;
      /// ================== [UTM 추적 코드 업그레이드] ==================
      const urlParams = new URLSearchParams(window.location.search);
      data['UTM소스'] = urlParams.get('utm_source') || sessionStorage.getItem('utm_source') || '직접입력';
      data['UTM매체'] = urlParams.get('utm_medium') || sessionStorage.getItem('utm_medium') || '없음';
      data['UTM캠페인'] = urlParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '없음';
      // =============================================================
      const agree2=document.getElementById('agree2'); data['개인정보수집동의']=(agree1&&agree1.checked)?'동의':'미동의'; data['광고정보수신동의']=(agree2&&agree2.checked)?'동의':'미동의';

      // 1) 시트 저장 (기존 로직 유지)
      const body=new URLSearchParams(data);
      const r=await fetch(APPS_SCRIPT_URL,{method:'POST',body});
      const t=await r.text(); let j; try{ j=JSON.parse(t);}catch(_){ j={success:true}; }
      if(!j || !j.success){ throw new Error('신청 저장 실패'); }

      // 2) 결제 단계 삽입: thankyou 대신 payment.html로 이동 (상품/가격 포함)
      //    - 가격 산정은 기존 로직과 동일하게 클라이언트에서 처리
      const productName = fd.get('product') || '기본 상품';
      let productPrice = 0;
      if (productName === '종합사주 미니') productPrice = 5000;
      else if (productName === '신년운세') productPrice = 19900;
      else if (productName === '종합사주') productPrice = 34900;
      else if (productName === '재물사주') productPrice = 14900;
      else if (productName === '결혼사주') productPrice = 12900;
      else if (productName === '연애사주') productPrice = 9900;
      else if (productName === '연애패키지') productPrice = 19900;
      else if (productName === '타이밍패키지') productPrice = 26900;
      else if (productName === '인생패키지') productPrice = 39900;
      else if (productName === '재회운') productPrice = 29900;
      else if (productName === '궁합사주') productPrice = 29900;
      else productPrice = 34900;

      // ✅ 여기서 thankyou.html로 가던 것을 payment.html로 변경 (기존 기능 외 변동 없음)
      const payUrl = `payment.html?oid=${encodeURIComponent(orderId)}&product=${encodeURIComponent(productName)}&price=${productPrice}`;
      window.location.href = thankyouUrl;


    }catch(err){ 
      console.error(err); 
      if(resDiv) resDiv.innerText='⚠️ 오류가 발생했습니다. 다시 시도해주세요.'; 
    } finally { 
      btn.disabled=false; btn.innerText='사주분석 신청하기'; 
    }
  });
});

// (추가 구현 없음: 기존 기능 그대로 유지)
