window.onload = function() {

    
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