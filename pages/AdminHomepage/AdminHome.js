const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const API_BASE = "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev";

window.onload = function () {
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  var about = this.document.getElementById("about-page");
  about.href = "../about/about.html?id=" + USER_ID;
  const link = document.createElement("a");
  link.href = "../AdminHomepage/AdminHome.html?id=" + USER_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);
  const create = document.createElement("a");
  create.href = "../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
  create.textContent = "Create Sponsor";
  const create_org = document.createElement("a");
  create_org.href =
    "../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
  create_org.textContent = "Create Organization";
  const create_admin = document.createElement("a");
  create_admin.href = "../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
  create_admin.textContent = "Create Admin";
  const bulk_load = document.createElement("a");
  bulk_load.href = "../AdminBulkLoad/AdminBulkLoad.html?id=" + USER_ID;
  bulk_load.textContent = "Bulk Loader";

  const impersonator = document.createElement("a");
  impersonator.href = "../AdminImpersonator/AdminImpersonator.html?id=" + USER_ID;
  impersonator.textContent = "Impersonation";

  li.appendChild(create_admin);
  li.appendChild(create);
  li.appendChild(create_org);
  li.appendChild(bulk_load);
  li.appendChild(impersonator);
  list.appendChild(li);

  loadGreeting();

  // Populate one dropdown and drive both lists
  orgDD("org-dd", (orgId) => {
    loadRecentDrivers(orgId);
    loadRecentSponsors(orgId);
  });

  loadRecentOrgs();
  loadRecentAdmins();

  // Make panels clickable; append current org to target URL if selected
  makePanelClickable(
    "drivers-list",
    `../AdminAccManager/manage-drivers/manage-drivers.html?id=${encodeURIComponent(USER_ID || "")}`
  );
  makePanelClickable(
    "sponsors-list",
    `../AdminAccManager/manage-sponsors/manage-sponsors.html?id=${encodeURIComponent(USER_ID || "")}`
  );
  makePanelClickable(
    "orgs-list",
    `../AdminAccManager/manage-organizations/manage-orgs.html?id=${encodeURIComponent(USER_ID || "")}`
  );
  makePanelClickable(
    "admins-list",
    `../AdminAccManager/manage-admins/manage-admins.html?id=${encodeURIComponent(USER_ID || "")}`
  );
};

// Helper: current selected org id
function getSelectedOrgId() {
  const dd = document.getElementById("org-dd");
  return dd && dd.value ? dd.value : "";
}

// Make the entire column (panel) clickable based on a list inside it
function makePanelClickable(listId, baseHref) {
  const listEl = document.getElementById(listId);
  if (!listEl) return;
  const panel = listEl.closest(".panel") || listEl.parentElement;
  if (!panel) return;

  panel.style.cursor = "pointer";
  panel.tabIndex = 0;

  const go = () => {
    const org = getSelectedOrgId();
    const href = baseHref + (org ? `&org=${encodeURIComponent(org)}` : "");
    window.location.href = href;
  };

  panel.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, select, textarea, summary")) return;
    go();
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  });
}

async function orgDD(selectId, onChange) {
  const dd = document.getElementById(selectId);
  if (!dd) return;

  dd.innerHTML = `<option value="">Select Organization</option>`;
  try {
    const r = await fetch(`${API_BASE}/organizations?include_ids=1`);
    const txt = await r.text();
    let orgs; try { orgs = JSON.parse(txt); } catch { orgs = []; }
    if (!Array.isArray(orgs)) orgs = [];

    orgs.forEach(o => {
      const opt = document.createElement("option");
      opt.value = o.org_id;
      opt.textContent = o.org_name;
      dd.appendChild(opt);
    });

    if (dd.options.length > 1) dd.selectedIndex = 1;

    onChange(dd.value);

    dd.addEventListener("change", () => onChange(dd.value));
  } catch (e) {
    console.error(e);
  }
}

async function loadGreeting() {
  const greeting = document.getElementById("greeting");
  if (!greeting) return;
  if (!USER_ID) return;

  try {
    const response = await fetch(`${API_BASE}/user?id=${encodeURIComponent(USER_ID)}`);
    const txt = await response.text().catch(() => "");
    let data; try { data = JSON.parse(txt); } catch {}
    const firstName = data["First Name"] || "Admin";
    greeting.textContent = `Hello ${firstName}. Welcome back!`;
  }catch (e) {
    console.error(e);
  }
}

async function loadRecentDrivers(orgID) {
  const container = document.getElementById("drivers-list");
  if (!container) return;
  container.innerHTML = "<li>Loading...</li>";

  if (!orgID) {
    container.innerHTML = "<li>Select an organization.</li>";
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/driver?org=${encodeURIComponent(orgID)}`);
    const txt = await resp.text().catch(() => "");
    let data; try { data = JSON.parse(txt); } catch { data = null; }

    if (!resp.ok) {
      const msg = data?.message || `No drivers found for organization ${orgID}.`;
      container.innerHTML = `<li>${msg}</li>`;
      return;
    }

    const drivers = Array.isArray(data) ? data : [];
    if (!drivers.length) {
      container.innerHTML = `<li>No drivers found for organization ${orgID}.</li>`;
      return;
    }

    container.innerHTML = "";
    drivers.slice(0, 5).forEach(driver => {
      const li = document.createElement("li");
      const name = `${driver["First Name"] || ""} ${driver["Last Name"] || ""}`.trim();
      li.innerHTML = `<div class="item-primary">${name || "(Unnamed)"}</div><div class="item-secondary">${driver["Email"] || ""}</div>`;
      container.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = `<li>No drivers found for organization ${orgID}.</li>`;
  }
}

async function loadRecentSponsors(orgID) {
  const container = document.getElementById("sponsors-list");
  if (!container) return;
  container.innerHTML = "<li>Loading...</li>";

  if (!orgID) {
    container.innerHTML = "<li>Select an organization.</li>";
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/sponsor?org=${encodeURIComponent(orgID)}`);
    const txt = await resp.text().catch(() => "");
    let data; try { data = JSON.parse(txt); } catch { data = null; }

    if (!resp.ok) {
      const msg = data?.message || `No sponsors found for organization ${orgID}.`;
      container.innerHTML = `<li>${msg}</li>`;
      return;
    }

    const sponsors = Array.isArray(data) ? data : [];
    if (!sponsors.length) {
      container.innerHTML = `<li>No sponsors found for organization ${orgID}.</li>`;
      return;
    }

    container.innerHTML = "";
    sponsors.slice(0, 5).forEach(sponsor => {
      const li = document.createElement("li");
      const name = `${sponsor["First Name"] || ""} ${sponsor["Last Name"] || ""}`.trim();
      li.innerHTML = `<div class="item-primary">${name || "(Unnamed)"}</div><div class="item-secondary">${sponsor["Email"] || ""}</div>`;
      container.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = `<li>No sponsors found for organization ${orgID}.</li>`;
  }
}

async function loadRecentOrgs() {
  const container = document.getElementById("orgs-list");
  if (!container) return;
  container.innerHTML = "<li>Loading...</li>";
  try {
    const response = await fetch(`${API_BASE}/organizations?include_ids=1`);
    const orgs = await response.json();
    container.innerHTML = "";
    orgs.slice(0, 5).forEach(org => {
      const li = document.createElement("li");
      li.textContent = `${org["org_name"]} (ID: ${org["org_id"]})`;
      container.appendChild(li);
    });
    if (orgs.length === 0) {
      container.innerHTML = "<li>No organizations found.</li>";
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<li>Error loading organizations.</li>";
  }
}

async function loadRecentAdmins() {
  const container = document.getElementById("admins-list");
  if (!container) return;
  container.innerHTML = "<li>Loading...</li>";
  try {
    const response = await fetch(`${API_BASE}/admin`);
    const admins = await response.json();
    container.innerHTML = "";
    admins.slice(0, 5).forEach(admin => {
      const li = document.createElement("li");
      li.textContent = `${admin["First Name"]} ${admin["Last Name"]} (ID: ${admin["User ID"]})`;
      container.appendChild(li);
    });
    if (admins.length === 0) {
      container.innerHTML = "<li>No admins found.</li>";
    }
  } catch (e) {
    console.error(e);
    container.innerHTML = "<li>Error loading admins.</li>";
  }
}