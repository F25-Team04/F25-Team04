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
    fetch("https://api.example.com/data")
        .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok " + response.statusText);
        }
        generateOrgs(response)
    })
    .then(data => {
        console.log(data); // handle the JSON data
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}