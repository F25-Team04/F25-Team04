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

  const bulk = document.createElement("a");
  bulk.href =
    "../SponsorBulkLoad/SponsorBulkLoad.html?id=" + USER_ID + "&org=" + ORG_ID;
  bulk.textContent = "Bulk Loader";
  li.appendChild(bulk);

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
};
