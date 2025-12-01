const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function () {
  var list = this.document.getElementById("links");
  const li = document.createElement("li");
  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID;
  const apply = document.createElement("a");
  apply.href = "../DriverApp/apply.html?id=" + USER_ID;
  apply.textContent = "Apply";
  li.appendChild(apply);
  list.appendChild(li);

  async function GetUserOrgs() {
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
          console.log(result);
          renderPage(result[0]["Organizations"]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async function leaveOrganization(orgID, cardEL) {
    try {
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/leave_organization",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driver_id: USER_ID, org_id: orgID }),
        }
      );
      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Leave failed: ${response.status} ${message}`);
      }
      cardEL.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to leave organization. Please try again.");
    }
  }
  function AddEffectsToButtons(org_div) {
    org_div.style.backgroundColor = "white";
    org_div.style.transform = "scale(1)";
    org_div.style.boxShadow = "none";
    org_div.style.transition = "transform 120ms ease, box-shadow 120ms ease";
    org_div.style.willChange = "transform";

    org_div.addEventListener("mouseenter", () => {
      org_div.style.backgroundColor = "#ffffffff";
      org_div.style.transform = "scale(1.05)";
      org_div.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    });

    org_div.addEventListener("mouseleave", () => {
      org_div.style.backgroundColor = "#ffffffff";
      org_div.style.transform = "scale(1)";
      org_div.style.boxShadow = "none";
    });
  }

  GetUserOrgs();

  function renderPage(orgs) {
    list = document.getElementById("org-list");
    console.log(orgs);
    const applicationLink = document.createElement("p");
    if (orgs.length == 0) {
      const header = document.getElementById("header");
      header.innerText = "You Are Not Currently Registered To An Organization";
      const org_div = document.createElement("div");
      org_div.id = "org_div";
      org_div.classList.add("org_div");

      var title = document.createElement("p");
      title.id = "org_title";
      title.innerText = "Apply To Get Started";
      AddEffectsToButtons(org_div);
      org_div.addEventListener("click", () => {
        // This is going to lead to the driver application page
        window.location = "..\\DriverApp\\apply.html?id=" + USER_ID;
      });
      org_div.appendChild(title);
      list.appendChild(org_div);
    }
    for (let org of orgs) {
      const org_div = document.createElement("div");
      org_div.id = "org_div";
      org_div.classList.add("org_div");

      var title = document.createElement("p");
      title.id = "org_title";
      title.innerText = org["org_name"];

      const points_div = document.createElement("div");
      points_div.className = "usr_points";

      const pointsLabel = document.createElement("p");
      pointsLabel.className = "points-label";
      pointsLabel.textContent = "Current Points:";

      const pointsValue = document.createElement("p");
      pointsValue.className = "points-value";
      pointsValue.textContent = org["spo_pointbalance"];

      points_div.appendChild(pointsLabel);
      points_div.appendChild(pointsValue);

      AddEffectsToButtons(org_div);

      // Leave button
      const leaveBtn = document.createElement("button");
      leaveBtn.className = "leave-btn";
      leaveBtn.textContent = "Leave";
      leaveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        const ok = confirm(`Leave ${org["org_name"]}?`);
        if (!ok) return;
        leaveBtn.disabled = true;
        leaveOrganization(org["org_id"], org_div).finally(() => {
          leaveBtn.disabled = false;
        });
      });

      org_div.addEventListener("click", () => {
        // Gonna be the application page eventually
        window.location =
          "..\\driver\\driver.html?id=" + USER_ID + "&org=" + org["org_id"];
      });
      org_div.appendChild(title);
      org_div.appendChild(points_div);
      org_div.appendChild(leaveBtn);
      list.appendChild(org_div);
    }
  }
};
