const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

function generateQuestions(questions) {
  const dropdown = document.getElementById("questions");
  if (!dropdown) return;

  questions.forEach((question) => {
    const option = document.createElement("option");
    option.value = question;
    option.textContent = question;
    dropdown.appendChild(option);
  });
}

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

  const change = document.createElement("a");
  change.href =
    "../SponsorChangeConversionRate/ChangeConversionRate.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  change.textContent = "Change Point Conversion Rate";
  li.appendChild(change);
  list.appendChild(li);

  // Fetch security questions
  fetch(
    "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/security_questions"
  )
    .then((response) => response.json())
    .then((questions) => {
      generateQuestions(questions);
    })
    .catch((error) => {
      console.error(
        "There was a problem with the fetch operation (security questions):",
        error
      );
    });

  // Form submit
 const form = document.getElementById("create");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault(); // stop page reload

    const formData = new FormData(form);

    // Add org from query string as `org` so it matches Lambda
    formData.set("org", ORG_ID);

    // Convert FormData -> plain object
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver",
        {
          method: "POST",
          // headers: {
          //   "Content-Type": "application/json",
          // },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        console.error("Request failed with status:", response.status);
        alert("Failed to create driver user. Please try again.");
        return;
      }

      const ans = await response.json();

      if (ans.success === false) {
        alert(ans.message || "Failed to create driver user.");
      } else {
        alert(ans.message || "Driver user created successfully.");
        window.location.href =
          "../SponsorHomepage/SponsorHome.html?id=" +
          USER_ID +
          "&org=" +
          ORG_ID;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the driver user.");
    }
  });
};