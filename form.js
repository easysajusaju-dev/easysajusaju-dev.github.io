// form.js — 최종 통합본 (신청 저장 + 결제 API 호출)

const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhi4556hgBKctN3KVBlPdkl1vFD3oG7Wv7Hdm6pk16VGG8OF6q6EaPT8t_5WTX87Jb/exec";
// ★★★ PAY_API 주소는 비워두거나, 나중에 PG 연동 시 real URL로 교체
const PAY_API = "PLACEHOLDER_FOR_PAYMENT_API"; 

function populateDateSelects(prefix){ /* ... 기존 코드 유지 ... */ }
function setupHourMinuteSync(person){ /* ... 기존 코드 유지 ... */ }
function setupAgreement(){ /* ... 기존 코드 유지 ... */ }
function setupImageJump(){ /* ... 기존 코드 유지 ... */ }

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
      data['오더ID']=orderId; // 로그 저장용 오더ID 생성

      function getBirth(prefix){ /* ... 기존 getBirth 유지 ... */ }
      let contact=''; if(fd.get('contact')) contact=fd.get('contact')||''; else contact=(fd.get('contact1')||'')+(fd.get('contact2')||'')+(fd.get('contact3')||'');
      data['연락처']="'"+contact.replace(/\D/g,''); data['상품명']=fd.get('product')||''; data['이메일']=fd.get('email')||''; data['이름1']=fd.get('p1_name')||''; data['양음력1']=fd.get('p1_solarlunar')||'';
      const b1=getBirth('p1'); if(b1){ const [yy,mm,dd]=b1.split('-'); data['생년1']=yy; data['생월1']=mm; data['생일1']=dd; }
      data['생시1']=fd.get('p1_hour')||''; data['생분1']=fd.get('p1_minute')||''; data['성별1']=fd.get('p1_gender')||'';
      if(formEl.querySelector('[name="p2_name"]')){ data['이름2']=fd.get('p2_name')||''; data['양음력2']=fd.get('p2_solarlunar')||''; const b2=getBirth('p2'); if(b2){ const [y2,m2,d2]=b2.split('-'); data['생년2']=y2; data['생월2']=m2; data['생일2']=d2; } data['생시2']=fd.get('p2_hour')||''; data['생분2']=fd.get('p2_minute')||''; data['성별1']='남자'; data['성별2']='여자'; }
      data['유입경로']=document.referrer||'직접 입력/알 수 없음'; const stay=Math.round((new Date()-pageLoadTime)/1000); data['체류시간']=`${Math.floor(stay/60)}분 ${stay%60}초`; data['기기정보']=navigator.userAgent;
      const agree2=document.getElementById('agree2'); data['개인정보수집동의']=(agree1&&agree1.checked)?'동의':'미동의'; data['광고정보수신동의']=(agree2&&agree2.checked)?'동의':'미동의';

      // 1) 신청 저장 (기존 로직 유지)
      const body=new URLSearchParams(data);
      const r=await fetch(APPS_SCRIPT_URL,{method:'POST',body});
      const t=await r.text(); let j; try{ j=JSON.parse(t);}catch(_){ j={success:true}; }
      if(!j || !j.success){ throw new Error('신청 저장 실패'); }

      // 2) 결제DB 생성 (PAY_API 사용)
      const sel=document.getElementById('product') || document.querySelector('select[name="product"]');
      const product = (sel && String(sel.value).trim()) ? sel.value : '종합사주';
      const name = fd.get('p1_name')||'';
      const phone=(fd.get('contact')||'').replace(/\D/g,'');
      
      try{ 
        await fetch(`${PAY_API}?action=create&orderId=${encodeURIComponent(orderId)}&product=${encodeURIComponent(product)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`); 
      }catch(_){}

      window.location.href='thankyou.html?oid='+encodeURIComponent(orderId);
    }catch(err){ console.error(err); if(resDiv) resDiv.innerText='⚠️ 오류가 발생했습니다. 다시 시도해주세요.'; }
    finally{ btn.disabled=false; btn.innerText='사주분석 신청하기'; }
  });
});
