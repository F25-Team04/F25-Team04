window.onload = function() {

    // Takes in the list of the organizations and adds them to list 
    // for the user to select from when applying to an organization
    function generateOrgs(orgs) {
        const dropdown = document.getElementById("dropdown")
        orgs.forEach(org => {
            const option = document.createElement("option");
            option.value = org;
            option.textContent = org;
            dropdown.appendChild(option);
        });
    }
    
    // Gets the organizations registered that are already registered to the Server
    fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/organizations")
        .then(response => response.json())
        .then(orgs => {
            generateOrgs(orgs); // handle the JSON data
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });

    document.getElementById("signupForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop page reload
    
        // grab all inputs by their `name` attributes
        const form = event.target;
        const formData = new FormData(form);

        // convert FormData → plain object
        const data = Object.fromEntries(formData.entries());
        // Posts the signup form to the API
        const response = await fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/application", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }

        const ans = await response.json();

        if (ans.success === true) {
            window.location = "../../index.html";
        }    
        else {
            alert(ans.message);
        }

    })

}
