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
    
    async function GetTransactions() {
        if (!USER_ID) {
            console.error("Missing ?id= in URL");
            return;
        }

        const container = document.getElementById("transactions");

        try {
            const response = await fetch(
            `https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=${encodeURIComponent(USER_ID)}`,
            { method: "GET" }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();
            data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

            container.innerHTML = "";

            for (let i = 0; i < data.length; i++) {
                const t = data[i];
                const div = document.createElement("div");

                // icon (left)
                const icon = document.createElement("i");
                const isLoss = Number(t.Amount) < 0;
                icon.className = "bx " + (isLoss ? "bx-trending-down" : "bx-trending-up");
                icon.style.color = isLoss ? "#EF4444" : "#1ED760";
                icon.style.fontSize = "24px";

                // text content (right)
                const content = document.createElement("div");

                const p1 = document.createElement("p");
                p1.textContent = "Amount: " + t.Amount;
                content.appendChild(p1);

                const p2 = document.createElement("p");
                p2.textContent = "Reason: " + (t.Reason ?? "");
                content.appendChild(p2);

                const p3 = document.createElement("p");
                p3.textContent = "Date: " + (t.Date ?? "");
                content.appendChild(p3);

                // assemble
                div.appendChild(icon);
                div.appendChild(content);

                // styling
                div.className = isLoss ? "loss" : "gain";
                div.style.display = "flex";
                div.style.alignItems = "center";
                div.style.gap = "16px";
                if (i % 2) div.style.backgroundColor = "#ddd";
                div.style.padding = "10px";

                container.appendChild(div);
            }

        }
        catch (error) {
            console.error("Error fetching transactions:", error);
        }
    }

    GetPoints()
    GetTransactions();

}