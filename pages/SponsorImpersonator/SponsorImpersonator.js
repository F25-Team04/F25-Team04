const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

const DRIVER_ENDPOINT =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?role=driver&org=" +
  encodeURIComponent(ORG_ID);

let DRIVER_CACHE = [];
let CURRENT_DRIVER_ID = null;

window.onload = function () {
  setupNavBar();
  attachFilterHandlers();
  attachCollapseHandler();
  attachIframeGuard();
  fetchDrivers();
};

// ============================================================
// NAVBAR BUILDER
// ============================================================
function setupNavBar() {
  const about = document.getElementById("about-page");
  if (about) {
    about.href = `../about/about.html?id=${USER_ID}&org=${ORG_ID}`;
  }

  const list = document.getElementById("links");
  const li = document.createElement("li");

  function add(path, text) {
    const a = document.createElement("a");
    a.href = `${path}?id=${USER_ID}&org=${ORG_ID}`;
    a.textContent = text;
    li.appendChild(a);
  }

  add("../SponsorHomepage/SponsorHome.html", "Dashboard");
  add("../SponsorCatalogView/SponsorCatalogView.html", "Catalog View");
  add(
    "../SponsorChangeConversionRate/ChangeConversionRate.html",
    "Change Point Conversion Rate"
  );
  add("../SponsorBulkLoad/SponsorBulkLoad.html", "Bulk Loader");
  add("../SponsorImpersonator/SponsorImpersonator.html", "Impersonation");
  add("../report_builder/report.html", "Report Builder");
  list.appendChild(li);
}

/* ------------------------------
   COLLAPSE LEFT PANEL
------------------------------ */
function attachCollapseHandler() {
  const grid = document.getElementById("imp-grid");
  const btn = document.getElementById("collapse-toggle");

  btn.addEventListener("click", () => {
    const collapsed = grid.classList.toggle("collapsed");
    btn.textContent = collapsed ? "»" : "«";
    btn.title = collapsed ? "Expand users panel" : "Collapse users panel";
  });
}

/* FILTER BAR */
function attachFilterHandlers() {
  const input = document.getElementById("user-filter-input");
  const field = document.getElementById("user-filter-field");

  input.addEventListener("input", applyFilters);
  field.addEventListener("change", applyFilters);
}

function applyFilters() {
  const term = document.getElementById("user-filter-input").value.toLowerCase();
  const field = document.getElementById("user-filter-field").value;

  if (!term.trim()) return buildUsersList(DRIVER_CACHE);

  const filtered = DRIVER_CACHE.filter((u) => matchesFilter(u, term, field));
  buildUsersList(filtered);
}

function matchesFilter(user, term, field) {
  const name = (
    (user["First Name"] || "") +
    " " +
    (user["Last Name"] || "")
  ).toLowerCase();
  const userId = (user["User ID"] || "").toString().toLowerCase();
  const email = (user["Email"] || "").toLowerCase();

  if (field === "name") return name.includes(term);
  if (field === "id") return userId.includes(term);
  if (field === "email") return email.includes(term);

  return name.includes(term) || userId.includes(term) || email.includes(term);
}

/* FETCHERS */
async function fetchDrivers() {
  const res = await fetch(DRIVER_ENDPOINT);
  DRIVER_CACHE = (await res.json()) || [];
  applyFilters();
}

/* BUILD LIST */
function buildUsersList(users) {
  const container = document.getElementById("users-list");
  container.innerHTML = "";

  if (!users.length) {
    container.textContent = "No drivers found.";
    return;
  }

  users.forEach((user) => {
    const userId = user["User ID"];
    const first = user["First Name"];
    const last = user["Last Name"];
    const email = user["Email"] || "(no email listed)";

    const card = document.createElement("button");
    card.className = "driver-card";

    const info = document.createElement("div");
    info.className = "driver-info";

    const icon = document.createElement("i");
    icon.className = "bxr bx-user driver-icon";

    const wrap = document.createElement("div");
    wrap.className = "driver-text";

    const nameEl = document.createElement("h3");
    nameEl.className = "driver-name";
    nameEl.textContent = `${first} ${last}`;

    const detail = document.createElement("p");
    detail.className = "driver-id";
    detail.textContent = `User ID: ${userId}, ${email}`;

    wrap.appendChild(nameEl);
    wrap.appendChild(detail);

    info.appendChild(icon);
    info.appendChild(wrap);

    card.appendChild(info);

    card.addEventListener("click", () => {
      document
        .querySelectorAll(".driver-card")
        .forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      openDriverInIframe(userId, first, last);
    });

    container.appendChild(card);
  });
}

/* IFRAME LOADING */
function openDriverInIframe(id, first, last) {
  const iframe = document.getElementById("impersonation-frame");
  const status = document.getElementById("impersonation-status");
  CURRENT_DRIVER_ID = id;
  iframe.src =
    "../driver/driver.html?id=" +
    encodeURIComponent(id) +
    "&org=" +
    encodeURIComponent(ORG_ID);
  status.textContent = `Viewing as driver ${first} ${last} (User ID: ${id})`;
}

function clearSelectionAndFrame() {
  document.getElementById("users-list").innerHTML = "";
  const iframe = document.getElementById("impersonation-frame");
  const status = document.getElementById("impersonation-status");

  iframe.src = "";
  status.textContent =
    "No user selected. Choose a driver on the left to start.";
}

function attachIframeGuard() {
  const iframe = document.getElementById("impersonation-frame");

  iframe.addEventListener("load", () => {
    let internalURL;

    try {
      // Works only if same-origin
      internalURL = iframe.contentWindow.location.href;
    } catch (e) {
      // Cross-origin fallback
      internalURL = iframe.src;
    }

    console.log("[IFRAME VISIT]:", internalURL);

    if (internalURL.includes("DriverSelectOrg")) {
      const redirect =
        "../driver/driver.html?id=" + CURRENT_DRIVER_ID + "&org=" + ORG_ID;
      iframe.src = redirect;
    }
  });
}
