const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
const POINT_RULES_ENDPOINT = "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules";

window.onload = function () {
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

  const createDriver = document.createElement("a");
  createDriver.href =
    "../SponsorCreateDriver/SponsorCreateDriver.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  createDriver.textContent = "Create Driver";
  li.appendChild(createDriver);
  list.appendChild(li);

  const createSponsor = document.createElement("a");
  createSponsor.href =
    "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  createSponsor.textContent = "Create Sponsor";
  li.appendChild(createSponsor);
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
    "../points-manager/points-manager.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
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
  list.appendChild(li);

  GetRules();
}

// Gets the rules for the organization that the user belongs to
async function GetRules() {
  try {
    // Send POST request
    const response = await fetch(
      POINT_RULES_ENDPOINT + "?org=" + ORG_ID,
      { method: "GET" }
    );
    if (response.ok) {
      const result = await response.json();
      buildPointRulesDropdown(result);
    }
  } catch (error) {
    console.error("Error:", error);
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
    rules.forEach(r => {
        const opt = document.createElement("option");

        const ruleId = r["Rule ID"];
        const reason = r["Rule"];
        const points = r["Points"];

        const prefix = points > 0 ? "+" : "";

        opt.value = ruleId;
        opt.textContent = `${reason} (${prefix}${points})`;

        // Store points for later usage if needed
        opt.dataset.points = points;

        select.appendChild(opt);
    });

    // Custom option
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "Custom reason...";
    select.appendChild(customOption);

    // Custom reason input 
    const customWrapper = document.createElement("div");
    customWrapper.className = "custom-reason-wrapper";
    customWrapper.hidden = true;

    const customLabel = document.createElement("label");
    customLabel.htmlFor = "custom-reason-input";
    customLabel.textContent = "Custom reason";

    const customInput = document.createElement("input");
    customInput.id = "custom-reason-input";
    customInput.type = "text";
    customInput.placeholder = "Enter custom reason";

    customWrapper.appendChild(customLabel);
    customWrapper.appendChild(customInput);
    reasonContainer.appendChild(customWrapper);

    // Check for selected option
    select.addEventListener("change", function () {
      if (this.value === "") {
        this.style.color = "#6b7280";
      } else {
        this.style.color = "#000";

        if (this.value === "custom") {
          customWrapper.hidden = false;
        } else {
          customWrapper.hidden = true;
          customInput.value = "";
        }
      }
    });

    container.appendChild(reasonContainer);
}