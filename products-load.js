const API_BASE = "https://my-payment-server.vercel.app";

async function loadProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  const data = await res.json();
  const items = data.items.filter(it => it.category === "p_2"); // 2인용 필터

  const select = document.querySelector("#product");
  select.innerHTML = ""; 

  items.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.price.toLocaleString()}원)`;
    select.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", loadProducts);
