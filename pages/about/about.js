const endpoint =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/about";
const dataContainer = document.getElementById("db-data");

const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
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

  const link = document.createElement("a");
  link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);

  const store = document.createElement("a");
  store.href =
    "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
  store.textContent = "Store";
  li.appendChild(store);
  list.appendChild(li);

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
};

fetch(endpoint)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    Object.entries(data).forEach(([key, value]) => {
      const h = document.createElement("h3");
      const p = document.createElement("p");

      h.textContent = key;
      p.textContent = value ?? "";

      dataContainer.appendChild(h);
      dataContainer.appendChild(p);
    });
  })
  .catch((error) => {
    console.error("Error fetching data ", error);
  });
