const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  var about = this.document.getElementById("about-page");
  about.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;
  const link = document.createElement("a");
  link.href =
    "../SponsorHomepage/SponsorHome.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Home";
  li.appendChild(link);
  const create = document.createElement("a");
  create.href =
    "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  create.textContent = "Create Sponsor";
  li.appendChild(create);
  list.appendChild(li);
  const app = document.createElement("a");
  app.href =
    "../SponsorApplicationPage/sponsor-applications.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  app.textContent = "Applications";
  li.appendChild(app);
  const change = document.createElement("a");
  change.href =
    "../SponsorChangeConversionRate/ChangeConversionRate.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  change.textContent = "Change Point Conversion Rate";
  li.appendChild(change);
  list.appendChild(li);

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
