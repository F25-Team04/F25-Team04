// This function accepts or declines the driver account application
// DRIVERID = id of the user that has applied for an account
// SPONSORID = id of the sponsor user that accepted of declined the account
// ACCEPTED = True if the application was accepted, False if the application was declined
async function ApplicationDecision(DRIVER_ID, SPONSOR_ID, ACCEPTED) {
    body = {
        driver: DRIVER_ID,
        sponsor: SPONSOR_ID,
        accepted: ACCEPTED
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }
    fetch('https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/decisions', requestOptions)
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
    // Gets the user information based on the user id in the query params so that the welcome message will be personalized
    async function GetUser() {
        try {
            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + USER_ID, {
                method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    message = document.getElementById("welcome_message")
                    message.textContent = "Welcome " + result["First Name"] + "!"
                }
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Pulls pending driver requests for the organization that the user belongs to
    async function GetPending() {
        try {
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?org=" + ORG_ID + "&status=pending", {
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
                        approve.classList.add("btn green-btn");
                        reject.id = "reject-button";
                        reject.classList.add("btn white-btn");
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
                                await ApplicationDecision(driver["User ID"], USER_ID, true);
                                list.removeChild(item);
                            } catch (error) {
                                console.error("Error:", error);
                            }
                        });

                        // Event listener for reject button
                        reject.addEventListener("click", async () => {
                            try {
                                ApplicationDecision(driver["User ID"], USER_ID, false);
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
    GetUser();
    GetRules();
    GetPending();
};