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
    const create_org = document.createElement("a");
    create_org.href = "../../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
    create_org.textContent = "Create Organization";
    const create_admin = document.createElement("a");
    create_admin.href = "../../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
    create_admin.textContent = "Create Admin";
    const bulk_load = document.createElement("a");
    bulk_load.href = "../AdminBulkLoad/AdminBulkLoad.html?id=" + USER_ID;
    bulk_load.textContent = "Bulk Loader";
    li.appendChild(create_admin);
    li.appendChild(create);
    li.appendChild(create_org);
    li.appendChild(bulk_load);
    list.appendChild(li);

    // Populate dropdown with { org_id, org_name }
    function generateOrgs(orgs) {
        const dropdown = document.getElementById("sponsor-dropdown");
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">Select Organization</option>';
        (Array.isArray(orgs) ? orgs : []).forEach(o => {
            const opt = document.createElement("option");
            opt.value = o.org_id;           // numeric ORG_ID used later
            opt.textContent = o.org_name;   // label
            dropdown.appendChild(opt);
        });
    }

    async function fetchSponsors(orgId) {
        const container = document.getElementById("sponsor-cards");
        if (!container) return;
        if (!orgId) {
            container.innerHTML = "<p>Select an organization.</p>";
            return;
        }
        container.textContent = "Loading...";
        try {
            const resp = await fetch(`${API_BASE}/sponsor?org=${encodeURIComponent(orgId)}`);
            if (!resp.ok) {
                container.textContent = await resp.text().catch(() => "Failed to load sponsors.");
                return;
            }
            let sponsors = await resp.json();
            if (!Array.isArray(sponsors)) sponsors = [];
            renderSponsorCards(sponsors, orgId);
        } catch (e) {
            console.error(e);
            container.textContent = "Error loading sponsors.";
        }
    }

    function renderSponsorCards(sponsors, orgId) {
        const container = document.getElementById("sponsor-cards");
        if (!container) return;
        container.innerHTML = "";
        if (!sponsors.length) {
            container.innerHTML = `<p>No sponsors found for organization ${orgId}.</p>`;
            return;
        }

        sponsors.forEach(s => {
            const card = document.createElement("div");
            card.className = "sponsor-card";

            const name = document.createElement("p");
            name.className = "sponsor-name";
            name.textContent = `${s["First Name"] || ""} ${s["Last Name"] || ""}`.trim();

            const email = document.createElement("p");
            email.className = "sponsor-email";
            email.textContent = s["Email"] || "";

            const delBtn = document.createElement("button");
            delBtn.className = "sponsor-delete";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", async () => {
                const sponsorId = s["User ID"];
                if (!sponsorId) return;
                if (!confirm(`Delete sponsor ${name.textContent}?`)) return;
                try {
                    const resp = await fetch(`${API_BASE}/user?id=${encodeURIComponent(sponsorId)}`, { method: "DELETE" });
                    const txt = await resp.text().catch(() => "");
                    let data; try { data = JSON.parse(txt); } catch {}
                    if (!resp.ok) {
                        alert(data?.message || txt || "Delete failed.");
                        return;
                    }
                    alert(data?.message || "Sponsor deleted.");
                    card.remove();
                } catch {
                    alert("Network error deleting sponsor.");
                }
            });

            card.appendChild(name);
            card.appendChild(email);
            card.appendChild(delBtn);
            container.appendChild(card);
        });
    }

    // Fetch orgs with ids
    fetch(`${API_BASE}/organizations?include_ids=1`)
        .then(r => r.json())
        .then(generateOrgs)
        .catch(err => console.error("Org fetch failed:", err));

    // When org changes, use its org_id (value) to load sponsors
    const dd = document.getElementById("sponsor-dropdown");
    if (dd) {
        dd.addEventListener("change", function () {
            fetchSponsors(this.value);
        });
    }
};