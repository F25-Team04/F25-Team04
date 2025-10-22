const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function () {
    async function GetUserOrgs() {
        try {
        // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/products", {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    renderPage(result)
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }
    // GetUserOrgs();
    function renderPage(orgs) {
        list = document.getElementById("org-list")
        for (var org of orgs) {
            const org_div = document.createElement("div")
            org_div.id = "org_div"
            org_div.classList.add("org_div");
            
            var title = document.createElement("p")
            title.id = "org_title"
            title.innerText = org["org_name"]
            var currentPoints = document.createElement("p")
            currentPoints.id = "usr_points"
            currentPoints.textContent = "Current Points: " + org["points"]
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

            org_div.addEventListener("onclick", () => {
                window.location = "..\\DriverStorePage\\DriverStore.html?id=1&org=1"
            })
            org_div.appendChild(title);
            org_div.appendChild(currentPoints)
            list.appendChild(org_div)
        }
    }
    var orgs = [
        { org_name: "Clemson Animal Rescue", points: 1200 },
        { org_name: "Upstate Food Bank", points: 850 },
        { org_name: "Habitat for Humanity", points: 1560 },
        { org_name: "Greenville Clean Water Initiative", points: 970 },
        { org_name: "Red Cross Youth Volunteers", points: 1340 }
    ];

    renderPage(orgs)
};
