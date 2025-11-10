const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
  // build nav
  const list = document.getElementById("links");
  if (list) {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = "../driver.html?id=" + USER_ID + "&org=" + ORG_ID;
    link.textContent = "Dashboard";
    li.appendChild(link);

    const store = document.createElement("a");
    store.href =
      "../../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
    store.textContent = "Store";
    li.appendChild(store);

    const cart = document.createElement("a");
    cart.href =
      "../../DriverCart/DriverCart.html?id=" + USER_ID + "&org=" + ORG_ID;
    cart.textContent = "Cart";
    li.appendChild(cart);
    list.appendChild(li);
  }

  loadOrders();
};

async function loadOrders() {
  const container = document.getElementById("orders");
  if (!container) return;

  container.textContent = "Loading orders...";

  try {
    const resp = await fetch(
      "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/orders?id=" +
        USER_ID,
      { method: "GET" }
    );
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(txt || `Failed to load orders (${resp.status})`);
    }
    let orders = await resp.json();

    if (!Array.isArray(orders)) orders = [];

    // sort most-recent-first by date if available, else by ord_id desc
    orders.sort((a, b) => {
      const da = orderDate(a);
      const db = orderDate(b);
      if (da && db) return db - da;
      const ida = Number(a.ord_id);
      const idb = Number(b.ord_id);
      return idb - ida;
    });

    renderOrders(orders);
  } catch (e) {
    console.error("Orders load error:", e);
    container.textContent = "Failed to load orders.";
    alert(e.message || "Failed to load orders.");
  }
}

function orderDate(order) {
  const raw = order.ord_confirmeddate;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function parseItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function renderOrders(orders) {
  const container = document.getElementById("orders");
  container.innerHTML = "";

  if (!orders.length) {
    const p = document.createElement("p");
    p.textContent = "No orders yet.";
    container.appendChild(p);
    return;
  }

  orders.forEach((order) => {
    const card = document.createElement("div");
    card.className = "order-card";

    const header = document.createElement("div");
    header.className = "order-header";

    const title = document.createElement("h3");
    const ordId = order.ord_id ?? order.id ?? "";
    title.textContent = `Order #${ordId}`;

    const meta = document.createElement("div");
    meta.className = "order-meta";
    const status = String(order.ord_status);
    const d = orderDate(order);
    const dateStr = d ? d.toLocaleString() : "";
    meta.textContent = `${status}${dateStr ? " • " + dateStr : ""}`;

    header.appendChild(title);
    header.appendChild(meta);

    const list = document.createElement("ul");
    list.className = "order-items";

    const items = parseItems(order.items);
    let totalPts = 0;
    let totalUsd = 0;

    items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "order-item";
      const name = it.itm_name;
      const pts = Number(it.itm_pointcost);
      const usd = Number(it.itm_usdcost);
      totalPts += pts;
      totalUsd += usd;
      li.textContent = `${name} — ${pts ? pts + " pts" : ""}${
        pts && usd ? " / " : ""
      }${usd ? "$" + usd.toFixed(2) : ""}`;
      list.appendChild(li);
    });

    const footer = document.createElement("div");
    footer.className = "order-footer";
    const totals = document.createElement("div");
    totals.className = "order-totals";
    const totalsParts = [];
    if (totalPts) totalsParts.push(`${totalPts} pts`);
    if (totalUsd) totalsParts.push(`$${totalUsd.toFixed(2)}`);
    totals.textContent = totalsParts.length
      ? `Total: ${totalsParts.join(" / ")}`
      : "";

    footer.appendChild(totals);

    card.appendChild(header);
    card.appendChild(list);
    card.appendChild(footer);

    container.appendChild(card);
  });
}
