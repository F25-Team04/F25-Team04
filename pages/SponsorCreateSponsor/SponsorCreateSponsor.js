const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org")

window.onload = function() {
    var list = this.document.getElementById("links")
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../SponsorHomepage/SponsorHome.html?id=" + USER_ID + "&org=" + ORG_ID
    link.textContent = "Home"
    li.appendChild(link)
    const create = document.createElement("a");
    create.href = "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" + USER_ID + "&org=" + ORG_ID
    create.textContent = "Create Sponsor"
    li.appendChild(create)
    list.appendChild(li);
    const app = document.createElement("a");
    app.href = "../SponsorApplicationPage/sponsor-applications.html?id=" + USER_ID + "&org=" + ORG_ID
    app.textContent = "Applications"
    li.appendChild(app)
    list.appendChild(li);

    document.getElementById("create").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop normal form submission

        // Gather form data
        document.getElementById("org_id").value = ORG_ID
        const form = event.target;
        const formData = new FormData(form);
        try {
            
            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"  // IMPORTANT
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const result = await response.json();
                
                if (result.success == false) {
                    alert(result.message);
                }
                else if (result.success == true) {
                    GetUser(result.message);
                }
                

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    });
}