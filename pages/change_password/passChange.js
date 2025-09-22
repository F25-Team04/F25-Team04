window.onload = function() {
  

    document.getElementById("test").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop normal form submission

    
       
 
        // Gather form data
        const form = event.target;
        const formData = new FormData(form);
        const data = {
            email: form.email.value,
            //password: "idk man",
            answer: form.securityQ.value,
            new_password: form.newPass.value
        };


        console.log(data)
        try {

            
            // Send POST request
            const response = await fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/change_password", {
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
    });



  };
