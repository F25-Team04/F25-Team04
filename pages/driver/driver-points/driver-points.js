const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
  /* ------------------------------
     NAV BAR
  ------------------------------ */
  const linksList = document.getElementById("links");
  if (!linksList) {
    console.error("No #links element found for navbar");
  } else {
    // Update existing About link with id/org
    const firstAboutLink = linksList.querySelector("a");
    if (firstAboutLink) {
      firstAboutLink.href =
        "../../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;
    }

    // Add the rest of the driver nav links
    const navLi = document.createElement("li");

    function addNav(text, path, includeOrg = true) {
      const a = document.createElement("a");
      let url = path + "?id=" + encodeURIComponent(USER_ID || "");
      if (includeOrg && ORG_ID) {
        url += "&org=" + encodeURIComponent(ORG_ID);
      }
      a.href = url;
      a.textContent = text;
      navLi.appendChild(a);
    }

    addNav("Dashboard", "../../driver/driver.html");
    addNav("Notifications", "../../notificationsPage/notifs.html");
    addNav("Store", "../../DriverStorePage/DriverStore.html");
    addNav("Cart", "../../DriverCart/DriverCart.html");
    addNav("Orders", "../driver/driver-orders/driver-orders.html");
    addNav("Apply", "../../DriverApp/apply.html");
    addNav("Update Account Info", "../../driver-change-info/change-info.html");
    // Switch org usually doesn't need an org param, just the id
    addNav("Switch Organization", "../../DriverSelectOrg/DriverSelectOrg.html", false);

    linksList.appendChild(navLi);
  }

  /* ------------------------------
     POINT BALANCE
  ------------------------------ */
  async function GetPoints() {
    if (!USER_ID || !ORG_ID) {
      console.warn("Missing ?id= or ?org= in URL; cannot load point balance.");
      return;
    }

    try {
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" +
          encodeURIComponent(USER_ID),
        { method: "GET" }
      );

      if (!response.ok) {
        console.error("GetPoints failed:", await response.text());
        return;
      }

      const result = await response.json();
      const user = result && result[0];
      if (!user || !Array.isArray(user.Organizations)) {
        console.warn("No Organizations array found on user record.");
        return;
      }

      for (const org of user.Organizations) {
        if (String(org.org_id) === String(ORG_ID)) {
          const place = document.getElementById("points");
          if (place) place.innerText = org.spo_pointbalance;
          return;
        }
      }
    } catch (e) {
      console.error("Error loading points:", e);
    }
  }

  /* ------------------------------
     TRANSACTIONS LIST + CONTROLS
  ------------------------------ */
  const container = document.getElementById("transactions");
  if (!container) {
    console.error("No #transactions element found");
    return;
  }

  // Controls: sort + filter
  const controls = document.createElement("div");
  controls.className = "transaction-controls";

  const sortSelect = document.createElement("select");
  sortSelect.id = "transaction_sort";
  sortSelect.innerHTML = `
      <option value="date_desc">Date (newest)</option>
      <option value="date_asc">Date (oldest)</option>
      <option value="amt_desc">Amount (desc)</option>
      <option value="amt_asc">Amount (asc)</option>
  `;

  const filterSelect = document.createElement("select");
  filterSelect.id = "transaction_filter";
  filterSelect.innerHTML = `
      <option value="all">All</option>
      <option value="earn">Earnings (+)</option>
      <option value="deduct">Deductions (-)</option>
  `;

  controls.append(sortSelect, filterSelect);
  container.parentNode.insertBefore(controls, container);

  controls.addEventListener("change", () => {
    GetTransactions({ sort: sortSelect.value, filter: filterSelect.value });
  });

  /* ------------------------------
     TRANSACTIONS FETCH + RENDER
  ------------------------------ */
  async function GetTransactions({ sort = "date_desc", filter = "all" } = {}) {
    if (!USER_ID) {
      console.error("Missing ?id= in URL; cannot load transactions");
      return;
    }

    try {
      const response = await fetch(
        `https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=${encodeURIComponent(
          USER_ID
        )}` + "&org=" + encodeURIComponent(ORG_ID),
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      let rows = Array.isArray(data) ? data.slice() : [];

      // Filter by earnings/deductions
      if (filter === "earn") {
        rows = rows.filter((r) => Number(r.Amount) > 0);
      } else if (filter === "deduct") {
        rows = rows.filter((r) => Number(r.Amount) < 0);
      }

      // Sorting
      const comparators = {
        date_desc: (a, b) => new Date(b.Date) - new Date(a.Date),
        date_asc: (a, b) => new Date(a.Date) - new Date(b.Date),
        amt_desc: (a, b) => Number(b.Amount) - Number(a.Amount),
        amt_asc: (a, b) => Number(a.Amount) - Number(b.Amount),
      };

      rows = rows.sort(comparators[sort] || comparators.date_desc);

      // Clear existing list
      container.innerHTML = "";

      if (!rows.length) {
        const empty = document.createElement("p");
        empty.textContent = "No point transactions yet.";
        empty.style.color = "#6b7280";
        empty.style.padding = "12px 0";
        container.appendChild(empty);
        return;
      }

      // Render each transaction
      for (let i = 0; i < rows.length; i++) {
        const t = rows[i];
        const isLoss = Number(t.Amount) < 0;
        const isOrder = t.Giver == null;

        // Try both NewBalance and "New Balance" to be safe
        const rawNewBalance = t.NewBalance ?? t["New Balance"];
        const hasNewBalance =
          rawNewBalance !== undefined && rawNewBalance !== null && rawNewBalance !== "";

        const newBalanceNumber = hasNewBalance ? Number(rawNewBalance) : null;
        const formattedNewBalance =
          newBalanceNumber !== null && !Number.isNaN(newBalanceNumber)
            ? newBalanceNumber.toLocaleString("en-US")
            : null;

        const row = document.createElement("div");
        row.className = "transaction-row " + (isLoss ? "loss" : "gain");

        /* LEFT: ICON */
        const iconWrap = document.createElement("span");
        iconWrap.className = "transaction-icon-wrap";

        const icon = document.createElement("i");
        let iconClass, iconColor, bgColor;

        if (isOrder) {
          // Order
          iconClass = "bx bx-shopping-bag-alt";
          iconColor = "#3B82F6";
          bgColor = "rgba(59, 130, 246, 0.10)";
        } else if (isLoss) {
          // Deduction
          iconClass = "bx bx-trending-down";
          iconColor = "#EF4444";
          bgColor = "rgba(239, 68, 68, 0.10)";
        } else {
          // Earning
          iconClass = "bx bx-trending-up";
          iconColor = "#1ED760";
          bgColor = "rgba(30, 215, 96, 0.10)";
        }

        iconWrap.style.backgroundColor = bgColor;
        icon.className = "bx " + iconClass;
        icon.style.color = iconColor;
        icon.style.fontSize = "28px";

        iconWrap.appendChild(icon);

        /* MIDDLE: REASON + DATE */
        const content = document.createElement("div");
        content.className = "reason-date";

        const pReason = document.createElement("p");
        pReason.textContent = t.Reason ?? "";
        pReason.className = "transaction-reason";

        const pDate = document.createElement("p");
        pDate.textContent =
          t.Date &&
          new Date(t.Date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        pDate.className = "transaction-date";

        content.appendChild(pReason);
        content.appendChild(pDate);

        /* RIGHT: AMOUNT + NEW BALANCE HINT */
        const amountWrap = document.createElement("div");
        amountWrap.className = "transaction-amount-wrapper";

        const pAmount = document.createElement("h3");
        pAmount.className = "points-value";
        pAmount.textContent = isLoss ? t.Amount : "+" + t.Amount;
        pAmount.style.color = isLoss ? "#EF4444" : "#1ED760";
        pAmount.style.fontSize = "22px";

        amountWrap.appendChild(pAmount);

        // NEW: gray arrow + new balance value
        if (formattedNewBalance) {
          const balanceHint = document.createElement("span");
          balanceHint.className = "transaction-balance-hint";
          // Example: "+50" (main) and then "→ 1,250" in gray
          balanceHint.textContent = "→ " + formattedNewBalance;
          amountWrap.appendChild(balanceHint);
        }

        /* ASSEMBLE ROW */
        row.appendChild(iconWrap);
        row.appendChild(content);
        row.appendChild(amountWrap);

        if (i < rows.length - 1) {
          row.style.borderBottom = "1px solid #ddd";
        }

        container.appendChild(row);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  /* ------------------------------
     INITIAL LOAD
  ------------------------------ */
  GetPoints();
  GetTransactions({ sort: "date_desc", filter: "all" });
};
