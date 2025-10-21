// form.js (결제 생성 후 thankyou 이동 및 오더ID 전달 보강)
// ... (상단 함수들 및 정의는 동일) ...

  document.getElementById('saju-form').addEventListener('submit', async (event)=>{
    event.preventDefault();
    const agree1=document.getElementById('agree1'); 
    if(agree1 && !agree1.checked){ alert('개인정보 수집/이용에 동의하셔야 신청이 가능합니다.'); return; }

    const btn=formEl.querySelector('button'); const resDiv=document.getElementById('result');
    btn.disabled=true; btn.innerText='신청하는 중...'; if(resDiv) resDiv.innerText='';

    try{
      const fd=new FormData(formEl), data={};
      const orderId='EZ'+Date.now(); 
      data['오더ID']=orderId; // L열 기록용

      function getBirth(prefix){ /* ... 기존 getBirth 유지 ... */ }
      let contact=''; if(fd.get('contact')) contact=fd.get('contact')||''; else contact=(fd.get('contact1')||'')+(fd.get('contact2')||'')+(fd.get('contact3')||'');
      data['연락처']="'"+contact.replace(/\D/g,''); data['상품명']=fd.get('product')||''; data['이메일']=fd.get('email')||''; data['이름1']=fd.get('p1_name')||''; data['양음력1']=fd.get('p1_solarlunar')||'';
      const b1=getBirth('p1'); if(b1){ const [yy,mm,dd]=b1.split('-'); data['생년1']=yy; data['생월1']=mm; data['생일1']=dd; }
      data['생시1']=fd.get('p1_hour')||''; data['생분1']=fd.get('p1_minute')||''; data['성별1']=fd.get('p1_gender')||'';
      if(formEl.querySelector('[name="p2_name"]')){ data['이름2']=fd.get('p2_name')||''; data['양음력2']=fd.get('p2_solarlunar')||''; const b2=getBirth('p2'); if(b2){ const [y2,m2,d2]=b2.split('-'); data['생년2']=y2; data['생월2']=m2; data['생일2']=d2; } data['생시2']=fd.get('p2_hour')||''; data['생분2']=fd.get('p2_minute')||''; data['성별1']='남자'; data['성별2']='여자'; }
      data['유입경로']=document.referrer||'직접 입력/알 수 없음'; const stay=Math.round((new Date()-pageLoadTime)/1000); data['체류시간']=`${Math.floor(stay/60)}분 ${stay%60}초`; data['기기정보']=navigator.userAgent;
      const agree2=document.getElementById('agree2'); data['개인정보수집동의']=(agree1&&agree1.checked)?'동의':'미동의'; data['광고정보수신동의']=(agree2&&agree2.checked)?'동의':'미동의';

      // 1) 시트 저장 (기존 로직 유지)
      const body=new URLSearchParams(data);
      const r=await fetch(APPS_SCRIPT_URL,{method:'POST',body});
      const t=await r.text(); let j; try{ j=JSON.parse(t);}catch(_){ j={success:true}; }
      if(!j || !j.success){ throw new Error('신청 저장 실패'); }

      // 2) 결제 생성 호출 (PAY_API 사용)
      const sel=document.getElementById('product') || document.querySelector('select[name="product"]');
      const product = (sel && String(sel.value).trim()) ? sel.value : '종합사주';
      const name = fd.get('p1_name')||'';
      const phone=(fd.get('contact')||'').replace(/\D/g,'');
      
      let payResult = {success: false, redirectUrl: 'thankyou.html?paid=0'};
      try{
        const r2=await fetch(`${PAY_API}?action=create&orderId=${encodeURIComponent(orderId)}&product=${encodeURIComponent(product)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
        const t2=await r2.text();
        payResult = JSON.parse(t2);
      }catch(_){
        console.error("결제 생성 API 호출 실패");
      }

      // 3) 결과에 따라 이동 (결제 생성 성공 시 payResult.redirectUrl로)
      if (payResult.success && payResult.redirectUrl) {
          window.location.href = payResult.redirectUrl;
      } else {
          window.location.href = 'thankyou.html?oid=' + encodeURIComponent(orderId) + '&paid=0';
      }

    }catch(err){ 
      console.error(err); 
      if(resDiv) resDiv.innerText='⚠️ 오류가 발생했습니다. 다시 시도해주세요.'; 
    }finally{ 
      btn.disabled=false; btn.innerText='사주분석 신청하기'; 
    }
  });
});
