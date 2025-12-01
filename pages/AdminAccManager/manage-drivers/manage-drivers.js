const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const API_BASE = "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev";

window.onload = function () {
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = "../../AdminHomepage/AdminHome.html?id=" + USER_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);
  const create = document.createElement("a");
  create.href =
    "../../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
  create.textContent = "Create Sponsor";
  const create_org = document.createElement("a");
  create_org.href =
    "../../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
  create_org.textContent = "Create Organization";
  const create_admin = document.createElement("a");
  create_admin.href = "../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
  create_admin.textContent = "Create Admin";
  const bulk_load = document.createElement("a");
  bulk_load.href = "../AdminBulkLoad/AdminBulkLoad.html?id=" + USER_ID;
  bulk_load.textContent = "Bulk Loader";
  const impersonator = document.createElement("a");
  impersonator.href =
    "../AdminImpersonator/AdminImpersonator.html?id=" + USER_ID;
  impersonator.textContent = "Impersonation";
  li.appendChild(create_admin);
  li.appendChild(create);
  li.appendChild(create_org);
  li.appendChild(bulk_load);
  li.appendChild(impersonator);
  list.appendChild(li);

  // Populate dropdown with { org_id, org_name }
  function generateOrgs(orgs) {
    const dropdown = document.getElementById("driver-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Organization</option>';
    (Array.isArray(orgs) ? orgs : []).forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o.org_id; // numeric ORG_ID used later
      opt.textContent = o.org_name; // label
      dropdown.appendChild(opt);
    });
  }

  async function fetchDrivers(orgId) {
    const container = document.getElementById("driver-cards");
    if (!container) return;
    if (!orgId) {
      container.innerHTML = "<p>Select an organization.</p>";
      return;
    }
    container.textContent = "Loading...";
    try {
      const resp = await fetch(
        `${API_BASE}/driver?org=${encodeURIComponent(orgId)}`
      );
      if (!resp.ok) {
        container.textContent = await resp
          .text()
          .catch(() => "Failed to load drivers.");
        return;
      }
      let drivers = await resp.json();
      if (!Array.isArray(drivers)) drivers = [];
      renderDriverCards(drivers, orgId);
    } catch (e) {
      console.error(e);
      container.textContent = "Error loading drivers.";
    }
  }

  function renderDriverCards(drivers, orgId) {
    const container = document.getElementById("driver-cards");
    if (!container) return;
    container.innerHTML = "";
    if (!drivers.length) {
      container.innerHTML = `<p>No drivers found for organization ${orgId}.</p>`;
      return;
    }

    drivers.forEach((s) => {
      const card = document.createElement("div");
      card.className = "driver-card";

      // Open transactions on card click
      card.addEventListener("click", () => {
        const driverId = s["User ID"];
        const driverName = `${s["First Name"] || ""} ${
          s["Last Name"] || ""
        }`.trim();
        if (driverId) openTransactionsModal(driverId, driverName);
      });

      const name = document.createElement("p");
      name.className = "driver-name";
      name.textContent = `${s["First Name"] || ""} ${
        s["Last Name"] || ""
      }`.trim();

      const email = document.createElement("p");
      email.className = "driver-email";
      email.textContent = s["Email"] || "";

      const delBtn = document.createElement("button");
      delBtn.className = "driver-delete";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", async (e) => {
        e.stopPropagation(); // don't open modal when deleting
        const driverId = s["User ID"];
        if (!driverId) return;
        if (!confirm(`Delete driver ${name.textContent}?`)) return;
        try {
          const resp = await fetch(
            `${API_BASE}/user?id=${encodeURIComponent(driverId)}`,
            { method: "DELETE" }
          );
          const txt = await resp.text().catch(() => "");
          let data;
          try {
            data = JSON.parse(txt);
          } catch {}
          if (!resp.ok) {
            alert(data?.message || txt || "Delete failed.");
            return;
          }
          alert(data?.message || "Driver deleted.");
          card.remove();
        } catch {
          alert("Network error deleting driver.");
        }
      });

      card.appendChild(name);
      card.appendChild(email);
      card.appendChild(delBtn);
      container.appendChild(card);
    });
  }

  async function openTransactionsModal(driverId, driverName) {
    const modal = ensureTxnModal();
    const title = modal.querySelector(".txn-title");
    const body = modal.querySelector(".txn-body");

    title.textContent = `Point Transactions — ${driverName}`;
    body.textContent = "Loading...";

    try {
      const resp = await fetch(
        `${API_BASE}/driver_transactions?id=${encodeURIComponent(driverId)}`
      );
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        body.textContent = txt || "Failed to load transactions.";
        showTxnModal(modal);
        return;
      }
      let items = await resp.json();
      if (!Array.isArray(items)) items = [];

      body.innerHTML = "";
      if (!items.length) {
        const p = document.createElement("p");
        p.textContent = "No transactions found.";
        body.appendChild(p);
      } else {
        const list = document.createElement("ul");
        list.style.listStyle = "none";
        list.style.padding = "0";
        items.forEach((t) => {
          const li = document.createElement("li");
          li.style.padding = "6px 0";
          const amt = Number(t["Amount"] ?? 0);
          const sign = amt > 0 ? "+" : amt < 0 ? "−" : "";
          const reason = t["Reason"] ?? "";
          const giver = t["Giver"] ?? "";
          const dateRaw = t["Date"] ?? "";
          const dateStr = dateRaw ? new Date(dateRaw).toLocaleString() : "";
          li.textContent = `${sign}${Math.abs(amt)} pts • ${reason}${
            giver ? " • By: " + giver : ""
          }${dateStr ? " • " + dateStr : ""}`;
          list.appendChild(li);
        });
        body.appendChild(list);
      }
    } catch (e) {
      console.error(e);
      body.textContent = "Error loading transactions.";
    }

    showTxnModal(modal);
  }

  function ensureTxnModal() {
    let modal = document.getElementById("txn-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "txn-modal";
    modal.className = "txn-modal hidden";
    modal.innerHTML = `
          <div class="txn-backdrop"></div>
          <div class="txn-dialog">
            <div class="txn-header">
              <h3 class="txn-title">Point Transactions</h3>
              <button class="txn-close" aria-label="Close">×</button>
            </div>
            <div class="txn-body">Loading...</div>
          </div>
        `;
    document.body.appendChild(modal);

    modal
      .querySelector(".txn-backdrop")
      .addEventListener("click", () => hideTxnModal(modal));
    modal
      .querySelector(".txn-close")
      .addEventListener("click", () => hideTxnModal(modal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden"))
        hideTxnModal(modal);
    });

    const header = modal.querySelector(".txn-header");
    Object.assign(header.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "8px",
    });
    const close = modal.querySelector(".txn-close");
    Object.assign(close.style, {
      background: "transparent",
      border: "none",
      fontSize: "20px",
      cursor: "pointer",
    });

    return modal;
  }

  function showTxnModal(modal) {
    modal.classList.remove("hidden");
    modal.style.display = "block";
  }
  function hideTxnModal(modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }

  // Fetch orgs with ids
  fetch(`${API_BASE}/organizations?include_ids=1`)
    .then((r) => r.json())
    .then(generateOrgs)
    .catch((err) => console.error("Org fetch failed:", err));

  // When org changes, use its org_id (value) to load drivers
  const dd = document.getElementById("driver-dropdown");
  if (dd) {
    dd.addEventListener("change", function () {
      fetchDrivers(this.value);
    });
  }
};
