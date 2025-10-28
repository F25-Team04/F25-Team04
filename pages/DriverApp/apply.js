const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

function enhanceNav() {
  // Try the common nav UL; fall back to #links if present
  const navUl =
    document.querySelector("nav .nav-container ul") ||
    document.getElementById("links");
  if (!navUl) return;

  const li = document.createElement("li");

  const dash = document.createElement("a");
  dash.href = "../driver/driver.html?id=" + USER_ID;
  dash.textContent = "Dashboard";
  li.appendChild(dash);

  const account = document.createElement("a");
  account.href =
    "../driver-change-info/change-info.html?id=" + USER_ID;
  account.textContent = "Update Account Info";
  li.appendChild(account);

  const switchOrg = document.createElement("a");
  switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
  switchOrg.textContent = "Switch Organization";
  li.appendChild(switchOrg);

  const appHistory = document.createElement("a");
  appHistory.href = "../AppHistory/AppHistory.html?id=" + USER_ID;
  appHistory.textContent = "Application History";
  li.appendChild(appHistory);

  navUl.appendChild(li);
}

function generateOrgs(orgs) {
    const dropdown = document.getElementById("dropdown")
    orgs.forEach((org, idx) => {
        const option = document.createElement("option");
        option.value = org;
        option.dataset.id = String(idx + 1);
        dropdown.appendChild(option);
    });
}

window.onload = function() {
    enhanceNav();

    fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/organizations")
        .then(response => response.json())
        .then(orgs => {
            generateOrgs(orgs); // handle the JSON data
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });

    document.getElementById("appForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        let orgId = null;        
        const dl = document.getElementById("dropdown");
        const inp = document.getElementById("searchable");
        if (dl && inp) {
            const match = Array.from(dl.options).find(o => o.value === inp.value);
            orgId = match ? Number(match.dataset.id) : null;
        }

        if (!orgId) {
            alert("Please select a valid organization.");
            return;
        }

        const note = document.querySelector("note");
        const body = {
            user: USER_ID,
            org: orgId,
            app_note: note
        };

        try {
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/application", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const ans = await response.json();
            if (ans.success === true) {
                alert("Application submitted succesfully.")
            } else {
                alert(ans.message);
            }
        } catch (err) {
            alert("Could not submit application: " + err.message);
        }

        
    });
}