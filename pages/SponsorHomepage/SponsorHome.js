const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function() {
    function MakeRulesList(rules) {
        console.log(rules)
        const list = document.getElementById("rule-list")
        list.innerHTML = "";
        rules.forEach(rule => {
            let item = document.createElement("div");
            let text = document.createElement("p");
            let point = document.createElement("p");
            item.id = "rule-row"
            point.id = "pointnum";
            text.id = "rule-descript";
            text.textContent = rule["Rule"];
            point.textContent = rule["Points"];
            item.textContent = rule.text;
            item.appendChild(text);
            item.appendChild(point);
            list.appendChild(item);
        });
    }
    // Gets the rules for the organization that the user belongs to
    async function GetRules() {
        try {

        // Send POST request
        const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules?org=" + ORG_ID, {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                MakeRulesList(result);

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }

    // Gets the user information based on the user id in the query params so that the welcome message will be personalized
    async function GetUser() {
        try {
        // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + USER_ID, {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    message = document.getElementById("welcome_message")
                    message.textContent = "Welcome " + result["First Name"] + "!"
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }
    GetUser();
    GetRules();

    // Sends a new rule to a database
    document.getElementById("ruleForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // stop normal form submission

        // Gather form data
        const form = event.target;
        const formData = new FormData(form);
        console.log(form)
        const data = {
            org: ORG_ID,
            rule: formData.get("rule-reason"),
            points: formData.get("points"),
        };
        try {
            
            // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/point_rules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"  // IMPORTANT
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                GetRules();
            } 
            } catch (error) {
                console.error("Error:", error);
            }
    });
};