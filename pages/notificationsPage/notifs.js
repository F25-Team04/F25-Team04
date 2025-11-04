const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function() {


    function fillScreen(orgInfo){

        const area = document.getElementById("orgs")

        const numOrgs = orgInfo.length

        for (i =0; i <numOrgs; ++i){
            const notif = document.createElement("div")
            const mess = document.createElement("h2")
            mess.textContent = orgInfo[i]["Message"]
            const date = document.createElement("h2")
            date.textContent = orgInfo[i]["Date"]
            
            notif.appendChild(date)
            notif.appendChild(mess)
            area.appendChild(notif)

            const newForm = document.createElement("form")
            newForm.id = orgInfo[i]["IdNum"]
            newForm.addEventListener("submit", apply)
            const newInput = document.createElement("input")
            newInput.type = "submit"
            newInput.value = "Delete"
            newInput.id = orgInfo[i]["IdNum"]
            newInput.name = orgInfo[i]
            newForm.appendChild(newInput)
            area.appendChild(newForm)
            const newLine = document.createElement("hr")
            area.appendChild(newLine)
        }
        
        
    }

    go();

    async function go() {
        
        try {
            
            // Send POST request

            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/notifications?id=3", {
                method: "GET",
            })
            
            

            if (response.ok) {
                // const texter = await response.text();
                // alert(texter)
                const result = await response.json();
                fillScreen(result)

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }

        } catch (error) {
            alert("EROR " + error)
        }


        
    };
    
    async function apply(event) {
        event.preventDefault();
        const notId = event.target.id

        try {
            
            // Send POST request
            
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/notifications?id=" + notId, {
                method: "DELETE",
            });
            

            if (response.ok) {
                alert("Notification Deleted")

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }

        } catch (error) {
            alert("EROR " + error)
        }

    };

    


  };