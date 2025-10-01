const endpoint = "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/about";
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
            const h = document.createElement("h3");
            const p = document.createElement("p");

            h.textContent = key;
            p.textContent = (value ?? "");
            
            dataContainer.appendChild(h);
            dataContainer.appendChild(p);
        });
    })
    .catch (error => {
        console.error("Error fetching data ", error);
    })