const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function() {
    var list = this.document.getElementById("links")
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = "../driver/driver.html?id=" + USER_ID 
    link.textContent = "Dashboard"
    li.appendChild(link)

    const store = document.createElement("a");
    store.href = "../DriverStorePage/DriverStore.html?id=" + USER_ID
    store.textContent = "Store"
    li.appendChild(store)
    list.appendChild(li);

    const account = document.createElement("a");
    account.href = "../driver-change-info/change-info.html?id=" + USER_ID
    account.textContent = "Update Account Info"
    li.appendChild(account)
    list.appendChild(li);

    const id = new URLSearchParams(location.search).get("id");
    document.querySelector(".points-header").href = `driver-points/driver-points.html?id=${encodeURIComponent(id)}`;
    document.querySelector(".orders-header").href = `driver-orders/driver-orders.html?id=${encodeURIComponent(id)}`;

    function fillScreen(driverInfo){
        place = document.getElementById("name")
        place.innerHTML = driverInfo["First Name"] + " " + driverInfo["Last Name"]
        place = document.getElementById("usrID")
        place.innerHTML = "ID: " + driverInfo["User ID"]
        place = document.getElementById("email")
        place.innerHTML = driverInfo["Email"]
        place = document.getElementById("role")
        place.innerHTML = driverInfo["Role"]
        place = document.getElementById("org")
        place.innerHTML = driverInfo["Organization Name"]
        place = document.getElementById("balance")
        place.innerHTML = driverInfo["Point Balance"]
        
        document.getElementById("greeting").textContent = `${getGreeting()}, ${driverInfo["First Name"]}!`;

    }

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    go();

    async function go() {
        
        try {
            
            // Send POST request

            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + USER_ID , {
                method: "GET",
            })
            
            

            if (response.ok) {
                const result = await response.json();
                const text1 = result[0].Email;
                fillScreen(result[0])

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }

        } catch (error) {
            alert("EROR " + error)
        }

        const place = document.getElementById("test2")

        
    };

    
    document.getElementById("delete").addEventListener("submit", async function (event) {
        event.preventDefault();
        const pop = document.getElementById("test");
        pop.style.display = "block";
        //alert("SOmething");

    });
  

    document.getElementById("test").addEventListener("submit", async function(event) {
        
       event.preventDefault();
        // Gather form data
        const form = event.target;
        const data = {
            id: form.usrID.value,
        };

 

        console.log(data)
        try {
            
            // Send POST request

            

        
            const response = await fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/user?id=" + data.id, {
                method: "DELETE",
            });
            
            

            if (!response.ok) {
                //alert("THERE DAMN");
                const text = await response.text();
                alert(text);

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }

            } catch (error) {
                alert("EROR " + error)
            }
    });

};
