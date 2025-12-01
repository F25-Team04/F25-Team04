const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
let ORGS = {};

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
  const li = document.createElement("li");

  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;

  const link = document.createElement("a");
  link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);

  const notifications = document.createElement("a");
  notifications.href =
    "../notificationsPage/notifs.html?id=" + USER_ID + "&org=" + ORG_ID;
  notifications.textContent = "Notifications";
  li.appendChild(notifications);

  const store = document.createElement("a");
  store.href =
    "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
  store.textContent = "Store";
  li.appendChild(store);

  const cart = document.createElement("a");
  cart.href = "../DriverCart/DriverCart.html?id=" + USER_ID + "&org=" + ORG_ID;
  cart.textContent = "Cart";
  li.appendChild(cart);

  list.appendChild(li);

  const orders = document.createElement("a");
  orders.href =
    "../driver/driver-orders/driver-orders.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  orders.textContent = "Orders";
  li.appendChild(orders);

  const apply = document.createElement("a");
  apply.href = "../DriverApp/apply.html?id=" + USER_ID + "&org=" + ORG_ID;
  apply.textContent = "Apply";
  li.appendChild(apply);

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
}

function generateOrgs(orgs) {
  const dropdown = document.getElementById("dropdown");
  if (!dropdown) return;
  dropdown.innerHTML = ""; // clear any previous options
  orgs.forEach((org, idx) => {
    console.log(org["org_name"] + " " + org["org_id"]);
    const option = document.createElement("option");
    const label =
      org && typeof org === "object"
        ? org.org_name ?? org.name ?? `Org ${idx + 1}`
        : String(org);

    option.value = label; // show name in the UI
    option.dataset.id = org["org_id"]; // keep 1-based org id to submit
    dropdown.appendChild(option);
  });
}

window.onload = function () {
  enhanceNav();

  fetch(
    "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/organizations?include_ids=true"
  )
    .then((response) => response.json())
    .then((orgs) => {
      generateOrgs(orgs); // handle the JSON data
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  document.getElementById("link").addEventListener("click", (e) => {
    e.preventDefault();
    const url = "../AppHistory/AppHistory.html?id=" + USER_ID;
    window.location.href = url;
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

      console.log("Submitting application for org ID:", orgId);

      const body = {
        user: USER_ID,
        org: orgId,
        app_note: note,
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
        const clone = response.clone();
        try {
          const ans = await response.json();

          if (ans.success === true) {
            alert("Application submitted succesfully.");
            GetApplications();
          }
        } catch (err) {
          const text = await clone.text();
          alert(text);
        }
      } catch (err) {
        console.error("Error submitting application:", err);
      }
    });

  async function GetApplications() {
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/application?id=" +
          USER_ID,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          console.log(result);
          CreateTable(result);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetApplications();
  function CreateTable(apps) {
    var table = document.getElementById("app_table");
    for (let app of apps) {
      console.log(app);
      row = document.createElement("tr");
      data = document.createElement("td");
      data.innerText = app["Application ID"];
      row.appendChild(data);
      data = document.createElement("td");
      data.innerText = app["User ID"];
      row.appendChild(data);
      data = document.createElement("td");
      data.innerText = app["First Name"] + " " + app["Last Name"];
      row.appendChild(data);
      data = document.createElement("td");
      data.innerText = app["Organization Name"];
      row.appendChild(data);
      data = document.createElement("td");
      data.innerText = app["Date Created"];
      row.appendChild(data);
      data = document.createElement("td");
      if (app["Date Updated"] == null) {
        data.innerText = "None";
      } else {
        data.innerText = app["Date Updated"];
      }
      row.appendChild(data);
      data = document.createElement("td");
      data.innerText = app["Status"];
      row.appendChild(data);
      data = document.createElement("td");
      data.innerText = app["Note"];
      row.appendChild(data);

      table.appendChild(row);
    }
  }
  CreateTable();
};
