// This function accepts or declines the driver account application
// DRIVERID = id of the user that has applied for an account
// SPONSORID = id of the sponsor user that accepted of declined the account
// ACCEPTED = True if the application was accepted, False if the application was declined
async function ApplicationDecision(APPLICATION_ID, SPONSOR_ID, ACCEPTED, NOTE) {
    body = {
        application_id: APPLICATION_ID,
        sponsor: SPONSOR_ID,
        accepted: ACCEPTED,
        note: NOTE
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
    fetch('https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/decision', requestOptions)
        .then(response => {
            // Check if the request was successful (status code 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Parse the response body as JSON
            return response.json();
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch operation
            console.error('There was a problem with the fetch operation:', error);
        });
}

const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
    // Navigation bar links
    var list = this.document.getElementById("links");
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../SponsorHomepage/SponsorHome.html?id=" + USER_ID + "&org=" + ORG_ID;
    link.textContent = "Home";
    li.appendChild(link);
    const create = document.createElement("a");
    create.href = "../SponsorCreateSponsor/SponsorCreateSponsor.html?id=" + USER_ID + "&org=" + ORG_ID;
    create.textContent = "Create Sponsor";
    li.appendChild(create);
    list.appendChild(li);
    const app = document.createElement("a");
    app.href = "../SponsorApplicationPage/sponsor-applications.html?id=" + USER_ID + "&org=" + ORG_ID;
    app.textContent = "Applications";
    li.appendChild(app);
    list.appendChild(li);

    // Pulls pending driver requests for the organization that the user belongs to
    async function GetPending() {
        try {
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/application?org=" + ORG_ID + "&status=pending", {
                method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    const list = document.getElementById("application-list")
                    list.innerHTML = "";
                    result.forEach(driver => {
                        let item = document.createElement("div");
                        let name = document.createElement("p");
                        let approve = document.createElement("button");
                        let reject = document.createElement("button");
                        item.id = "pending-row"
                        name.id = "driver-name";
                        approve.id = "approve-button";
                        reject.id = "reject-button";
                        name.textContent = driver["First Name"] + " " + driver["Last Name"];
                        approve.textContent = "Approve";
                        reject.textContent = "Reject";

                        // Append child elements to the item
                        item.appendChild(name);
                        item.appendChild(approve);
                        item.appendChild(reject);

                        // Append the item to the list
                        list.appendChild(item);

                        // Event listener for approve button
                        approve.addEventListener("click", async () => {
                            try {
                                await ApplicationDecision(driver["Application ID"], USER_ID, true);
                                list.removeChild(item);
                            } catch (error) {
                                console.error("Error:", error);
                            }
                        });

                        // Event listener for reject button
                        reject.addEventListener("click", async () => {
                            try {
                                const note = prompt("Enter a rejection note to send to the driver (required):", "");
                                if (note === null) {
                                    return;
                                }
                                ApplicationDecision(driver["Application ID"], USER_ID, false, note);
                            } catch (error) {
                                console.error("Error:", error);
                            }
                            list.removeChild(item);
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