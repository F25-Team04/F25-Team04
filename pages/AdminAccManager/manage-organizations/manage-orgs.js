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
    create.href = "../../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
    create.textContent = "Create Sponsor";
    const create_driver = document.createElement("a");
    create_driver.href = "../../AdminCreateDriver/AdminCreateDriver.html?id=" + USER_ID;
    create_driver.textContent = "Create Driver";
    const create_org = document.createElement("a");
    create_org.href = "../../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
    create_org.textContent = "Create Organization";
    const create_admin = document.createElement("a");
    create_admin.href = "../../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
    create_admin.textContent = "Create Admin";
    const bulk_load = document.createElement("a");
    bulk_load.href = "../AdminBulkLoad/AdminBulkLoad.html?id=" + USER_ID;
    bulk_load.textContent = "Bulk Loader";
        const impersonator = document.createElement("a");
  impersonator.href = "../AdminImpersonator/AdminImpersonator.html?id=" + USER_ID;
  impersonator.textContent = "Impersonation";
    li.appendChild(create_admin);
    li.appendChild(create_driver);
    li.appendChild(create);
    li.appendChild(create_org);
    li.appendChild(bulk_load);
    li.appendChild(impersonator);
    list.appendChild(li);

    async function fetchOrgs() {
        const container = document.getElementById("org-cards");
        if (!container) return;
        container.textContent = "Loading...";
        try {
            const resp = await fetch(`${API_BASE}/organizations?include_ids=1`);
            if (!resp.ok) {
                container.textContent = await resp.text().catch(() => "Failed to load organizations.");
                return;
            }
            let orgs = await resp.json();
            if (!Array.isArray(orgs)) orgs = [];
            renderOrgCards(orgs);
        } catch (e) {
            console.error(e);
            container.textContent = "Error loading organizations.";
        }
    }

    function renderOrgCards(orgs) {
        const container = document.getElementById("org-cards");
        if (!container) return;
        container.innerHTML = "";
        if (!orgs.length) {
            container.innerHTML = `<p>No organizations found.</p>`;
            return;
        }

        orgs.forEach(s => {
            const card = document.createElement("div");
            card.className = "org-card";

            const name = document.createElement("p");
            name.className = "org-name";
            name.textContent = `${s["org_name"] || ""}`.trim();

            const email = document.createElement("p");
            email.className = "org-id";
            email.textContent = `Organization ID: ${s["org_id"] || ""}`.trim();

            const delBtn = document.createElement("button");
            delBtn.className = "org-delete";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", async () => {
                const orgId = s["org_id"];
                if (!orgId) return;
                if (!confirm(`Delete organization ${name.textContent}?`)) return;
                try {
                    const resp = await fetch(`${API_BASE}/organizations?id=${encodeURIComponent(orgId)}`, { method: "DELETE" });
                    const txt = await resp.text().catch(() => "");
                    let data; try { data = JSON.parse(txt); } catch {}
                    if (!resp.ok) {
                        alert(data?.message || txt || "Delete failed.");
                        return;
                    }
                    alert(data?.message || "Organization deleted.");
                    card.remove();
                } catch {
                    alert("Network error deleting organization.");
                }
            });

            card.appendChild(name);
            card.appendChild(email);
            card.appendChild(delBtn);
            container.appendChild(card);
        });
    }

    // Initial fetch of organizations
    fetchOrgs();
};