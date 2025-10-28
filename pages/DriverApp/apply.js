const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

function enhanceNav() {
  var list = this.document.getElementById("links");
  if (USER_ID == null && ORG_ID == null) {
    return;
  }
  if (USER_ID != null && ORG_ID == null) {
    const li = document.createElement("li");
    const switchOrg = document.createElement("a");
    switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
    switchOrg.textContent = "Switch Organization";
    li.appendChild(switchOrg);
    list.appendChild(li);
    return;
  }
  var list = this.document.getElementById("links");
  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);
  const store = document.createElement("a");
  store.href =
    "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
  store.textContent = "Store";
  li.appendChild(store);
  const account = document.createElement("a");
  account.href =
    "../driver-change-info/change-info.html?id=" + USER_ID + "&org=" + ORG_ID;
  account.textContent = "Update Account Info";
  li.appendChild(account);
  const switchOrg = document.createElement("a");
  switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
  switchOrg.textContent = "Switch Organization";
  li.appendChild(switchOrg);
  list.appendChild(li);

  const apply = document.createElement("a");
  apply.href = "../DriverApp/apply.html?id=" + USER_ID + "&org=" + ORG_ID;
  apply.textContent = "Apply";
  li.appendChild(apply);
  list.appendChild(li);
}

function generateOrgs(orgs) {
  const dropdown = document.getElementById("dropdown");
  orgs.forEach((org, idx) => {
    const option = document.createElement("option");
    option.value = org;
    option.dataset.id = String(idx + 1);
    dropdown.appendChild(option);
  });
}

window.onload = function () {
  enhanceNav();

  fetch(
    "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/organizations"
  )
    .then((response) => response.json())
    .then((orgs) => {
      generateOrgs(orgs); // handle the JSON data
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  document
    .getElementById("appForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      let orgId = null;
      const dl = document.getElementById("dropdown");
      const inp = document.getElementById("searchable");
      if (dl && inp) {
        const match = Array.from(dl.options).find((o) => o.value === inp.value);
        orgId = match ? Number(match.dataset.id) : null;
      }

      if (!orgId) {
        alert("Please select a valid organization.");
        return;
      }

        const fd = new FormData(event.target);
        const note = (fd.get("note") || "").toString().trim();

        const body = {
            user: USER_ID,
            org: orgId,
            app_note: note
        };

      try {
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/application",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const ans = await response.json();
        if (ans.success === true) {
          alert("Application submitted succesfully.");
        } else {
          alert(ans.message);
        }
      } catch (err) {
        alert("Could not submit application: " + err.message);
      }
    });
};
