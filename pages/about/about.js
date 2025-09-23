const endpoint = "https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/about";
const dataContainer = document.getElementById("db-data");

fetch(endpoint)
    .then (response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then (data => {
        Object.entries(data).forEach(([key, value]) => {
            const div = document.createElement("div");
            div.innerHTML = `
            <h3>${key}</h3>
            <p>${value}</p>
            `;
            dataContainer.appendChild(div);
        });
    })
    .catch (error => {
        console.error("Error fetching data ", error);
    })