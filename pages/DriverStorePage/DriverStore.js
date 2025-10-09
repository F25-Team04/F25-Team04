const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
let User = {};
window.onload = function() {
    var list = this.document.getElementById("links")
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../driver/driver.html"
    link.textContent = "Home"
    li.appendChild(link)
    list.appendChild(li);

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
                    SetPoints(result[0]["Point Balance"])
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }
    function SetPoints(points) {
        let point = document.getElementById("points")
        point.innerText = "Current Points: " + points

    }
    GetUser()
}