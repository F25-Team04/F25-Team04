const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

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

  document
    .getElementById("create")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // stop normal form submission

      // Gather form data
      const form = event.target;
      const formData = new FormData(form);
      const body = Object.fromEntries(formData.entries());
      try {
        // Send POST request
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/sponsor",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // IMPORTANT
            },
            body: JSON.stringify(body),
          }
        );
        if (response.ok) {
          const result = await response.json();

          if (result.success == false) {
            alert(result.message);
          } else if (result.success == true) {
            alert("Sponsor created successfully.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  function generateQuestions(questions) {
    const dropdown = document.getElementById("questions");
    questions.forEach((question) => {
      const option = document.createElement("option");
      option.value = question;
      option.textContent = question;
      dropdown.appendChild(option);
    });
  }
  async function GetSecurityQuestion() {
    try {
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/security_questions"
      );

      if (!response.ok) {
        const msg = await response.text();
        alert(msg || "Unable to find an account with that email.");
        return;
      }

      const data = await response.json();
      console.log(data);
      generateQuestions(data);
    } catch (error) {
      console.error("Error fetching security question:", error);
      alert("An error occurred while looking up your account.");
    }
  }
  GetSecurityQuestion();
};
