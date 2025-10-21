// const params = new URLSearchParams(window.location.search);
// const USER_ID = params.get("id");
let ruleList = [];
idNow = -1

window.onload = function() {

    function fillScreen(driverInfo){
        place = document.getElementById("name")
        place.innerHTML = "Name:     " + driverInfo["First Name"] + " " + driverInfo["Last Name"]
        place = document.getElementById("usrID")
        place.innerHTML = "User ID:     " + driverInfo["User ID"]
        place = document.getElementById("email")
        place.innerHTML = "Email:       " + driverInfo["Email"]
        place = document.getElementById("role")
        place.innerHTML = "Role:       " + driverInfo["Role"]
        place = document.getElementById("org")
        place.innerHTML = "Organization:     " + driverInfo["Organization Name"]
        place = document.getElementById("balance")
        place.innerHTML = "Points:     " + driverInfo["Point Balance"]
        
    }

    go();

    async function go() {
        

        try {


            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules?org=1", {
                method: "GET",   
            });

            if (response.ok) {
                //alert("THERE DAMN");

                const result = await response.json();
                const numRules = result.length

                list = document.getElementById("rules")
                for (var i = 0; i < numRules; i++) {
                    var option = document.createElement("option");
                    option.value = i;
                    ruleList.push(result[i])
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

        
    };

    
    document.getElementById("makeChange").addEventListener("submit", async function (event) {
        event.preventDefault();

        
        const form = event.target;

        const temp3 = document.getElementById("rule")
        const temp4 = document.getElementById("newPts")

        const data = {
            reason: temp3.value,
            amount: temp4.value,
            ruleId: 1
        };


        try {
            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/change_point_rule", {
                method: "POST",
                body: JSON.stringify(data) 
            });

            if (response.ok) {
                //alert("THERE DAMN");
                alert("NICE WORk CON")
            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }
        } catch (error) {
            alert("ERROR " + error)
        }


    });

    document.getElementById("deleteRule").addEventListener("submit", async function (event) {
        event.preventDefault();


        try {
            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/change_point_rule?id=" + idNow, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("NICE WORk CON")
            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }
        } catch (error) {
            alert("ERROR " + error)
        }


    });
  

    document.getElementById("showRule").addEventListener("submit", async function(event) {
        const pop = document.getElementById("makeChange");
        pop.style.display = "block";
        const pop2 = document.getElementById("deleteRule");
        pop2.style.display = "block";

        event.preventDefault()
        const doc = event.target
        const temp = document.getElementById("rule")
        const temp2 = document.getElementById("newPts")
        const set = ruleList[doc.rules.value]
        idNow = set["Rule ID"]
        temp.value = set["Rule"]
        temp2.value = set["Points"]
    });


  };