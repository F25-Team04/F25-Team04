const params = new URLSearchParams(window.location.search);
const sponsORG = params.get("org");
const usrId = params.get("id")

window.onload = function() {
    
    idVal = ""

    function fillScreen(driverInfo){
        place = document.getElementById("name")
        place.innerHTML = "Name:     " + driverInfo["First Name"] + " " + driverInfo["Last Name"]
        place = document.getElementById("email")
        place.innerHTML = "Email:       " + driverInfo["Email"]
        place = document.getElementById("balance")
        place.innerHTML = "Points:     " + driverInfo["Point Balance"]
    }

    async function allocate(data) {

        alert("ITS POINT TIME")

        try {

            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_adjustment?id=" + idVal, {
                method: "POST",
        
                body: JSON.stringify(data)   
            });

            if (response.ok) {
                //alert("THERE DAMN");
                const text = await response.text();
                alert(text);

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }
            } catch (error) {
                alert("ERROR " + error)
            }
    }

    document.getElementById("sendPts").addEventListener("submit", async function (event) {
        event.preventDefault();

        const form = event.target;
        const amount = form.numPts.value

        const data = {
            driver_id: idVal,
            sponsor_id: usrId,
            reason: form.rules.value,
            delta: amount
        };
        
        
        if (amount > 1000 || amount < -1000){
            alert("Max Point Value is 1000")
        }
        else{
            allocate(data)
        }
        //alert("SOmething");

    });
  

    document.getElementById("findEmp").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop normal form submission

        const pop = document.getElementById("sendPts");
        pop.style.display = "block";

        const form = event.target;
        idVal = form.uID.value;

        try {


            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules?org=" + sponsORG, {
                method: "GET",   
            });

            if (response.ok) {
                //alert("THERE DAMN");

                const result = await response.json();
                const numRules = result.length

                list = document.getElementById("rules")
                for (var i = 0; i < numRules; i++) {
                    var option = document.createElement("option");
                    option.value = result[i]["Rule"];
                    option.text = result[i]["Rule"];
                    list.appendChild(option);
                }

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }
            } catch (error) {
                alert("ERROR " + error)
            }

    

        try {


            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + idVal, {
                method: "GET",   
            });

            if (response.ok) {
                //alert("THERE DAMN");
                const result = await response.json();
                fillScreen(result[0])

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }
        } catch (error) {
            alert("ERROR " + error)
        }
    });


  };