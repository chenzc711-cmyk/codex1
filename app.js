const DB_KEY = "tmall_inventory_db_v1";
const db = JSON.parse(localStorage.getItem(DB_KEY) || '{"products":[],"records":[]}');

const save = () => localStorage.setItem(DB_KEY, JSON.stringify(db));
const money = (n) => Number(n).toFixed(2);

function renderStats() {
  const totalProducts = db.products.length;
  const totalStock = db.products.reduce((s, p) => s + p.stock, 0);
  const totalValue = db.products.reduce((s, p) => s + p.stock * (p.cost + p.packCost), 0);
  const inCount = db.records.filter(r => r.type === "in").reduce((s, r) => s + r.qty, 0);
  const outCount = db.records.filter(r => r.type === "out").reduce((s, r) => s + r.qty, 0);

  document.getElementById("stats").innerHTML = [
    ["商品数量", totalProducts],
    ["在库总件数", totalStock],
    ["库存总成本(含打包)", `¥${money(totalValue)}`],
    ["累计入库", inCount],
    ["累计出库", outCount],
  ].map(([label, value]) => `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`).join("");
}

function renderProducts() {
  const rows = db.products.map(p => `<tr>
    <td>${p.name}</td><td>${p.spec}</td><td>¥${money(p.cost)}</td><td>¥${money(p.packCost)}</td><td>${p.stock}</td>
  </tr>`).join("");
  document.getElementById("productTable").innerHTML = `<table>
    <thead><tr><th>商品名称</th><th>商品规格</th><th>商品成本</th><th>打包成本</th><th>在库数量</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" class="small">暂无商品</td></tr>'}</tbody>
  </table>`;

  document.getElementById("productSelect").innerHTML = db.products.length
    ? db.products.map(p => `<option value="${p.id}">${p.name} / ${p.spec}</option>`).join("")
    : '<option value="">请先添加商品</option>';
}

function renderRecords() {
  const rows = [...db.records].reverse().slice(0, 100).map(r => {
    const p = db.products.find(x => x.id === r.productId);
    return `<tr><td>${new Date(r.ts).toLocaleString()}</td><td>${p ? `${p.name} / ${p.spec}` : '已删除商品'}</td><td class="tag-${r.type}">${r.type==='in'?'入库':'出库'}</td><td>${r.qty}</td><td>${r.remark || '-'}</td></tr>`;
  }).join("");
  document.getElementById("recordTable").innerHTML = `<table>
    <thead><tr><th>时间</th><th>商品</th><th>类型</th><th>数量</th><th>备注</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5" class="small">暂无记录</td></tr>'}</tbody>
  </table>`;
}

function addProduct(name, spec, cost, packCost, stock) {
  db.products.push({ id: crypto.randomUUID(), name, spec, cost: +cost, packCost: +packCost, stock: +stock });
}

document.getElementById("productForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  addProduct(f.get("name"), f.get("spec"), f.get("cost"), f.get("packCost"), f.get("stock"));
  e.target.reset();
  save(); refresh();
});

document.getElementById("batchAddBtn").addEventListener("click", () => {
  const text = document.getElementById("batchInput").value.trim();
  if (!text) return;
  text.split(/\n+/).forEach(line => {
    const [name, spec, cost, packCost, stock] = line.split(",").map(s => s?.trim());
    if (name && spec && cost && packCost && stock) addProduct(name, spec, cost, packCost, stock);
  });
  document.getElementById("batchInput").value = "";
  save(); refresh();
});

document.getElementById("csvFile").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  document.getElementById("batchInput").value = text;
});

document.getElementById("stockForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const productId = f.get("productId");
  const type = f.get("type");
  const qty = +f.get("qty");
  const remark = f.get("remark");
  const p = db.products.find(x => x.id === productId);
  if (!p) return alert("未找到商品");
  if (type === "out" && p.stock < qty) return alert("出库数量不能超过在库数量");
  p.stock += type === "in" ? qty : -qty;
  db.records.push({ productId, type, qty, remark, ts: Date.now() });
  e.target.reset();
  save(); refresh();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], {type: "application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tmall_inventory_export.json";
  a.click();
});

function refresh(){ renderStats(); renderProducts(); renderRecords(); }
refresh();
