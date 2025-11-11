const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

// For pagination
let ORDERS_CACHE = [];
let ORDERS_CURRENT_PAGE = 1;
const ORDERS_PER_PAGE = 10;


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

  attachOrderControls();

  const sel = document.getElementById("orders_sort");
  loadOrders({ sort: sel ? sel.value : "date_desc" });
};

function attachOrderControls() {
  const container = document.getElementById("orders");
  if (!container || !container.parentNode) return;

  // Avoid duplicating controls if this runs twice
  if (document.getElementById("orders_sort")) return;

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "12px";
  controls.style.alignItems = "center";
  controls.style.margin = "8px 0 12px";

  const sortSelect = document.createElement("select");
  sortSelect.id = "orders_sort";
  sortSelect.innerHTML = `
    <option value="date_desc">Date (newest)</option>
    <option value="date_asc">Date (oldest)</option>
    <option value="id_desc">Order # (desc)</option>
    <option value="id_asc">Order # (asc)</option>
    <option value="pts_desc">Points (desc)</option>
    <option value="pts_asc">Points (asc)</option>
  `;
  sortSelect.value = "date_desc";

  controls.append(sortSelect);
  container.parentNode.insertBefore(controls, container);

  // Pagination
  let pag = document.getElementById("orders_pagination");
  if (!pag) {
    pag = document.createElement("div");
    pag.id = "orders_pagination";
    pag.style.display = "flex";
    pag.style.flexWrap = "wrap";
    pag.style.gap = "6px";
    pag.style.marginTop = "12px";
    pag.style.width = "100%";
    pag.style.justifyContent = "center";
    pag.style.alignItems = "center";
    pag.style.marginBottom = "8px";
    container.parentNode.appendChild(pag);
  }

  controls.addEventListener("change", () => {
    // Reset to page 1 when changing sort
    ORDERS_CURRENT_PAGE = 1;
    loadOrders({ sort: sortSelect.value });
  });
}

async function loadOrders({ sort = "date_desc" } = {}) {
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
    const num = (v) => Number(v ?? 0) || 0;

    // Precompute date + total points
    const withTotals = orders.map((o) => {
      const d = orderDate(o);
      const items = parseItems(o.items);
      let totalPts = 0;
      for (const it of items) {
        totalPts += num(it.itm_pointcost ?? it.point_cost);
      }
      return {
        raw: o,
        dateMs: d ? d.getTime() : 0,
        ordId: num(o.ord_id ?? o.id),
        totalPts,
      };
    });

    const comparators = {
      date_desc: (a, b) => b.dateMs - a.dateMs,
      date_asc: (a, b) => a.dateMs - b.dateMs,
      id_desc: (a, b) => b.ordId - a.ordId,
      id_asc: (a, b) => a.ordId - b.ordId,
      pts_desc: (a, b) => b.totalPts - a.totalPts,
      pts_asc: (a, b) => a.totalPts - b.totalPts,
    };
    withTotals.sort(comparators[sort] || comparators.date_desc);

    // Cache raw orders in sorted order
    ORDERS_CACHE = withTotals.map(x => x.raw);

    // Update header count
    const countEl = document.getElementById("order_count");
    if (countEl) countEl.textContent = withTotals.length;

    // Make sure current page is valid after re-sort / re-fetch
    const totalPages = ordersTotalPages();
    if (ORDERS_CURRENT_PAGE > totalPages) ORDERS_CURRENT_PAGE = totalPages || 1;

    // Render current page + pagination
    renderOrdersPage();
    renderOrdersPagination();
        
  } catch (e) {
    console.error("Orders load error:", e);
    container.textContent = "Failed to load orders.";
    alert(e.message || "Failed to load orders.");
  }
}

function ordersTotalPages() {
  return Math.max(1, Math.ceil(ORDERS_CACHE.length / ORDERS_PER_PAGE));
}

function getOrdersSliceForPage(page) {
  const p = Math.max(1, Math.min(page, ordersTotalPages()));
  const start = (p - 1) * ORDERS_PER_PAGE;
  const end = start + ORDERS_PER_PAGE;
  return ORDERS_CACHE.slice(start, end);
}

function renderOrdersPage() {
  const slice = getOrdersSliceForPage(ORDERS_CURRENT_PAGE);
  renderOrders(slice);
}

function renderOrdersPagination() {
  const pag = document.getElementById("orders_pagination");
  if (!pag) return;

  const totalPages = ordersTotalPages();
  pag.innerHTML = "";

  const makeButton = (label, page, disabled = false, isActive = false) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = "page-btn";
    button.dataset.page = String(page);
    button.disabled = !!disabled;
    if (isActive) button.classList.add("active");
    button.addEventListener("click", () => {
      const target = Number(button.dataset.page);
      if (target === ORDERS_CURRENT_PAGE) return;
      ORDERS_CURRENT_PAGE = target;
      renderOrdersPage();
      renderOrdersPagination();
    });
    return button;
  };

  // Prev
  pag.appendChild(
    makeButton("Previous", Math.max(1, ORDERS_CURRENT_PAGE - 1), ORDERS_CURRENT_PAGE === 1)
  );

  // Numbered pages
  for (let i = 1; i <= totalPages; i++) {
    pag.appendChild(makeButton(String(i), i, false, i === ORDERS_CURRENT_PAGE));
  }

  // Next
  pag.appendChild(
    makeButton("Next", Math.min(totalPages, ORDERS_CURRENT_PAGE + 1), ORDERS_CURRENT_PAGE === totalPages)
  );
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
      section.style.borderTop = "1px solid #ddd";
      section.style.borderLeft = "3px solid rgba(59,130,246,0.25)";
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
