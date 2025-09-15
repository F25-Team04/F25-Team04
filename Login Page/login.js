window.onload = function() {
  
    const passwordField = document.getElementById("passwordInput");
    const warning = document.getElementById("capsWarning");
    

    passwordField.addEventListener("keyup", function(event) {
        if (event.getModifierState("CapsLock")) {
            warning.style.display = "block";   // Show warning
        } else {
            warning.style.display = "none";    // Hide warning
        }
    });

    document.getElementById("loginForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop normal form submission

        // Gather form data
        const form = event.target;
        const formData = new FormData(form);
        const data = {
            email: form.email.value,
            password: form.password.value
        };

        console.log(data)
        try {
            // Send POST request
            const response = await fetch("/submit", {
                method: "POST",
                body: data
            });

            if (response.ok) {
                const result = await response.json();
                window.location = "../About/about.html";
                console.log("Server Response:", result);

            } else {
                alert("Password or Email is Incorrect");
            }
            } catch (error) {
                console.error("Error:", error);
            }
    });


  };