const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
let PointConversionRate = 0;

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

  const report = document.createElement("a");
  report.href =
    "../report_builder/report.html?id=" + USER_ID + "&org=" + ORG_ID;
  report.textContent = "Build Report";
  li.appendChild(report);

  document
    .getElementById("conversionForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // stop normal form submission

      // Gather form data
      const form = event.target;
      const formData = new FormData(form);
      console.log(form);
      const data = {
        org_id: ORG_ID,
        convert: formData.get("rate"),
      };
      try {
        // Send POST request
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/change_conversion",
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
          alert("Conversion Rate Change Successful");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
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
        const result = await response.json();
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          User = result[0];
          console.log(User);
          console.log(PointConversionRate);
          for (var org of result[0]["Organizations"]) {
            if (org["org_id"] == ORG_ID) {
              PointConversionRate = org["org_conversion_rate"];
              document.getElementById("conversion").innerText =
                "Current Conversion Rate: " + PointConversionRate;
              window.location.reload;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetUser();
};
