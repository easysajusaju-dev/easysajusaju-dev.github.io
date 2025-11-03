/* ===== 본사 시트 저장 + 결제창 이동 확정 버전 ===== */

const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";

function populateDateSelects(prefix){
  const y=document.querySelector(`select[name="${prefix}_birth_year"]`);
  const m=document.querySelector(`select[name="${prefix}_birth_month"]`);
  const d=document.querySelector(`select[name="${prefix}_birth_day"]`);
  if(!y||!m||!d) return;
  if(y.options.length<10){
    const cy=new Date().getFullYear();
    for(let i=cy;i>=1930;i--) y.add(new Option(i+"년",i));
    for(let i=1;i<=12;i++) m.add(new Option(i+"월",i));
    for(let i=1;i<=31;i++) d.add(new Option(i+"일",i));
  }
}

function setupHourMinuteSync(person){
  const h=document.querySelector(`select[name="${person}_hour"]`);
  const mm=document.querySelector(`select[name="${person}_minute"]`);
  if(!h||!mm) return;
  if(mm.options.length<10){
    for(let i=0;i<=23;i++) h.add(new Option(i+"시",i));
    for(let i=0;i<=59;i++) mm.add(new Option(i+"분",i));
  }
  h.addEventListener("change",()=>{
    if(h.value===""){mm.value="";mm.disabled=true;} else mm.disabled=false;
  });
  if(h.value==="") mm.disabled=true;
}

function setupAgreement(){
  const agree1=document.getElementById("agree1");
  const agree2=document.getElementById("agree2");
  const agreeAll=document.getElementById("agree_all");
  function update(){
    const list=[agree1,agree2];
    const c=list.filter(cb=>cb&&cb.checked).length;
    agreeAll.checked=c===list.length;
    agreeAll.indeterminate=c>0&&c<list.length;
  }
  agreeAll?.addEventListener("change",()=>{
    [agree1,agree2].forEach(cb=>cb&&(cb.checked=agreeAll.checked));
    update();
  });
  [agree1,agree2].forEach(cb=>cb&&cb.addEventListener("change",update));
  update();
}

function setupImageJump(){
  const imgs=document.querySelectorAll(".image-section img");
  const form=document.getElementById("saju-form");
  imgs.forEach(img=>img.onclick=()=>{
    const top=form.getBoundingClientRect().top+window.scrollY-180;
    window.scrollTo({top,behavior:"smooth"});
  });
}

const PRICE_TABLE={
  "종합사주 미니":5000,"신년운세":19900,"종합사주":34900,"재물사주":14900,
  "결혼사주":12900,"연애사주":9900,"연애패키지":19900,"타이밍패키지":26900,
  "인생패키지":39900,"재회운":29900,"궁합사주":29900
};

document.addEventListener("DOMContentLoaded",()=>{
  populateDateSelects("p1"); populateDateSelects("p2");
  setupHourMinuteSync("p1"); setupHourMinuteSync("p2");
  setupAgreement(); setupImageJump();

  const form=document.getElementById("saju-form");
  if(!form) return;

  form.addEventListener("submit",async e=>{
    e.preventDefault();

    if(!document.getElementById("agree1")?.checked){
      alert("개인정보 수집/이용에 동의해야 합니다.");
      return;
    }

    const btn=form.querySelector("button");
    btn.disabled=true; btn.innerText="신청 중...";

    const fd=new FormData(form), data={};
    const orderId="EZ"+Date.now();
    data["오더ID"]=orderId;

    // ✅ 전화번호 정규화 (따옴표 제거)
    let phone = fd.get("contact") ||
      (fd.get("contact1")||"")+(fd.get("contact2")||"")+(fd.get("contact3")||"");
    phone = phone.replace(/\D/g,"");
    data["연락처"]=phone; // <- 따옴표 ❌ (시트 숫자로 저장됨)

    // ✅ 상품 데이터
    const productName=fd.get("product")||"";
    data["상품명"]=productName;
    data["이메일"]=fd.get("email")||"";
    data["이름1"]=fd.get("p1_name")||"";
    data["양음력1"]=fd.get("p1_solarlunar")||"";

    function spl(prefix){
      const y=fd.get(prefix+"_birth_year");
      const m=fd.get(prefix+"_birth_month");
      const d=fd.get(prefix+"_birth_day");
      return y&&m&&d?[y,m.padStart(2,"0"),d.padStart(2,"0")]:null;
    }
    const dob1=spl("p1");
    if(dob1){data["생년1"]=dob1[0];data["생월1"]=dob1[1];data["생일1"]=dob1[2];}
    data["생시1"]=fd.get("p1_hour")||""; data["생분1"]=fd.get("p1_minute")||"";
    data["성별1"]=fd.get("p1_gender")||"";

    if(form.querySelector('[name="p2_name"]')){
      data["이름2"]=fd.get("p2_name")||"";
      data["양음력2"]=fd.get("p2_solarlunar")||"";
      const dob2=spl("p2");
      if(dob2){data["생년2"]=dob2[0];data["생월2"]=dob2[1];data["생일2"]=dob2[2];}
      data["생시2"]=fd.get("p2_hour")||""; data["생분2"]=fd.get("p2_minute")||"";
      data["성별2"]="여자";
    }

    // ✅ UTM + 시스템 정보
    const urlp=new URLSearchParams(location.search);
    data["유입경로"]=document.referrer||"직접 입력";
    data["체류시간"]=Math.round((new Date()-pageLoadTime)/1000)+"초";
    data["기기정보"]=navigator.userAgent;
    data["UTM소스"]=urlp.get("utm_source")||sessionStorage.getItem("utm_source")||"직접입력";
    data["UTM매체"]=urlp.get("utm_medium")||sessionStorage.getItem("utm_medium")||"없음";
    data["UTM캠페인"]=urlp.get("utm_campaign")||sessionStorage.getItem("utm_campaign")||"없음";
    data["개인정보수집동의"]="동의";
    data["광고정보수신동의"]=document.getElementById("agree2")?.checked?"동의":"미동의";

    // ✅ 시트 저장
    await fetch(APPS_SCRIPT_URL,{
      method:"POST",
      body:new URLSearchParams(data)
    });

    // ✅ 저장 후 바로 결제 페이지 이동
    const price=PRICE_TABLE[productName]||34900;
    location.href=`payment.html?oid=${orderId}&product=${productName}&price=${price}`;
  });
});
