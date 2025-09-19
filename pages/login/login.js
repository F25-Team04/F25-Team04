window.onload = function() {
  
    const passwordField = document.getElementById("passwordInput");
    const capsIndicator = document.querySelector(".caps-indicator");
    
    document.addEventListener("keydown", checkCaps);
    document.addEventListener("keyup", checkCaps);

    document.addEventListener("keydown", (e) => {
        if (e.code === "CapsLock") {
            checkCaps(e);
        }
    });

    function checkCaps(event) {
        const capsOn = event.getModifierState("CapsLock");
        if (capsOn) {
            capsIndicator.classList.add("active");
        }
        else {
            capsIndicator.classList.remove("active");
        }
    }

    window.togglePW = function (btn) {
        var x = document.getElementById("pw");
        var icon = btn.querySelector("i");
        var isHidden = x.type === "password";

        x.type = isHidden ? "text" : "password";

        icon.classList.toggle("bx-eye-slash", isHidden);
        icon.classList.toggle("bx-eye", !isHidden);
    }

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
            const response = await fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"  // IMPORTANT
                },
                body: JSON.stringify(data)   
            });

            if (response.ok) {
                const result = await response.json();
                window.location = "About Page/about.html";
                console.log("Server Response:", result);

            } else {
                alert("Password or Email is Incorrect");
            }
            } catch (error) {
                console.error("Error:", error);
            }
    });


  };