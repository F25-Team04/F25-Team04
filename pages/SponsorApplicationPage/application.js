// This function accepts or declines the driver account application
// DRIVERID = id of the user that has applied for an account
// SPONSORID = id of the sponsor user that accepted of declined the account
// ACCEPTED = True if the application was accepted, False if the application was declined
async function ApplicationDecision(APPLICATION_ID, SPONSOR_ID, ACCEPTED, NOTE) {
  body = {
    application_id: APPLICATION_ID,
    sponsor: SPONSOR_ID,
    accepted: ACCEPTED,
    note: NOTE,
  };
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  fetch(
    "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/decision",
    requestOptions
  )
    .then((response) => {
      // Check if the request was successful (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Parse the response body as JSON
      return response.json();
    })
    .catch((error) => {
      // Handle any errors that occurred during the fetch operation
      console.error("There was a problem with the fetch operation:", error);
    });
}

const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

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

  // Pulls pending driver requests for the organization that the user belongs to
  async function GetPending() {
    try {
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/application?org=" +
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
            // Row wrapper
            const item = document.createElement("div");
            item.classList.add("pending-row");

            // Left: name
            const name = document.createElement("p");
            name.classList.add("driver-name");
            name.textContent = driver["First Name"] + " " + driver["Last Name"];

            // Right: buttons container
            const actions = document.createElement("div");
            actions.classList.add("pending-actions");

            const approve = document.createElement("button");
            approve.classList.add("btn", "approve-btn");
            approve.textContent = "Approve";

            const reject = document.createElement("button");
            reject.classList.add("btn", "reject-btn");
            reject.textContent = "Reject";

            actions.appendChild(approve);
            actions.appendChild(reject);

            // Build row
            item.appendChild(name);
            item.appendChild(actions);
            list.appendChild(item);

            // Event listener for approve button
            approve.addEventListener("click", async () => {
              const confirmed = confirm(
                "Are you sure you want to APPROVE this application?"
              );
              if (!confirmed) return;

              try {
                await ApplicationDecision(
                  driver["Application ID"],
                  USER_ID,
                  true
                );
                list.removeChild(item);
              } catch (error) {
                console.error("Error:", error);
              }
            });

            // Event listener for reject button
            reject.addEventListener("click", async () => {
              const confirmed = confirm(
                "Are you sure you want to REJECT this application?"
              );
              if (!confirmed) return;

              try {
                const note = prompt(
                  "Enter a rejection note to send to the driver (required):",
                  ""
                );

                // If user cancels the prompt, don't do anything
                if (note === null || note.trim() === "") {
                  alert("Rejection note is required.");
                  return;
                }

                await ApplicationDecision(
                  driver["Application ID"],
                  USER_ID,
                  false,
                  note
                );

                list.removeChild(item);
              } catch (error) {
                console.error("Error:", error);
              }
            });
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetPending();
};
