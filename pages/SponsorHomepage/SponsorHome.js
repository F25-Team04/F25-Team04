const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function() {
    function MakeRulesList(rules) {
        console.log(rules)
        const list = document.getElementById("rule-list")
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
    // Gets the User based on their id and sends the user to the homepage that corresponds to the account type
    async function GetRules() {
        try {

        // Send POST request
        const response = await fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/point_rules?org=" + ORG_ID, {
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
    async function GetUser() {
        try {
        // Send POST request
            const response = await fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/user?id=" + USER_ID, {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    message = document.getElementById("welcome_message")
                    message.textContent = "Welcome " + result["First Name"]
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }
    GetUser();
    GetRules();
};