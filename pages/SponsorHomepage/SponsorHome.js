window.onload = function() {
    function MakeRulesList(rules) {
        const list = document.getElementById("rule-list")
        rules.forEach(rule => {
            let item = document.createElement("div");
            let text = document.createElement("p");
            let point = document.createElement("p");
            item.id = "rule-row"
            point.id = "pointnum";
            text.id = "rule-descript";
            text.textContent = rule["description"];
            point.textContent = rule["point"];
            item.textContent = rule.text;
            item.appendChild(text);
            item.appendChild(point);
            list.appendChild(item);
        });
    }
    let rule = []
    rule["description"] = "Come to a complete stop at a stopsign"
    rule["point"] = 3
    let rule1 = []
    rule1["description"] = "Do not go over 60mph"
    rule1["point"] = 2

    array = [rule, rule1]
    MakeRulesList(array);

    // Gets the user
    // fetch("https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/organizations")
    //     .then(response => response.json())
    //     .then(orgs => {
    //         generateOrgs(orgs); // handle the JSON data
    //     })
    //     .catch(error => {
    //         console.error("There was a problem with the fetch operation:", error);
    //     });

};