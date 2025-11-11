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

    const countEl = document.getElementById("order_count");
    if (countEl) countEl.textContent = Array.isArray(orders) ? orders.length : 0;

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
    p.textContent = "You have not placed any orders yet.";
    container.appendChild(p);
    return;
  }

  orders.forEach((order, i) => {
    // derive fields
    const ordId = order.ord_id ?? order.id ?? "";
    const status = String(order.ord_status ?? order.status ?? "unknown");
    const d = orderDate(order);
    const dateStr = d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

    const items = parseItems(order.items);
    const itemCount = items.length;

    // allow multiple key shapes
    const num = (v) => Number(v ?? 0) || 0;    let totalPts = 0;
    let totalUsd = 0;
    items.forEach((it) => {
      totalPts += num(it.itm_pointcost ?? it.point_cost);
      totalUsd += num(it.itm_usdcost ?? it.usd_cost);
    });

    // row container
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "16px";
    row.style.padding = "16px";
    if (i < orders.length - 1) row.style.borderBottom = "1px solid #ddd";

    // left: icon
    const icon_div = document.createElement("span");
    icon_div.style.display = "inline-flex";
    icon_div.style.alignItems = "center";
    icon_div.style.justifyContent = "center";
    icon_div.style.width = "40px";
    icon_div.style.height = "40px";
    icon_div.style.borderRadius = "50%";
    icon_div.style.backgroundColor = "rgba(59, 130, 246, 0.10)";

    const icon = document.createElement("i");
    icon.className = "bx bx-shopping-bag-alt";
    icon.style.color = "#3B82F6";
    icon.style.fontSize = "28px";
    icon_div.appendChild(icon);

    // middle: title + order summary
    const middle = document.createElement("div");
    middle.style.display = "flex";
    middle.style.flexDirection = "column";
    middle.style.gap = "6px";
    const content = document.createElement("div");
    content.className = "reason-date";

    const pTitle = document.createElement("p");
    pTitle.textContent = `Order #${ordId} • ${status}`;
    pTitle.style.fontWeight = "500";
    pTitle.style.color = "black";
    content.appendChild(pTitle);

    const pSub = document.createElement("p");
    const parts = [];
    if (dateStr) parts.push(dateStr);
    if (itemCount) parts.push(`${itemCount} item${itemCount > 1 ? "s" : ""}`);
    if (totalPts) parts.push(`${totalPts} pts`);
    if (totalUsd) parts.push(`$${totalUsd.toFixed(2)}`);
    pSub.textContent = parts.join(" • ");
    pSub.style.color = "#6b7280";
    content.appendChild(pSub);

    middle.appendChild(content);

    // items list
    if (itemCount) {
      // wrap to add a label + divider without changing your UL
      const section = document.createElement("div");
      section.style.marginTop = "6px";
      section.style.paddingTop = "6px";
      section.style.borderTop = "1px solid #eee";              // thin divider
      section.style.borderLeft = "3px solid rgba(59,130,246,0.25)"; // subtle blue accent (optional)
      section.style.paddingLeft = "10px";

      // label row
      const label = document.createElement("div");
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "6px";
      label.style.marginBottom = "6px";

      const labelIcon = document.createElement("i");
      labelIcon.className = "bx bx-shopping-bag";
      labelIcon.style.fontSize = "16px";
      labelIcon.style.color = "#3B82F6";

      const labelText = document.createElement("span");
      labelText.textContent = "Items";
      labelText.style.fontSize = "12px";
      labelText.style.fontWeight = "600";
      labelText.style.letterSpacing = "0.02em";
      labelText.style.textTransform = "uppercase";
      labelText.style.color = "#3B82F6";

      label.appendChild(labelIcon);
      label.appendChild(labelText);
      section.appendChild(label);

      const ul = document.createElement("ul");
      ul.style.listStyle = "none";
      ul.style.margin = "0";
      ul.style.padding = "0";
      ul.style.color = "#6b7280";
      ul.style.fontSize = "14px";

      items.forEach((it) => {
        const name = String(it.itm_name ?? it.name ?? "").trim();
        const pts = num(it.itm_pointcost ?? it.point_cost);
        const usd = num(it.itm_usdcost ?? it.usd_cost);

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.gap = "8px";
        li.style.alignItems = "baseline";

        // left: item name
        const left = document.createElement("span");
        left.textContent = name || "Item";
        left.style.whiteSpace = "nowrap";
        left.style.overflow = "hidden";
        left.style.textOverflow = "ellipsis";
        left.style.maxWidth = "420px";
        li.appendChild(left);

        // right: item cost
        const right = document.createElement("span");
        const parts = [];
        if (pts) parts.push(`${pts} pts`);
        if (usd) parts.push(`$${usd.toFixed(2)}`);
        right.textContent = parts.join(" / ");
        li.appendChild(right);

        ul.appendChild(li);
      });

      section.appendChild(ul);
      middle.appendChild(section);
    }

    // right: amount
    const pAmount = document.createElement("h3");
    pAmount.className = "points-value";
    if (totalPts) {
      pAmount.textContent = `-${totalPts}`;
    } else if (totalUsd) {
      // fallback
      pAmount.textContent = `-$${totalUsd.toFixed(2)}`;
    } else {
      pAmount.textContent = "";
    }
    pAmount.style.color = "#3B82F6";
    pAmount.style.fontSize = "22px";

    // assemble
    row.appendChild(icon_div);
    row.appendChild(middle);
    row.appendChild(pAmount);
    container.appendChild(row);
  });
}
