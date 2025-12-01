const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function() {

    
    var list = this.document.getElementById("links");
    const li = document.createElement("li");

    // var aboutPage = this.document.getElementById("aboutPage");
    // aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;

    const link = document.createElement("a");
    link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
    link.textContent = "Dashboard";
    li.appendChild(link);


    const notifications = document.createElement("a");
    notifications.href =
        "../notificationsPage/notifs.html?id=" + USER_ID + "&org=" + ORG_ID;
    notifications.textContent = "Notifications";
    li.appendChild(notifications);

    const store = document.createElement("a");
    store.href =
        "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
    store.textContent = "Store";
    li.appendChild(store);

    const cart = document.createElement("a");
    cart.href = "../DriverCart/DriverCart.html?id=" + USER_ID + "&org=" + ORG_ID;
    cart.textContent = "Cart";
    li.appendChild(cart);

    list.appendChild(li);

    const orders = document.createElement("a");
    orders.href =
        "../driver/driver-orders/driver-orders.html?id=" +
        USER_ID +
        "&org=" +
        ORG_ID;
    orders.textContent = "Orders";
    li.appendChild(orders);

    var apply = document.createElement("a");
    apply.href = "../DriverApp/apply.html?id=" + USER_ID + "&org=" + ORG_ID;
    apply.textContent = "Apply";
    li.appendChild(apply);

    const account = document.createElement("a");
    account.href =
        "../driver-change-info/change-info.html?id=" + USER_ID + "&org=" + ORG_ID;
    account.textContent = "Update Account Info";
    li.appendChild(account);

    const switchOrg = document.createElement("a");
    switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
    switchOrg.textContent = "Switch Organization";
    li.appendChild(switchOrg);

    list.appendChild(li);


    function buildReport(data, theDiv){

        let totalGain = 0
        let totalLoss = 0
        let avg = 0
        let stat = 0
        let ordersPlaced = 0
        let pointsSpent = 0

        const gainHash = {}
        const lossHash = {}
        numTrans = data.length

        for (var i = 0; i < numTrans; i++) {
            stat = data[i]["Amount"]
            let stat2 = data[i]["Reason"]

            if (stat2 != "Order placed"){
                if (stat < 0){
                    totalLoss += stat

                    if (lossHash[stat2]){
                        lossHash[stat2] +=1
                    }
                    else{
                        lossHash[stat2] =1
                    }
                }
                else{

                    if (gainHash[stat2]){
                        gainHash[stat2] +=1
                    }
                    else{
                        gainHash[stat2] =1
                    }

                    totalGain += stat
                }
                avg += stat
            }
            else{
                ordersPlaced += 1
                pointsSpent += stat
            }
        }

        avg = avg/numTrans


        

        gainKeys = Object.keys(gainHash)
        let numKeys = gainKeys.length

        let gainLead = gainKeys[0]

        for (let x = 1; x < numKeys; ++x){
            if (gainHash[gainKeys[x]] > gainHash[gainLead]){
                gainLead = gainKeys[x]
            }
        }

        lossKeys = Object.keys(lossHash)
        numKeys = lossKeys.length

        let lossLead = lossKeys[0]

        for (let x = 1; x < numKeys; ++x){
            if (lossHash[lossKeys[x]] > lossHash[lossLead]){
                lossLead = lossKeys[x]
            }
        }

        pointsSpent = pointsSpent * -1

        let comReaon = ""

        if (lossHash[lossLead] > gainHash[gainLead]){
            comReaon = lossLead
        }
        else{
            comReaon = gainLead
        }

        let total = totalGain + totalLoss

        //alert("Total Gain: " + totalGain + "\nTotal Loss: " + totalLoss + "\nAVerage " + avg + "\nGain Reason " + gainLead + "\nLoss Reason " + lossLead)

        const newRep = theDiv

        const information = document.createElement("div")
        information.className = "infoBubble"
        const title = document.createElement("h2")
        title.textContent = "Total Points: \u00A0"
        title.className ="title"
        const nextPart = document.createElement("p")
        nextPart.textContent = total
        nextPart.className = "inTitle"
        
        information.appendChild(title)
        information.appendChild(nextPart)

        const gainRep = document.createElement("h4")
        gainRep.textContent = " \u00A0\u00A0\u00A0\u00A0\u00A0\u00A0• Points Gained: "
        const info = document.createElement("p")
        info.textContent = "\u00A0\u00A0" + totalGain
        information.appendChild(gainRep)
        information.appendChild(info)
        
        const lossRep = document.createElement("h4")
        lossRep.textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0• Points Lost: "
        const info2 = document.createElement("p")
        info2.textContent = "\u00A0\u00A0\u00A0" + totalLoss
        information.appendChild(lossRep)
        information.appendChild(info2)

        newRep.appendChild(information)
        const aB2 = document.createElement("hr")
        newRep.appendChild(aB2)

        const information2 = document.createElement("div")
        information2.className = "infoBubble"
        const title2 = document.createElement("h2")
        title2.textContent = "Most Common Transaction: \u00A0"
        information2.appendChild(title2)
        const nextPart2 = document.createElement("p")
        nextPart2.textContent = comReaon
        nextPart2.className = "inTitle"
        information2.appendChild(nextPart2)
        const gainReason = document.createElement("h4")
        gainReason.textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0• Most Common Gain: "
        information2.appendChild(gainReason)
        const info3 = document.createElement("p")
        info3.textContent = "\u00A0\u00A0" + gainLead
        information2.appendChild(info3)

        const lossReason = document.createElement("h4")
        lossReason.textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0• Most Common Loss: "
        information2.appendChild(lossReason)
        const info4 = document.createElement("p")
        info4.textContent = "\u00A0\u00A0" + lossLead
        information2.appendChild(info4)
        
        newRep.appendChild(information2)

        const aB3 = document.createElement("hr")
        newRep.appendChild(aB3)

        const information3 = document.createElement("div")
        information3.className = "infoBubble"
        const title3 = document.createElement("h2")
        title3.textContent = "Orders Placed: \u00A0"
        information3.appendChild(title3)
        const nextPart3 = document.createElement("p")
        nextPart3.textContent = ordersPlaced
        nextPart3.className = "inTitle"
        information3.appendChild(nextPart3)
        const spent = document.createElement("h4")
        spent.textContent = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0•  Points Spent: "
        information3.appendChild(spent)
        const info5 = document.createElement("p")
        info5.textContent = "\u00A0\u00A0" + pointsSpent
        information3.appendChild(info5)

        newRep.appendChild(information3)
        newRep.className = "report"
        const repArea = document.getElementById("report")
        repArea.appendChild(newRep)
    }



    async function getOne() {




        const place = document.getElementById("driverID")
        if (place.value == ""){
            alert("Please enter a Driver ID")
        }
        else{
            driverId = place.value

            const newRep = document.createElement("div")

            const header = document.createElement("div")
            const title = document.createElement("h1")
            title.textContent = "Transaction Breakdown"
            header.appendChild(title)
            const subject = document.createElement("h2")
            subject.textContent = "Breakdown for Driver: \u00A0\u00A0"
            header.appendChild(subject)
            const whoFor = document.createElement("p")
            whoFor.textContent = driverId
            whoFor.className = "inTitle"
            header.appendChild(whoFor)
            
           
            const sectionEnd = document.createElement("hr")
            header.appendChild(sectionEnd)
            

            newRep.appendChild(header)
            
            try {
                
                // Send POST request

                const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=" + driverId, {
                    method: "GET",
                })
                
                

                if (response.ok) {
                    const result = await response.json();
                    buildReport(result, newRep)
                } else {
                    //alert("Password or Email is Incorrect  ");
                    const text = await response.text();
                    alert(text);
                }

            } catch (error) {
                alert("EROR " + error)
            }
        }
        


        
    };

    async function getAll() {

        const newRep = document.createElement("div")

        const header = document.createElement("div")
        const title = document.createElement("h1")
        title.textContent = "Transaction Breakdown"
        header.appendChild(title)
        const subject = document.createElement("h2")
        subject.textContent = "Breakdown for: \u00A0\u00A0"
        header.appendChild(subject)
        const whoFor = document.createElement("p")
        whoFor.textContent = "All Revvy Drivers"
        whoFor.className = "inTitle"
        header.appendChild(whoFor)
    
        const sectionEnd = document.createElement("hr")
        header.appendChild(sectionEnd)

        const repArea = document.getElementById("report")
        newRep.appendChild(header)

        try {
            
            // Send POST request

            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/all_driver_transactions", {
                method: "GET",
            })
            
            

            if (response.ok) {
                alert("CAUGHT EM ALL")
                const result = await response.json();
                buildReport(result, newRep)

            } else {
                //alert("Password or Email is Incorrect  ");
                const text = await response.text();
                alert(text);
            }

        } catch (error) {
            alert("EROR " + error)
        }

        const place = document.getElementById("test2")

        
    };

    async function getSome() {

        const newRep = document.createElement("div")

        const header = document.createElement("div")
        const title = document.createElement("h1")
        title.textContent = "Transaction Breakdown"
        header.appendChild(title)
        const subject = document.createElement("h2")
        subject.textContent = "Breakdown for:\u00A0\u00A0"
        const whoFor = document.createElement("p")
        whoFor.textContent = "Drivers in Your Organization"
        whoFor.className = "inTitle"
        header.appendChild(subject)
        header.appendChild(whoFor)
    
        const sectionEnd = document.createElement("hr")
        header.appendChild(sectionEnd)

        const repArea = document.getElementById("report")
        newRep.appendChild(header)

        try {
            
            // Send POST request

            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions_by_org?id=" + ORG_ID , {
                method: "GET",
            })
            
            

            if (response.ok) {
                const result = await response.json();
                buildReport(result, newRep)
            } else {
                const text = await response.text();
                alert(text);
            }

        } catch (error) {
            alert("EROR " + error)
        }

        const place = document.getElementById("test2")

        
    };

    document.getElementById("scope").addEventListener("change", function (event) {
        const pop = document.getElementById("specify");
        const check = event.target
        if (check.value == "soloDriver"){
            pop.style.display = "block";
        }
        else{
            if (pop.style.display == "block"){
                pop.style.display = "none"
            }
        }
    });

    
    document.getElementById("makeForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const pop = document.getElementById("scope");
        const scope = pop.value
        if (scope == "all"){
            getAll()
        }
        else if(scope == "myOrg"){
            getSome()
        }
        else{
            getOne()
        }
        //alert("SOmething");

    });
  


  };