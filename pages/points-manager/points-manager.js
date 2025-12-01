const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
const POINT_RULES_ENDPOINT =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules";
const DRIVER_ENDPOINT =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver";
const POINT_ADJUSTMENT_ENDPOINT =
  "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_adjustment";

let SELECTED_DRIVER_ID = null;
let SELECTED_DRIVER_POINTS = null;

window.onload = function () {
  // Nav
  // Nav
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  var about = this.document.getElementById("about-page");
  about.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;
  const link = document.createElement("a");
  link.href =
    "../SponsorHomepage/SponsorHome.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);

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
    "../SponsorBulkLoad/SponsorBulkLoad.html?id=" + USER_ID + "&org=" + ORG_ID;
  bulk.textContent = "Bulk Loader";
  li.appendChild(bulk);

  const impersonator = document.createElement("a");
  impersonator.href =
    "../SponsorImpersonator/SponsorImpersonator.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  impersonator.textContent = "Impersonation";
  li.appendChild(impersonator);

  list.appendChild(li);

  GetRules();
  FetchDrivers();
  showEmptyPointsEditor();
  setupApplyPointsHandler();
};

// Gets the rules for the organization that the user belongs to
async function GetRules() {
  try {
    // Send POST request
    const response = await fetch(POINT_RULES_ENDPOINT + "?org=" + ORG_ID, {
      method: "GET",
    });
    if (response.ok) {
      const result = await response.json();
      buildPointRulesDropdown(result);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function FetchDrivers() {
  try {
    const response = await fetch(DRIVER_ENDPOINT + "?org=" + ORG_ID, {
      method: "GET",
    });

    if (!response.ok) {
      console.error("Failed to fetch drivers, status:", response.status);
      return;
    }

    const drivers = await response.json();
    buildDriversList(drivers);
  } catch (err) {
    console.error("Error fetching drivers:", err);
  }
}

function buildPointRulesDropdown(rules) {
  const container = document.getElementById("reason-dropdown");
  if (!container) return;

  container.innerHTML = ""; // clear anything inside

  const reasonContainer = document.createElement("div");
  reasonContainer.className = "reason-container";

  const label = document.createElement("label");
  label.htmlFor = "rule-select";
  label.textContent = "Reason for points change";
  reasonContainer.appendChild(label);

  const select = document.createElement("select");
  select.id = "rule-select";
  select.name = "rule-id";
  select.required = true;
  reasonContainer.appendChild(select);

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a reason";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  // Populate rule options
  rules.forEach((r) => {
    const opt = document.createElement("option");

    const ruleId = r["Rule ID"];
    const reason = r["Rule"];
    const points = r["Points"];

    const prefix = points > 0 ? "+" : "";

    opt.value = ruleId;
    opt.textContent = `${reason} (${prefix}${points})`;

    // Store points for later usage
    opt.dataset.points = points;

    select.appendChild(opt);
  });

  // Custom option
  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = "Custom reason...";
  select.appendChild(customOption);

  container.appendChild(reasonContainer);

  const customWrapper = document.getElementById("custom-reason-wrapper");
  const customInput = document.getElementById("custom-reason-input");
  const pointsInput = document.getElementById("points-value");
  const applyBtn = document.getElementById("apply-points-btn");

  if (customWrapper) {
    customWrapper.hidden = true;
    customWrapper.style.display = "none";
  }
  if (applyBtn) {
    applyBtn.disabled = true;
  }

  function validateForm() {
    if (!applyBtn) return;

    let valid = true;
    const ruleValue = select.value;
    const customReasonText = customInput ? customInput.value.trim() : "";
    const pointsValue = pointsInput ? pointsInput.value.trim() : "";

    // No rule selected: invalid
    if (!ruleValue) {
      valid = false;
    }

    // Custom reason selected: must type text
    if (ruleValue === "custom" && customReasonText === "") {
      valid = false;
    }

    // Points must exist (either autofilled or manual)
    if (!pointsValue) {
      valid = false;
    }

    applyBtn.disabled = !valid;
  }

  // Check for selected option
  select.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const optionPoints = selectedOption ? selectedOption.dataset.points : null;

    // Handle custom reason show/hide
    if (this.value === "custom") {
      customWrapper.hidden = false;
      customWrapper.style.display = "flex";
    } else {
      customWrapper.hidden = true;
      customWrapper.style.display = "none";
      customInput.value = "";
    }

    // Handle points autofill and lock/unlock
    if (this.value && this.value !== "custom") {
      // Autofill and lock
      pointsInput.value = optionPoints;
      pointsInput.disabled = true;
    } else {
      // Allow manual entry
      pointsInput.disabled = false;
      pointsInput.value = "";
    }

    validateForm();
  });

  if (customInput) {
    customInput.addEventListener("input", validateForm);
  }
  if (pointsInput) {
    pointsInput.addEventListener("input", validateForm);
  }

  validateForm();
}

function buildDriversList(drivers) {
  const listContainer = document.getElementById("drivers-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  if (!Array.isArray(drivers) || drivers.length === 0) {
    listContainer.textContent = "No drivers found for this organization.";
    return;
  }

  drivers.forEach((driver) => {
    const userId = driver["User ID"];
    const firstName = driver["First Name"];
    const lastName = driver["Last Name"];
    const points = driver["Points"];

    // Card container for each driver
    const card = document.createElement("button");
    card.className = "driver-card";
    card.type = "button";

    // Store data for later use
    card.dataset.userId = userId;
    card.dataset.points = points;

    // Card content
    // Left: driver icon + name + user ID
    const driverInfo = document.createElement("div");
    driverInfo.className = "driver-info";

    // Icon block
    const iconEl = document.createElement("i");
    iconEl.className = "bxr bx-user driver-icon";

    // Text block: name + ID
    const textWrapper = document.createElement("div");
    textWrapper.className = "driver-text";

    const nameEl = document.createElement("h3");
    nameEl.className = "driver-name";
    nameEl.textContent = `${firstName} ${lastName}`;

    const idEl = document.createElement("p");
    idEl.className = "driver-id";
    idEl.textContent = `ID: ${userId}`;

    textWrapper.appendChild(nameEl);
    textWrapper.appendChild(idEl);

    driverInfo.appendChild(iconEl);
    driverInfo.appendChild(textWrapper);

    // Right: points
    const pointsEl = document.createElement("div");
    pointsEl.className = "driver-points";

    const starIcon = document.createElement("i");
    starIcon.className = "bxr  bxs-star points-icon";

    pointsEl.appendChild(starIcon);

    const pointsNum = document.createElement("h3");
    pointsNum.textContent = points;
    pointsEl.appendChild(pointsNum);

    card.appendChild(driverInfo);
    card.appendChild(pointsEl);

    // When clicked, update the points editor
    card.addEventListener("click", () => {
      showPointsEditor();

      const nameHeader = document.getElementById("name");
      const empIdEl = document.getElementById("emp-id");
      const pointsEl = document.getElementById("points");

      if (nameHeader) nameHeader.textContent = `${firstName} ${lastName}`;
      if (empIdEl) empIdEl.textContent = `ID: ${userId}`;
      if (pointsEl) pointsEl.textContent = points;

      // Track driver info
      SELECTED_DRIVER_ID = userId;
      SELECTED_DRIVER_POINTS = points;

      // Clear selection from all cards
      document.querySelectorAll(".driver-card").forEach((c) => {
        c.classList.remove("selected");
      });

      // Mark this card as selected
      card.classList.add("selected");
    });

    listContainer.appendChild(card);
  });
}

function showEmptyPointsEditor() {
  const emptyBox = document.getElementById("points-empty");
  const editorBox = document.getElementById("points-editor");

  if (emptyBox) emptyBox.style.display = "flex";
  if (editorBox) editorBox.style.display = "none";
}

function showPointsEditor() {
  const emptyBox = document.getElementById("points-empty");
  const editorBox = document.getElementById("points-editor");

  if (emptyBox) emptyBox.style.display = "none";
  if (editorBox) editorBox.style.display = "flex";
}

function setupApplyPointsHandler() {
  const applyBtn = document.getElementById("apply-points-btn");
  if (!applyBtn) return;

  applyBtn.addEventListener("click", async () => {
    const pointsInput = document.getElementById("points-value");
    const ruleSelect = document.getElementById("rule-select");
    const customInput = document.getElementById("custom-reason-input");

    if (!SELECTED_DRIVER_ID) {
      alert("Please select a driver first.");
      return;
    }
    if (!ruleSelect || !ruleSelect.value) {
      alert("Please select a reason.");
      return;
    }

    const ruleValue = ruleSelect.value;

    // Get delta
    let delta;
    if (ruleValue === "custom") {
      delta = parseInt(pointsInput.value, 10);
    } else {
      const selectedOption = ruleSelect.options[ruleSelect.selectedIndex];
      delta = parseInt(selectedOption.dataset.points, 10);
    }

    if (isNaN(delta)) {
      alert("Points amount must be a valid number.");
      return;
    }

    // Get reason
    let reason;
    if (ruleValue === "custom") {
      reason = customInput?.value.trim() || "Custom adjustment";
    } else {
      const selectedOption = ruleSelect.options[ruleSelect.selectedIndex];
      reason = selectedOption
        ? selectedOption.textContent
        : "Rule-based adjustment";
    }

    const payload = {
      driver_id: SELECTED_DRIVER_ID,
      sponsor_id: USER_ID,
      delta: delta,
      reason: reason,
    };

    // Prevent double click
    applyBtn.disabled = true;

    try {
      const response = await fetch(POINT_ADJUSTMENT_ENDPOINT, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(
          "Failed to adjust points: " + (result.message || response.status)
        );
        return;
      }

      // We need to update the page on load now
      const newBalance = result.new_balance ?? result.newBalance ?? null;
      if (newBalance !== null) {
        // Update right-side panel
        const pointsHeader = document.getElementById("points");
        if (pointsHeader) pointsHeader.textContent = newBalance;

        // Update selected card
        const selectedCard = document.querySelector(
          `.driver-card[data-user-id="${SELECTED_DRIVER_ID}"]`
        );
        if (selectedCard) {
          const cardPointsNum = selectedCard.querySelector(
            ".driver-points h3, .driver-points span"
          );
          if (cardPointsNum) cardPointsNum.textContent = newBalance;
          selectedCard.dataset.points = newBalance;
        }

        SELECTED_DRIVER_POINTS = newBalance;
      }

      if (ruleValue === "custom") {
        if (pointsInput) pointsInput.value = "";
        if (customInput) customInput.value = "";
      }

      alert("Points updated successfully.");
    } catch (err) {
      console.error("Error sending point adjustment:", err);
      alert("An error occurred while updating points.");
    } finally {
      applyBtn.disabled = false;
    }
  });
}
