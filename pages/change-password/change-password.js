window.onload = function() {
  
    // Takes in the list of security questions and adds them to list
    // for the user to select from
    function generateQuestions(questions) {
        const dropdown = document.getElementById("questions")
        questions.forEach (question => {
            const option = document.createElement("option");
            option.value = question;
            option.textContent = question;
            dropdown.appendChild(option);
        });
    }

    // Gets security questions that are listed in the database
    fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/security_questions")
        .then(response => response.json())
        .then(questions => {
            generateQuestions(questions);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });

    document.getElementById("test").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop normal form submission

        
       
 
        // Gather form data
        const form = event.target;
        const formData = new FormData(form);
        const data = {
            email: form.email.value,
            //password: "idk man",
            security_question: form.security.value,
            answer: form.answer.value,
            new_password: form.newPass.value
        };

        // Password validation
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passRegex.test(data.new_password || "")) {
            alert("Password must meet the password requirements listed in the dropdown menu.");
            return;
        }

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
