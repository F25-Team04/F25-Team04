const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

const DRIVER_ENDPOINT =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?role=driver";
const SPONSOR_ENDPOINT =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?role=sponsor";

let CURRENT_MODE = "driver";
let DRIVER_CACHE = [];
let SPONSOR_CACHE = [];

window.onload = function () {
  buildNavLinks();
  attachToggleHandlers();
  attachFilterHandlers();
  attachCollapseHandler();
  fetchDrivers();
  fetchSponsors();
};

/* ------------------------------
   NAV BAR
------------------------------ */
function buildNavLinks() {
  const list = document.getElementById("links");
  const about = document.getElementById("about-page");
  if (about) about.href = "../about/about.html?id=" + USER_ID;

  const li = document.createElement("li");

  function add(text, path) {
    const a = document.createElement("a");
    a.href = path + "?id=" + USER_ID;
    a.textContent = text;
    li.appendChild(a);
  }

  add("Dashboard", "../AdminHomepage/AdminHome.html");
  add("Create Admin", "../AdminCreateAdmin/AdminCreateAdmin.html");
  add("Create Sponsor", "../AdminCreateSponsor/AdminCreateSponsor.html");
  add("Create Organization", "../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html");
  add("Bulk Loader", "../AdminBulkLoad/AdminBulkLoad.html");
  add("Impersonation", "../AdminImpersonator/AdminImpersonator.html");

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

/* DRIVER/SPONSOR toggle, filters, fetchers, list builder, iframe update... */
/* (unchanged from your working version) */

/* ------------------------------
   DRIVER/SPONSOR TOGGLE
------------------------------ */
function attachToggleHandlers() {
  const dTab = document.getElementById("drivers-tab");
  const sTab = document.getElementById("sponsors-tab");

  dTab.addEventListener("click", () => {
    if (CURRENT_MODE === "driver") return;
    CURRENT_MODE = "driver";
    dTab.classList.add("active");
    sTab.classList.remove("active");
    clearSelectionAndFrame();
    applyFilters();
  });

  sTab.addEventListener("click", () => {
    if (CURRENT_MODE === "sponsor") return;
    CURRENT_MODE = "sponsor";
    sTab.classList.add("active");
    dTab.classList.remove("active");
    clearSelectionAndFrame();
    applyFilters();
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
  const mode = CURRENT_MODE;
  const field = document.getElementById("user-filter-field").value;

  const source = mode === "driver" ? DRIVER_CACHE : SPONSOR_CACHE;

  if (!term.trim()) return buildUsersList(source, mode);

  const filtered = source.filter((u) => matchesFilter(u, term, field));
  buildUsersList(filtered, mode);
}

function matchesFilter(user, term, field) {
  const name =
    ((user["First Name"] || "") + " " + (user["Last Name"] || "")).toLowerCase();
  const userId = (user["User ID"] || "").toString().toLowerCase();
  const email = (user["Email"] || "").toLowerCase();

  let orgText = "";
  if (Array.isArray(user["Organizations"])) {
    orgText = user["Organizations"]
      .map((o) => (o.org_name || "") + " " + (o.org_id || ""))
      .join(" ")
      .toLowerCase();
  }

  if (field === "name") return name.includes(term);
  if (field === "id") return userId.includes(term);
  if (field === "email") return email.includes(term);
  if (field === "org") return orgText.includes(term);

  return (
    name.includes(term) ||
    userId.includes(term) ||
    email.includes(term) ||
    orgText.includes(term)
  );
}

/* FETCHERS */
async function fetchDrivers() {
  const res = await fetch(DRIVER_ENDPOINT);
  DRIVER_CACHE = (await res.json()) || [];
  if (CURRENT_MODE === "driver") applyFilters();
}

async function fetchSponsors() {
  const res = await fetch(SPONSOR_ENDPOINT);
  SPONSOR_CACHE = (await res.json()) || [];
  if (CURRENT_MODE === "sponsor") applyFilters();
}

/* BUILD LIST */
function buildUsersList(users, type) {
  const container = document.getElementById("users-list");
  container.innerHTML = "";

  if (!users.length) {
    container.textContent =
      type === "driver" ? "No drivers found." : "No sponsors found.";
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
    icon.className =
      type === "driver" ? "bxr bx-user driver-icon" : "bxr bx-building-house driver-icon";

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
      document.querySelectorAll(".driver-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      if (type === "driver") openDriverInIframe(userId, first, last);
      else openSponsorInIframe(userId, first, last);
    });

    container.appendChild(card);
  });
}

/* IFRAME LOADING */
function openDriverInIframe(id, first, last) {
  const iframe = document.getElementById("impersonation-frame");
  const status = document.getElementById("impersonation-status");
  iframe.src = "../DriverSelectOrg/DriverSelectOrg.html?id=" + encodeURIComponent(id);
  status.textContent = `Viewing organization selection for driver ${first} ${last} (User ID: ${id})`;
}

function openSponsorInIframe(id, first, last) {
  const iframe = document.getElementById("impersonation-frame");
  const status = document.getElementById("impersonation-status");
  iframe.src = "../SponsorHomepage/SponsorHome.html?id=" + encodeURIComponent(id);
  status.textContent = `Viewing sponsor dashboard for ${first} ${last} (User ID: ${id})`;
}

function clearSelectionAndFrame() {
  document.getElementById("users-list").innerHTML = "";
  const iframe = document.getElementById("impersonation-frame");
  const status = document.getElementById("impersonation-status");

  iframe.src = "";
  status.textContent =
    "No user selected. Choose a " +
    (CURRENT_MODE === "driver" ? "driver" : "sponsor") +
    " on the left to start.";
}
