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
    li.appendChild(create_admin);
    li.appendChild(create);
    li.appendChild(create_org);
    list.appendChild(li);

    async function fetchAdmins() {
        const container = document.getElementById("admin-cards");
        if (!container) return;
        container.textContent = "Loading...";
        try {
            const resp = await fetch(`${API_BASE}/admin`);
            if (!resp.ok) {
                container.textContent = await resp.text().catch(() => "Failed to load admins.");
                return;
            }
            let admins = await resp.json();
            if (!Array.isArray(admins)) admins = [];
            renderAdminCards(admins);
        } catch (e) {
            console.error(e);
            container.textContent = "Error loading admins.";
        }
    }

    function renderAdminCards(admins) {
        const container = document.getElementById("admin-cards");
        if (!container) return;
        container.innerHTML = "";
        if (!admins.length) {
            container.innerHTML = `<p>No admins found.</p>`;
            return;
        }

        admins.forEach(s => {
            const card = document.createElement("div");
            card.className = "admin-card";

            const name = document.createElement("p");
            name.className = "admin-name";
            name.textContent = `${s["First Name"] || ""} ${s["Last Name"] || ""}`.trim();

            const email = document.createElement("p");
            email.className = "admin-email";
            email.textContent = s["Email"] || "";

            const delBtn = document.createElement("button");
            delBtn.className = "admin-delete";
            delBtn.textContent = "Delete";
            delBtn.addEventListener("click", async () => {
                const adminId = s["User ID"];
                if (!adminId) return;
                if (!confirm(`Delete admin ${name.textContent}?`)) return;
                try {
                    const resp = await fetch(`${API_BASE}/user?id=${encodeURIComponent(adminId)}`, { method: "DELETE" });
                    const txt = await resp.text().catch(() => "");
                    let data; try { data = JSON.parse(txt); } catch {}
                    if (!resp.ok) {
                        alert(data?.message || txt || "Delete failed.");
                        return;
                    }
                    alert(data?.message || "Admin deleted.");
                    card.remove();
                } catch {
                    alert("Network error deleting admin.");
                }
            });

            card.appendChild(name);
            card.appendChild(email);
            card.appendChild(delBtn);
            container.appendChild(card);
        });
    }

    // Initial fetch of admins
    fetchAdmins();
};