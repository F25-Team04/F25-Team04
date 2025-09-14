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
  };