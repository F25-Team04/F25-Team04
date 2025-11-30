const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
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

  function MakeRulesList(rules) {
    console.log(rules);
    const list = document.getElementById("rule-list");
    list.innerHTML = "";
    rules.forEach((rule) => {
      let item = document.createElement("div");
      let text = document.createElement("p");
      let point = document.createElement("p");
      item.id = "rule-row";
      point.id = "pointnum";
      text.id = "rule-descript";
      text.textContent = rule["Rule"];
      point.textContent = rule["Points"];
      item.textContent = rule.text;
      item.appendChild(text);
      item.appendChild(point);
      list.appendChild(item);
    });
  }
  // Gets the rules for the organization that the user belongs to
  async function GetRules() {
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules?org=" +
          ORG_ID,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        MakeRulesList(result);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

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

        const message = document.getElementById("welcome_message");
        message.textContent = "Welcome back, " + result["First Name"] + "!";

        document.getElementById("org").innerText = result["Organizations"][0]["org_name"];

        fillDashboard(result);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Pulls pending driver requests for the organization that the user belongs to
  async function GetPending() {
    try {
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?org=" +
          ORG_ID +
          "&status=pending",
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          const list = document.getElementById("application-list");
          list.innerHTML = "";
          result.forEach((driver) => {
            let item = document.createElement("div");
            let name = document.createElement("p");
            let approve = document.createElement("button");
            let reject = document.createElement("button");
            item.id = "pending-row";
            name.id = "driver-name";
            approve.id = "approve-button";
            reject.id = "reject-button";
            name.textContent = driver["First Name"] + " " + driver["Last Name"];
            approve.textContent = "Approve";
            reject.textContent = "Reject";

            // Append child elements to the item
            item.appendChild(name);
            item.appendChild(approve);
            item.appendChild(reject);

            // Append the item to the list
            list.appendChild(item);
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetUser();
  GetRules();
  GetPending();

  // Sends a new rule to a database
  document
    .getElementById("ruleForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // stop normal form submission

      // Gather form data
      const form = event.target;
      const formData = new FormData(form);
      console.log(form);
      const data = {
        org: ORG_ID,
        rule: formData.get("rule-reason"),
        points: formData.get("points"),
      };
      try {
        // Send POST request
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // IMPORTANT
            },
            body: JSON.stringify(data),
          }
        );
        if (response.ok) {
          const result = await response.json();
          console.log(result);
          GetRules();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });

  const createDriverBtn = document.getElementById("create-driver-btn");
  const createSponsorBtn = document.getElementById("create-sponsor-btn");
  const viewApplicationsBtn = document.getElementById("view-applications-btn");
  const pointsManagerBtn = document.getElementById("points-manager-btn");

  if (createDriverBtn) {
    createDriverBtn.addEventListener("click", function () {
      window.location.href =
        "../SponsorCreateDriver/SponsorCreateDriver.html?id=" +
        USER_ID +
        "&org=" +
        ORG_ID;
    });
  }

  if (createSponsorBtn) {
    createSponsorBtn.addEventListener("click", function () {
      window.location.href =
        "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" +
        USER_ID +
        "&org=" +
        ORG_ID;
    });
  }

  if (viewApplicationsBtn) {
    viewApplicationsBtn.addEventListener("click", function () {
      window.location.href =
        "../SponsorApplicationPage/sponsor-applications.html?id=" +
        USER_ID +
        "&org=" +
        ORG_ID;
    });
  }

  if (pointsManagerBtn) {
    pointsManagerBtn.addEventListener("click", function () {
      window.location.href =
        "../points-manager/points-manager.html?id=" +
        USER_ID +
        "&org=" +
        ORG_ID;
    });
  }
};

function fillDashboard(sponsorInfo) {
  place = document.getElementById("name");
  place.innerHTML = sponsorInfo["First Name"] + " " + sponsorInfo["Last Name"];
  place = document.getElementById("usrID");
  place.innerHTML = "ID: " + sponsorInfo["User ID"];
  place = document.getElementById("email");
  place.innerHTML = sponsorInfo["Email"];
  place = document.getElementById("role");
  place.innerHTML = sponsorInfo["Role"];
}
