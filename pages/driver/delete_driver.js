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

  const orders = document.createElement("a");
  orders.href = "driver-orders/driver-orders.html?id=" + USER_ID +"&org=" + ORG_ID;
  orders.textContent = "Orders";
  li.appendChild(orders);

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
    data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

    const area = document.getElementById("recentTransactions");

    const rows = data.slice(0, 3);
    const numTrans = rows.length;

    for (i = 0; i < numTrans; ++i) {
      const t = rows[i];
      const div = document.createElement("div");
      const isLoss = Number(t.Amount) < 0;

      // left: icon
      const icon_div = document.createElement("span");
      icon_div.style.display = "inline-flex";
      icon_div.style.alignItems = "center";
      icon_div.style.justifyContent = "center";
      icon_div.style.width = "36px";
      icon_div.style.height = "36px";
      icon_div.style.borderRadius = "50%";
      icon_div.style.backgroundColor = isLoss ? "rgba(239, 68, 68, 0.10)" : "rgba(30, 215, 96, 0.10)";

      const icon = document.createElement("i");
      icon.className = "bx " + (isLoss ? "bx-trending-down" : "bx-trending-up");
      icon.style.color = isLoss ? "#EF4444" : "#1ED760";
      icon.style.fontSize = "24px";
      icon_div.appendChild(icon);

      // middle: reason + date stacked
      const content = document.createElement("div");
      content.className = "reason-date";

      const pReason = document.createElement("p");
      pReason.textContent = t.Reason ?? "";
      pReason.style.color = "black";
      pReason.style.fontWeight = "500";
      content.appendChild(pReason);

      const pDate = document.createElement("p");
      pDate.textContent = new Date(t.Date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      pDate.style.color = "#6b7280";
      content.appendChild(pDate);

      // right: amount
      const pAmount = document.createElement("h3");
      pAmount.className = "points-value";
      pAmount.textContent = isLoss ? t.Amount : "+" + t.Amount;
      pAmount.style.color = isLoss ? "#EF4444" : "#1ED760";

      // assemble
      div.appendChild(icon_div);
      div.appendChild(content);
      div.appendChild(pAmount);

      // row styling
      div.className = isLoss ? "loss" : "gain";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.gap = "16px";
      div.style.padding = "16px";
      if (i < numTrans - 1) div.style.borderBottom = "1px solid #ddd";

      area.appendChild(div);
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
