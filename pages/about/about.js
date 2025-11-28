const endpoint =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/about";
const dataContainer = document.getElementById("db-data");

const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

let User = {};

function LoadNav() {
  var list = this.document.getElementById("links");
  console.log(User["Role"]);
  if (USER_ID == null && ORG_ID == null) {
    console.log("Hey");
    return;
  }
  if (User["Role"] == "sponsor") {
    // Nav
    var list = this.document.getElementById("links");
    const li = document.createElement("li");
    var about = this.document.getElementById("about-page");
    about.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;
    const link = document.createElement("a");
    link.href =
      "../SponsorHomepage/SponsorHome.html?id=" + USER_ID + "&org=" + ORG_ID;
    link.textContent = "Home";
    li.appendChild(link);

    const createSponsor = document.createElement("a");
    createSponsor.href =
      "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" +
      USER_ID +
      "&org=" +
      ORG_ID;
    createSponsor.textContent = "Create Account";
    li.appendChild(createSponsor);
    list.appendChild(li);

    const catalogView = document.createElement("a");
    catalogView.href =
      "../SponsorCatalogView/SponsorCatalogView.html?id=" +
      USER_ID +
      "&org=" +
      ORG_ID;
    catalogView.textContent = "Catalog View";
    li.appendChild(catalogView);
    list.appendChild(li);

    const app = document.createElement("a");
    app.href =
      "../SponsorApplicationPage/sponsor-applications.html?id=" +
      USER_ID +
      "&org=" +
      ORG_ID;
    app.textContent = "Applications";
    li.appendChild(app);

    const pointsManager = document.createElement("a");
    pointsManager.href =
      "../points-manager/points-manager.html?id=" + USER_ID + "&org=" + ORG_ID;
    pointsManager.textContent = "Points Manager";
    li.appendChild(pointsManager);
    list.appendChild(li);

    const change = document.createElement("a");
    change.href =
      "../SponsorChangeConversionRate/ChangeConversionRate.html?id=" +
      USER_ID +
      "&org=" +
      ORG_ID;
    change.textContent = "Change Point Conversion Rate";
    li.appendChild(change);

    const bulk = document.createElement("a");
    bulk.href =
      "../SponsorBulkLoad/SponsorBulkLoad.html?id=" +
      USER_ID +
      "&org=" +
      ORG_ID;
    bulk.textContent = "Bulk Loader";
    li.appendChild(bulk);

    list.appendChild(li);
  } else if ((User["role"] = "driver")) {
    console.log("Hey");
    if (USER_ID != null && ORG_ID == null) {
      const li = document.createElement("li");
      const switchOrg = document.createElement("a");
      switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
      switchOrg.textContent = "Switch Organization";
      li.appendChild(switchOrg);
      const apply = document.createElement("a");
      apply.href = "../DriverApp/apply.html?id=" + USER_ID;
      apply.textContent = "Apply";
      li.appendChild(apply);
      list.appendChild(li);
      return;
    }
    var list = this.document.getElementById("links");
    const li = document.createElement("li");

    var aboutPage = this.document.getElementById("about-page");
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
    cart.href =
      "../DriverCart/DriverCart.html?id=" + USER_ID + "&org=" + ORG_ID;
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
}

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
// Gets the user information based on the user id in the query params so that the welcome message will be personalized
async function GetUser() {
  try {
    // Send POST request
    const response = await fetch(
      "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" +
        USER_ID,
      {
        method: "GET",
      }
    );
    if (response.ok) {
      var result = await response.json();
      result = result[0];
      if (response.success == false) {
        alert(result.message);
      } else if (response.status == 200) {
        User = result;
        console.log(User);
        LoadNav();
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
GetUser();
