const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID  = params.get("org");

window.onload = function() {
    var list = this.document.getElementById("links")
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `../driver.html?id=${encodeURIComponent(USER_ID)}&org=${encodeURIComponent(ORG_ID)}`;
    link.textContent = "Dashboard"
    li.appendChild(link)
    const store = document.createElement("a");
    store.href = `../../DriverStorePage/DriverStore.html?id=${encodeURIComponent(USER_ID)}&org=${encodeURIComponent(ORG_ID)}`;
    store.textContent = "Store"
    li.appendChild(store)
    list.appendChild(li);

    async function GetPoints() {
        try {
        // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + USER_ID, {
            method: "GET",
            });
            if (!response.ok) return;

            const result = await response.json();

            for (var org of result[0]["Organizations"]) {
                if (org["org_id"] == ORG_ID) {
                    var place = document.getElementById("points");
                    if (place) place.innerText = org["spo_pointbalance"];
                    return;
                }
            }
        }
        catch (e) {
            console.error("Error:", e);
        }
    }

    const container = document.getElementById("transactions");
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "12px";
    controls.style.alignItems = "center";
    controls.style.margin = "8px 0 12px";

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
    
    async function GetTransactions({ sort = "date_desc", filter = "all" } = {}) {
        if (!USER_ID) {
            console.error("Missing ?id= in URL");
            return;
        }

        try {
            const response = await fetch(
            `https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=${encodeURIComponent(USER_ID)}`,
            { method: "GET" }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();

            let rows = data.slice();
            if (filter === "earn") rows = rows.filter(r => Number(r.Amount) > 0);
            if (filter === "deduct") rows = rows.filter(r => Number(r.Amount) < 0);

            const comparators = {
                date_desc: (a, b) => new Date(b.Date) - new Date(a.Date),
                date_asc: (a, b) => new Date(a.Date) - new Date(b.Date),
                amt_desc: (a, b) => Number(b.Amount) - Number(a.Amount),
                amt_asc: (a, b) => Number(a.Amount) - Number(b.Amount),
            };
            rows = rows.slice().sort(comparators[sort] || comparators.date_desc);

            container.innerHTML = "";

            for (let i = 0; i < rows.length; i++) {
                const t = rows[i];
                const div = document.createElement("div");
                const isLoss = Number(t.Amount) < 0;
                const isOrder = t.Giver == null;

                // left: icon
                const icon_div = document.createElement("span");
                icon_div.style.display = "inline-flex";
                icon_div.style.alignItems = "center";
                icon_div.style.justifyContent = "center";
                icon_div.style.width = "40px";
                icon_div.style.height = "40px";
                icon_div.style.borderRadius = "50%";

                let bg, iconClass, iconColor;

                // If it's an order
                if (isOrder) {
                    bg = "rgba(59, 130, 246, 0.10)";
                    iconClass = "bx bx-shopping-bag-alt";
                    iconColor = "#3B82F6";
                }
                // If it's a deduction
                else if (isLoss) {
                    bg = "rgba(239, 68, 68, 0.10)";
                    iconClass = "bx bx-trending-down";
                    iconColor = "#EF4444";
                }
                // If it's an earning
                else {
                    bg = "rgba(30, 215, 96, 0.10)";
                    iconClass = "bx bx-trending-up";
                    iconColor = "#1ED760";
                }

                icon_div.style.backgroundColor = bg;

                const icon = document.createElement("i");
                icon.className = "bx " + iconClass;
                icon.style.color = iconColor;
                icon.style.fontSize = "28px";
                icon_div.appendChild(icon);

                // middle: reason + date stacked
                const content = document.createElement("div");
                content.className = "reason-date";

                const pReason = document.createElement("p");
                pReason.textContent = t.Reason ?? "";
                pReason.style.fontWeight = "500";
                content.appendChild(pReason);

                const pDate = document.createElement("p");
                pDate.textContent = new Date(t.Date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }) ?? "";
                pDate.style.color = "#6b7280";
                content.appendChild(pDate);

                // right: amount
                const pAmount = document.createElement("h3");
                pAmount.className = "points-value";
                pAmount.textContent = isLoss ? t.Amount : "+" + t.Amount;
                pAmount.style.color = isLoss ? "#EF4444" : "#1ED760";
                pAmount.style.fontSize = "22px"

                // assemble
                div.appendChild(icon_div);
                div.appendChild(content);
                div.appendChild(pAmount);

                // styling
                div.className = isLoss ? "loss" : "gain";
                div.style.display = "flex";
                div.style.alignItems = "center";
                div.style.gap = "16px";
                div.style.padding = "16px";
                if (i < rows.length - 1) div.style.borderBottom = "1px solid #ddd";

                container.appendChild(div);
            }

        }
        catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }

    GetPoints()
    GetTransactions({ sort: sortSelect.value, filter: filterSelect.value });

}