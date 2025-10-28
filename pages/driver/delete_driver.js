const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
  // Dollars conversion state;
  let DollarsPerPoint = null; // dollars for 1 point
  let CurrentPoints = null;

  function formatUSD(amount) {
    return amount.toLocaleString(undefined, { style: "currency", currency: "USD" });
  }

  function updateBalanceDollars() {
    const dollarsEl = document.getElementById("balance-dollars");
    if (!dollarsEl || CurrentPoints == null || DollarsPerPoint == null) return;
    const dollars = Number(CurrentPoints) * Number(DollarsPerPoint);
    dollarsEl.textContent = `(${formatUSD(dollars)})`;
  }

  async function fetchConversion(orgId) {
    if (!orgId) return;
    try {
      const resp = await fetch(`https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/organization_pts_conversion?org_id=${encodeURIComponent(orgId)}`, { method: "GET" });
      if (!resp.ok) {
        console.error("Conversion fetch failed:", resp.status);
        return;
      }
      // Prefer JSON with org_conversionrate; fallback to plain text number
      let rate = null;
      const ctype = resp.headers.get("content-type") || "";
      if (ctype.includes("application/json")) {
        const data = await resp.json();
        rate = parseFloat(
          data.org_conversionrate ??
          data.convert ??
          data.rate ??
          data.value
        );
      } else {
        rate = parseFloat((await resp.text()).trim());
      }
      if (!Number.isFinite(rate)) {
        console.warn("Invalid conversion rate returned for org:", orgId);
        return;
      }
      DollarsPerPoint = rate; // dollars per point
      updateBalanceDollars();
    } catch (e) {
      console.error("Error fetching conversion:", e);
    }
  }

  fetchConversion(ORG_ID);

  var list = this.document.getElementById("links");
  const li = document.createElement("li");

  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;

  const link = document.createElement("a");
  link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);

  const store = document.createElement("a");
  store.href =
    "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
  store.textContent = "Store";
  li.appendChild(store);
  list.appendChild(li);

  const account = document.createElement("a");
  account.href =
    "../driver-change-info/change-info.html?id=" + USER_ID + "&org=" + ORG_ID;
  account.textContent = "Update Account Info";
  li.appendChild(account);

  const switchOrg = document.createElement("a");
  switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
  switchOrg.textContent = "Switch Organization";
  li.appendChild(switchOrg);

  const apply = document.createElement("a");
  apply.href = "../DriverApp/apply.html?id=" + USER_ID + "&org=" + ORG_ID;
  apply.textContent = "Apply";
  li.appendChild(apply);
  list.appendChild(li);

  list.appendChild(li);

  const pointsEl = document.querySelector(".points-header");
  pointsEl.href = `driver-points/driver-points.html?id=${encodeURIComponent(USER_ID)}` + (`&org=${encodeURIComponent(ORG_ID)}`);

  const ordersEl = document.querySelector(".orders-header");
  ordersEl.href = `driver-orders/driver-orders.html?id=${encodeURIComponent(USER_ID)}` + (`&org=${encodeURIComponent(ORG_ID)}`);

  function fillScreen(driverInfo) {
    place = document.getElementById("name");
    place.innerHTML = driverInfo["First Name"] + " " + driverInfo["Last Name"];
    place = document.getElementById("usrID");
    place.innerHTML = "ID: " + driverInfo["User ID"];
    place = document.getElementById("email");
    place.innerHTML = driverInfo["Email"];
    place = document.getElementById("role");
    place.innerHTML = driverInfo["Role"];
    for (var org of driverInfo["Organizations"]) {
      if (org["org_id"] == ORG_ID) {
        place = document.getElementById("org");
        place.innerHTML = org["org_name"];
        place = document.getElementById("balance");
        place.innerHTML = org["spo_pointbalance"];
        place = document.getElementById("balance-dollars");
        CurrentPoints = Number(org["spo_pointbalance"] || 0);
        updateBalanceDollars();
      }
    }

    document.getElementById("greeting").textContent = `${getGreeting()}, ${
      driverInfo["First Name"]
    }!`;
  }

  function fillTransactions(transactionInfo) {
    const data = transactionInfo;
    area = document.getElementById("recentTransactions");
    numTrans = data.length;

    for (i = 0; i < numTrans; ++i) {
      const newDiv = document.createElement("div");

      const newp = document.createElement("p");
      newp.textContent = "Amount: " + data[i]["Amount"];
      newDiv.appendChild(newp);
      const newp2 = document.createElement("p");
      newp2.textContent = "Reason: " + data[i]["Reason"];
      newDiv.appendChild(newp2);
      const newp4 = document.createElement("p");
      newp4.textContent = "Date:  " + data[i]["Date"];
      newDiv.appendChild(newp4);

      newDiv.id = "childDiv";
      if (data[i]["Amount"] < 0) {
        newDiv.className = "loss";
      } else {
        newDiv.className = "gain";
      }

      if (i % 2) {
        newDiv.style.backgroundColor = "lightblue";
      }
      newDiv.style.padding = "10px";

      area.appendChild(newDiv);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  go();

  async function go() {
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
        const text1 = result[0].Email;
        fillScreen(result[0]);
        updateBalanceDollars();
      } else {
        //alert("Password or Email is Incorrect  ");
        const text = await response.text();
        alert(text);
      }
    } catch (error) {
      alert("EROR " + error);
    }

    try {
      const response2 = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=" +
          USER_ID,
        {
          method: "GET",
        }
      );

      if (response2.ok) {
        const result2 = await response2.json();
        fillTransactions(result2);
      } else {
        const text = await response.text();
        alert(text);
      }
    } catch (error) {
      alert("EROR " + error);
    }

    const place = document.getElementById("test2");
  }

  document
    .getElementById("showLoss")
    .addEventListener("change", async function (event) {
      event.preventDefault();

      let dval = "";

      if (event.target.checked) {
        dval = "none";
      } else {
        dval = "block";
      }

      tester = document.getElementsByClassName("loss");
      for (let x = 0; x < tester.length; ++x) {
        tester[x].style.display = dval;
      }
    });

  document
    .getElementById("delete")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const pop = document.getElementById("test");
      pop.style.display = "block";
      //alert("SOmething");
    });

  document
    .getElementById("test")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      // Gather form data
      const form = event.target;
      const data = {
        id: form.usrID.value,
      };

      console.log(data);
      try {
        // Send POST request

        const response = await fetch(
          "https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/user?id=" +
            data.id,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          //alert("THERE DAMN");
          const text = await response.text();
          alert(text);
        } else {
          //alert("Password or Email is Incorrect  ");
          const text = await response.text();
          alert(text);
        }
      } catch (error) {
        alert("EROR " + error);
      }
    });
};
