const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const API_BASE = "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev";

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
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  var about = this.document.getElementById("about-page");
  about.href = "../about/about.html?id=" + USER_ID;
  const link = document.createElement("a");
  link.href = "../AdminHomepage/AdminHome.html?id=" + USER_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);
  const create = document.createElement("a");
  create.href = "../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
  create.textContent = "Create Sponsor";
  const create_org = document.createElement("a");
  create_org.href =
    "../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
  create_org.textContent = "Create Organization";
  const create_driver = document.createElement("a");
  create_driver.href = "../AdminCreateDriver/AdminCreateDriver.html?id=" + USER_ID;
  create_driver.textContent = "Create Driver";
  const create_admin = document.createElement("a");
  create_admin.href = "../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
  create_admin.textContent = "Create Admin";
  const bulk_load = document.createElement("a");
  bulk_load.href = "../AdminBulkLoad/AdminBulkLoad.html?id=" + USER_ID;
  bulk_load.textContent = "Bulk Loader";

  const impersonator = document.createElement("a");
  impersonator.href = "../AdminImpersonator/AdminImpersonator.html?id=" + USER_ID;
  impersonator.textContent = "Impersonation";

  li.appendChild(create_admin);
  li.appendChild(create_driver);
  li.appendChild(create);
  li.appendChild(create_org);
  li.appendChild(bulk_load);
  li.appendChild(impersonator);
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
    }
  });

  SponsorButton = this.document.getElementById("create-sponsor");
  SponsorButton.addEventListener("click", function () {
    window.location =
      "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" +
      USER_ID +
      "&org=" +
      ORG_ID;
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const orgSelect = document.getElementById("org");
  fetch(`${API_BASE}/organizations?include_ids=1`)
    .then((r) => r.json())
    .then((arr) => {
      if (!Array.isArray(arr)) return;
      arr.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.org_id;
        opt.textContent = o.org_name;
        orgSelect.appendChild(opt);
      });
    })
    .catch(() => {
    });
});
