const pageLoadTime = new Date();
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_SRAMhhOT396196sgEzHeDMNk_oF7IL-M5BpAReKum04hVtkVYw0AwY71P4SyEdm-/exec";
const API_BASE = "https://my-payment-server.vercel.app";

// 시트 기반 상품 가격
const PRODUCT_PRICE_MAP = {
  p001: 5000, p002: 34900, p003: 29900, p004: 29900,
  p005: 12900, p006: 14900, p007: 9900,  p008: 19900,
  p009: 26900, p010: 39900, p011: 19900, p012: 19900
};

function fillDate(el, start, end) { for (let i=start;i>=end;i--) el.add(new Option(i,i)); }

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[name$='_birth_year']").forEach(el => fillDate(el,new Date().getFullYear(),1930));
  document.querySelectorAll("[name$='_birth_month']").forEach(el =>{for(let i=1;i<=12;i++)el.add(new Option(i,i));});
  document.querySelectorAll("[name$='_birth_day']").forEach(el =>{for(let i=1;i<=31;i++)el.add(new Option(i,i));});
  document.querySelectorAll("[name$='_hour']").forEach(el =>{for(let i=0;i<24;i++)el.add(new Option(i,i));});
  document.querySelectorAll("[name$='_minute']").forEach(el =>{for(let i=0;i<60;i++)el.add(new Option(i,i));});
});

document.getElementById("saju-form").addEventListener("submit", async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {};
  const orderId = "EZ"+Date.now();
  data["오더ID"] = orderId;
  data["연락처"] = "'" + (fd.get("contact")||"").replace(/\D/g,"");

  const productId = fd.get("product");
  const productName = document.querySelector("#product option:checked").textContent.split("(")[0];
  data["상품ID"] = productId;
  data["상품명"] = productName;

  ["p1","p2"].forEach(p=>{
    const birth = `${fd.get(`${p}_birth_year`)}-${fd.get(`${p}_birth_month`)}-${fd.get(`${p}_birth_day`)}`;
    data[p==="p1"?"이름1":"이름2"] = fd.get(`${p}_name`);
    data[p==="p1"?"생년1":"생년2"] = fd.get(`${p}_birth_year`);
    data[p==="p1"?"생월1":"생월2"] = fd.get(`${p}_birth_month`);
    data[p==="p1"?"생일1":"생일2"] = fd.get(`${p}_birth_day`);
    data[p==="p1"?"성별1":"성별2"] = fd.get(`${p}_gender`);
    data[p==="p1"?"양음력1":"양음력2"] = fd.get(`${p}_solarlunar`);
    data[p==="p1"?"생시1":"생시2"] = fd.get(`${p}_hour`);
    data[p==="p1"?"생분1":"생분2"] = fd.get(`${p}_minute`);
  });

  data["이메일"] = fd.get("email")||"";
  data["개인정보수집동의"] = "동의";

  const body = new URLSearchParams(data);
  await fetch(APPS_SCRIPT_URL,{method:"POST",body});

  const price = PRODUCT_PRICE_MAP[productId] ?? 0;

  location.href = `thankyou.html?oid=${orderId}&product=${productName}&price=${price}`;
});
