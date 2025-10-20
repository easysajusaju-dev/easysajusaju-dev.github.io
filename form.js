// === SAFE form.js (복구 + 결제DB 연동) ===
const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";
const PAY_API = "https://script.google.com/macros/s/AKfycbyaQ08k3mkmDyMhehI8TeT60PeW2O9nmAncBJB_7wvcmRHQRbOUf_lz1b8xHXknQUE8kA/exec";

// 공통 유틸
function populateDateSelects(prefix){
  const y = document.querySelector(`select[name="${prefix}_birth_year"]`);
  const m = document.querySelector(`select[name="${prefix}_birth_month"]`);
  const d = document.querySelector(`select[name="${prefix}_birth_day"]`);
  if(!y||!m||!d) return;
  const cy = new Date().getFullYear();
  for(let i=cy;i>=1930;i--) y.add(new Option(i+'년', i));
  for(let i=1;i<=12;i++) m.add(new Option(i+'월', i));
  for(let i=1;i<=31;i++) d.add(new Option(i+'일', i));
}
function setupHourMinuteSync(person){
  const h = document.querySelector(`select[name="${person}_hour"]`);
  const mm= document.querySelector(`select[name="${person}_minute"]`);
  if(!h||!mm) return;
  h.addEventListener('change', ()=>{ if(h.value===""){ mm.value=""; mm.disabled=true; } else mm.disabled=false;});
  if(h.value==="") mm.disabled=true;
}
function setupAgreement(){
  const agreeAll=document.getElementById('agree_all');
  const agree1=document.getElementById('agree1');
  const agree2=document.getElementById('agree2');
  if(!agreeAll) return;
  const items=[agree1,agree2].filter(Boolean);
  function upd(){ if(!items.length) return; const c=items.filter(cb=>cb.checked).length; agreeAll.checked=c===items.length; agreeAll.indeterminate=c>0&&c<items.length;}
  agreeAll.addEventListener('change',()=>{items.forEach(cb=>cb.checked=agreeAll.checked); upd();});
  items.forEach(cb=>cb.addEventListener('change',upd)); upd();
  document.querySelectorAll('.toggle-text').forEach(t=>{
    if(t.tagName==='BUTTON'&&!t.getAttribute('type')) t.setAttribute('type','button');
    t.addEventListener('click',()=>{ const box=t.closest('.agree-box'); if(!box) return; const tb=box.querySelector('.terms-box'); if(tb) tb.style.display=tb.style.display==='block'?'none':'block';});
  });
}
function setupImageJump(){
  const imgs=document.querySelectorAll('.image-section img');
  const formEl=document.getElementById('saju-form');
  function scrollToForm(){
    if(!formEl) return;
    const top=formEl.getBoundingClientRect().top+window.scrollY-180;
    window.scrollTo({top,behavior:'smooth'});
    setTimeout(()=>{ const fi=formEl.querySelector('input,select,textarea'); if(fi) fi.focus();},800);
  }
  imgs.forEach(img=>{ img.style.cursor='pointer'; img.addEventListener('click',(e)=>{e.preventDefault(); scrollToForm();});});
  const headerBtn=document.querySelector('.header-button');
  if(headerBtn) headerBtn.addEventListener('click',(e)=>{e.preventDefault(); scrollToForm();});
}

document.addEventListener('DOMContentLoaded', ()=> {
  try{
    populateDateSelects('p1'); populateDateSelects('p2');
    setupHourMinuteSync('p1'); setupHourMinuteSync('p2');
    setupAgreement(); setupImageJump();
  }catch(e){ console.error('init error', e); }

  const formEl=document.getElementById('saju-form');
  if(!formEl) return;

  formEl.addEventListener('submit', async (event)=>{
    event.preventDefault();
    const agree1=document.getElementById('agree1');
    if(agree1 && !agree1.checked){ alert('개인정보 수집/이용에 동의하셔야 신청이 가능합니다.'); return; }

    const btn=formEl.querySelector('button'); const resDiv=document.getElementById('result');
    btn.disabled=true; btn.innerText='신청하는 중...'; if(resDiv) resDiv.innerText='';

    try{
      const fd=new FormData(formEl);
      const data={};
      function getBirth(prefix){
        const y=fd.get(`${prefix}_birth_year`), m=fd.get(`${prefix}_birth_month`), d=fd.get(`${prefix}_birth_day`);
        return (y&&m&&d)? `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` : '';
      }
      let contact='';
      if(fd.get('contact')) contact=fd.get('contact')||'';
      else contact=(fd.get('contact1')||'')+(fd.get('contact2')||'')+(fd.get('contact3')||'');
      data['연락처']="'"+contact.replace(/\D/g,'');
      data['상품명']=fd.get('product'); data['이메일']=fd.get('email'); data['이름1']=fd.get('p1_name'); data['양음력1']=fd.get('p1_solarlunar');
      const b1=getBirth('p1'); if(b1){ const [yy,mm,dd]=b1.split('-'); data['생년1']=yy; data['생월1']=mm; data['생일1']=dd; }
      data['생시1']=fd.get('p1_hour'); data['생분1']=fd.get('p1_minute'); data['성별1']=fd.get('p1_gender');
      if(formEl.querySelector('[name="p2_name"]')){
        data['이름2']=fd.get('p2_name'); data['양음력2']=fd.get('p2_solarlunar');
        const b2=getBirth('p2'); if(b2){ const [y2,m2,d2]=b2.split('-'); data['생년2']=y2; data['생월2']=m2; data['생일2']=d2; }
        data['생시2']=fd.get('p2_hour'); data['생분2']=fd.get('p2_minute'); data['성별1']='남자'; data['성별2']='여자';
      }
      data['유입경로']=document.referrer||'직접 입력/알 수 없음';
      const stay=Math.round((new Date()-pageLoadTime)/1000); data['체류시간']=`${Math.floor(stay/60)}분 ${stay%60}초`;
      data['기기정보']=navigator.userAgent;
      const agree2=document.getElementById('agree2');
      data['개인정보수집동의']=agree1 && agree1.checked ? '동의':'미동의';
      data['광고정보수신동의']=agree2 && agree2.checked ? '동의':'미동의';

      // 1) 시트 저장
      const body=new URLSearchParams(data);
      const r=await fetch(APPS_SCRIPT_URL,{method:'POST',body});
      const j=await r.json();
      if(!j || !j.success){ throw new Error('신청 저장 실패'); }

      // 2) 결제DB /create (실패해도 thankyou 이동)
      const orderId='EZ'+Date.now();
      const product=(document.getElementById('product')||{}).value||'';
      const name=fd.get('p1_name')||'';
      const phone=(fd.get('contact')||'').replace(/\D/g,'');
      try{
        const r2=await fetch(`${PAY_API}?action=create&orderId=${encodeURIComponent(orderId)}&product=${encodeURIComponent(product)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
        // 결과는 사용 안 함 — 실패해도 종료 플로우 진행
      }catch(_){}

      window.location.href='thankyou.html?oid='+encodeURIComponent(orderId)+'&paid=0';
    }catch(err){
      console.error(err);
      if(resDiv) resDiv.innerText='⚠️ 오류가 발생했습니다. 다시 시도해주세요.';
    }finally{
      btn.disabled=false; btn.innerText='사주분석 신청하기';
    }
  });
});
