const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

let isDirty = false;
let bypassLeavePrompt = false;

function enhanceNav() {
  // Try the common nav UL; fall back to #links if present
  const navUl =
    document.querySelector("nav .nav-container ul") ||
    document.getElementById("links");
  if (!navUl) return;

  const li = document.createElement("li");
  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;

  const dash = document.createElement("a");
  dash.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  dash.textContent = "Dashboard";
  li.appendChild(dash);

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

  navUl.appendChild(li);
}

function collectUpdates(form) {
  const fd = new FormData(form);
  const updates = {};
  for (const [key, value] of fd.entries()) {
    const v = (value || "").trim();
    if (!v) continue;
    switch (key) {
      case "phone":
        updates.phone = v;
        break;
      case "fname":
        updates.firstName = v;
        break;
      case "lname":
        updates.lastName = v;
        break;
      case "dln":
        updates.driverLicenseNumber = v;
        break;
      case "address":
        updates.address = v;
        break;
      default:
        break;
    }
  }
  updates.id = USER_ID;
  return updates;
}

window.addEventListener("DOMContentLoaded", () => {
  enhanceNav();

  const form = document.getElementById("changeInfoForm");
  if (!form) return;

  const markDirty = () => {
    // dirty if any field has a non-empty value
    isDirty = Array.from(form.querySelectorAll("input, textarea, select")).some(
      (el) => (el.value || "").trim() !== ""
    );
  };

  form.addEventListener("input", markDirty);
  form.addEventListener("change", markDirty);
  form.addEventListener("reset", () => {
    isDirty = false;
  });

  window.addEventListener("beforeunload", (e) => {
    if (!isDirty || bypassLeavePrompt) return;
    e.preventDefault();
    e.returnValue = "";
  });

  form.addEventListener("submit", async (e) => {
    const updates = collectUpdates(form);
    e.preventDefault();
    const body = JSON.stringify(updates);

    if (!USER_ID) {
      alert("Missing user id in URL.");
      return;
    }

    try {
      const resp = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/update_user?id=" +
          USER_ID,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: USER_ID, updates }),
        }
      );
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Update failed: ${resp.status} ${txt}`);
      }
      isDirty = false;
      form.reset();
      alert("Information updated successfully.");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update information. Please try again.");
    }
  });
});
