const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

let isDirty = false;
let bypassLeavePrompt = false;

function enhanceNav() {
  // Try the common nav UL; fall back to #links if present
  const navUl = document.querySelector("nav .nav-container ul") || document.getElementById("links");
  if (!navUl) return;

  const li = document.createElement("li");

  const dash = document.createElement("a");
  dash.href = "../driver/driver.html?id=" + USER_ID;
  dash.textContent = "Dashboard";
  li.appendChild(dash);

  const store = document.createElement("a");
  store.href = "../DriverStorePage/DriverStore.html?id=" + USER_ID;
  store.textContent = "Store";
  li.appendChild(store);

  navUl.appendChild(li);
}

async function collectUpdates(form) {
  const fd = new FormData(form);
  const updates = {};
  for (const [key, value] of fd.entries()) {
    const v = (value || "").trim();
    if (!v) continue;
    switch (key) {
      case "phone":   updates.phone = v; break;
      case "fname":   updates.firstName = v; break;
      case "lname":   updates.lastName = v; break;
      case "dln":     updates.driverLicenseNumber = v; break;
      case "address": updates.address = v; break;
      default: break;
    }
  }
  return updates;
}

window.addEventListener("DOMContentLoaded", () => {
  enhanceNav();

  const form = document.getElementById("changeInfoForm");
  if (!form) return;

  const markDirty = () => {
    // dirty if any field has a non-empty value
    isDirty = Array.from(form.querySelectorAll("input, textarea, select"))
      .some(el => (el.value || "").trim() !== "");
  };

  form.addEventListener("input", markDirty);
  form.addEventListener("change", markDirty);
  form.addEventListener("reset", () => { isDirty = false; });

  window.addEventListener("beforeunload", (e) => {
    if (!isDirty || bypassLeavePrompt) return;
    e.preventDefault();
    e.returnValue = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!USER_ID) {
      alert("Missing user id in URL.");
      return;
    }

    try {
      const resp = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/update_user?id=" + USER_ID, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: USER_ID, updates }),
      });
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
