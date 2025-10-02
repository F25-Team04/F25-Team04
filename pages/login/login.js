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

    // Gets the User based on their id and sends the user to the homepage that corresponds to the account type
    async function GetUser(UserID) {
        try {
        console.log(UserID)
        // Send POST request
        const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + UserID, {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    if (result["Status"] == "inactive") {
                        alert("Account is inactive, if you are a driver you are likely not approved yet.");
                    }
                    else if (result["Role"] == "driver") {
                         window.location = "../driver/driver.html?id=" + UserID;
                    }
                    else if (result["Role"] == "sponsor") {
                        window.location = "../SponsorHomepage/SponsorHome.html?id=" + UserID + "&org=" + result["Organization"];
                    }
                    else if (result["Role"] == "admin") {
                        window.location = "../AdminHomepage/AdminHome.html";
                    }
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
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
        try {
            
            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"  // IMPORTANT
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const result = await response.json();
                
                if (result.success == false) {
                    alert(result.message);
                }
                else if (result.success == true) {
                    GetUser(result.message);
                }
                

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    });
  };
