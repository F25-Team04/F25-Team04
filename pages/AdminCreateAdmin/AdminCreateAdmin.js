const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function () {
    var list = this.document.getElementById("links");
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../AdminHomepage/AdminHome.html?id=" + USER_ID;
    link.textContent = "Dashboard";
    li.appendChild(link);
    const create = document.createElement("a");
    create.href = "../AdminCreateSponsor/AdminCreateSponsor.html?id=" + USER_ID;
    create.textContent = "Create Sponsor";
    const create_org = document.createElement("a");
    create_org.href = "../AdminCreateSponsorOrg/AdminCreateSponsorOrg.html?id=" + USER_ID;
    create_org.textContent = "Create Organization";
    const create_admin = document.createElement("a");
    create_admin.href = "../AdminCreateAdmin/AdminCreateAdmin.html?id=" + USER_ID;
    create_admin.textContent = "Create Admin";
    li.appendChild(create_admin);
    li.appendChild(create);
    li.appendChild(create_org);
    list.appendChild(li);

    const capsIndicator = document.querySelector(".caps-indicator");
    const cb = document.querySelector('.accInfo .acc-info-footer input[type="checkbox"]');
    const pw1 = document.querySelector('.accInfo input[name="password"]');
    const pw2 = document.querySelector('.accInfo input[name="confPassword"]');

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

    if (cb && pw1 && pw2) {
        const syncVisibility = () => {
            const t = cb.checked ? "text" : "password";
            pw1.type = t;
            pw2.type = t;
        };
        cb.addEventListener("change", syncVisibility);
        syncVisibility();
    }

    // Takes in the list of security questions and adds them to list
    // for the user to select from
    function generateQuestions(questions) {
        const dropdown = document.getElementById("questions")
        questions.forEach(question => {
            const option = document.createElement("option");
            option.value = question;
            option.textContent = question;
            dropdown.appendChild(option);
        });
    }

    // Gets security questions that are listed in the database
    fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/security_questions")
        .then(response => response.json())
        .then(questions => {
            generateQuestions(questions);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });

    document.getElementById("signupForm").addEventListener("submit", async function (event) {
        event.preventDefault(); // stop page reload

        // grab all inputs by their `name` attributes
        const form = event.target;
        const formData = new FormData(form);

        // convert FormData → plain object
        const data = Object.fromEntries(formData.entries());

        // Password validation
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passRegex.test(data.password || "")) {
            alert("Password must meet the password requirements listed in the dropdown menu.");
            return;
        }


        // Posts the signup form to the API
        const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/admin", {
            method: "POST",
            // headers: {
            //     "Content-Type": "application/json"
            // },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            alert("NOT sent");
            throw new Error("Network response was not ok " + response.statusText);
        }

        const ans = await response.json();
        alert(ans.message);


    });
}
