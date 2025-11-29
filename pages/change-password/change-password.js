window.onload = function () {
  const form = document.getElementById("change-password-form");
  const emailInput = document.getElementById("email");
  const questionInput = document.getElementById("security-question");
  const answerInput = document.getElementById("answer");
  const newPassInput = document.getElementById("newPass");

  const securitySection = document.getElementById("security-section");
  const answerSection = document.getElementById("answer-section");
  const passwordSection = document.getElementById("password-section");
  const submitBtn = document.getElementById("submit-btn");

  let step = 1; // 1 = ask email, 2 = answer + new password

  const passRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (step === 1) {
      // STEP 1: look up security question for this email
      const email = (emailInput.value || "").trim();
      if (!email) {
        alert("Please enter your email.");
        return;
      }

      try {
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/security_questions?email=" +
            encodeURIComponent(email)
        );

        if (!response.ok) {
          const msg = await response.text();
          alert(msg || "Unable to find an account with that email.");
          return;
        }

        const data = await response.json();
        // Your Lambda returns: { email: "...", question: "..." }
        if (!data || !data.question) {
          alert("No security question found for this account.");
          return;
        }

        // Fill in and reveal step 2
        questionInput.value = data.question;
        securitySection.classList.remove("hidden");
        answerSection.classList.remove("hidden");
        passwordSection.classList.remove("hidden");

        emailInput.readOnly = true;
        submitBtn.textContent = "Change Password";
        step = 2;
      } catch (error) {
        console.error("Error fetching security question:", error);
        alert("An error occurred while looking up your account.");
      }
    } else {
      // STEP 2: answer + new password
      const email = (emailInput.value || "").trim();
      const securityQuestion = (questionInput.value || "").trim();
      const answer = (answerInput.value || "").trim();
      const newPassword = newPassInput.value || "";

      if (!answer) {
        alert("Please enter the answer to your security question.");
        return;
      }

      if (!passRegex.test(newPassword)) {
        alert(
          "Password must meet the password requirements listed in the dropdown."
        );
        return;
      }

      const payload = {
        email: email,
        security_question: securityQuestion,
        answer: answer,
        new_password: newPassword,
      };

      try {
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/change_password",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const text = await response.text();
          alert(text.message || "Password changed successfully.");
          window.location = "../login/login.html";
        } else {
          const text = await response.text();
          alert(text || "Unable to change password. Please try again.");
        }
      } catch (error) {
        console.error("Error changing password:", error);
        alert("An error occurred while changing your password.");
      }
    }
  });
};
