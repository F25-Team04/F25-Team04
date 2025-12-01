const params = new URLSearchParams(window.location.search);
const org_ID = params.get("id");

window.onload = function() {


    function buildReport(data){

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

        const information = document.createElement("div")
        const title = document.createElement("h2")
        title.textContent = "Total Points: " + total
        information.appendChild(title)
        const gainRep = document.createElement("h3")
        gainRep.textContent = "Points Gained: " + totalGain
        information.appendChild(gainRep)
        const lossRep = document.createElement("h3")
        lossRep.textContent = "Points Lost: " + totalLoss
        information.appendChild(lossRep)
        const sectionEnd = document.createElement("hr")
        information.appendChild(sectionEnd)

        const repArea = document.getElementById("report")
        repArea.appendChild(information)


        const information2 = document.createElement("div")
        const title2 = document.createElement("h2")
        title2.textContent = "Most Common Transaction: " + comReaon
        information2.appendChild(title2)
        const gainReason = document.createElement("h3")
        gainReason.textContent = "Most Common Gain: " + gainLead
        information2.appendChild(gainReason)
        const lossReason = document.createElement("h3")
        lossReason.textContent = "Most Common Loss: " + lossLead
        information2.appendChild(lossReason)
        const sectionEnd2 = document.createElement("hr")
        information2.appendChild(sectionEnd2)

        repArea.appendChild(information2)

        const information3 = document.createElement("div")
        const title3 = document.createElement("h2")
        title3.textContent = "Orders Placed: " + ordersPlaced
        information3.appendChild(title3)
        const spent = document.createElement("h3")
        spent.textContent = "Points Spent: " + pointsSpent
        information3.appendChild(spent)
        const sectionEnd3 = document.createElement("hr")
        information3.appendChild(sectionEnd3)

        repArea.appendChild(information3)
    }



    async function getOne() {




        const place = document.getElementById("driverID")
        if (place.value == ""){
            alert("Please enter a Driver ID")
        }
        else{
            driverId = place.value


            const header = document.createElement("div")
            const title = document.createElement("h1")
            title.textContent = "Transaction Breakdown"
            header.appendChild(title)
            const subject = document.createElement("h2")
            subject.textContent = "Breakdown for Driver: " + driverId
            header.appendChild(subject)
            const dateRange = document.createElement("h2")
            dateRange.textContent = "Date Range:  All Time"
            header.appendChild(dateRange)
            const sectionEnd = document.createElement("hr")
            header.appendChild(sectionEnd)
            

            const repArea = document.getElementById("report")
            repArea.appendChild(header)
            
            try {
                
                // Send POST request

                const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=" + driverId, {
                    method: "GET",
                })
                
                

                if (response.ok) {
                    const result = await response.json();
                    buildReport(result)
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


        const header = document.createElement("div")
        const title = document.createElement("h1")
        title.textContent = "Transaction Breakdown"
        header.appendChild(title)
        const subject = document.createElement("h2")
        subject.textContent = "Breakdown for: All Revvy Drivers"
        header.appendChild(subject)
        const dateRange = document.createElement("h2")
        dateRange.textContent = "Date Range:  All Time"
        header.appendChild(dateRange)
        const sectionEnd = document.createElement("hr")
        header.appendChild(sectionEnd)

        const repArea = document.getElementById("report")
        repArea.appendChild(header)

        try {
            
            // Send POST request

            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/all_driver_transactions", {
                method: "GET",
            })
            
            

            if (response.ok) {
                alert("CAUGHT EM ALL")
                const result = await response.json();
                buildReport(result)

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

        const header = document.createElement("div")
        const title = document.createElement("h1")
        title.textContent = "Transaction Breakdown"
        header.appendChild(title)
        const subject = document.createElement("h2")
        subject.textContent = "Breakdown for: Drivers in Your Organization"
        header.appendChild(subject)
        const dateRange = document.createElement("h2")
        dateRange.textContent = "Date Range:  All Time"
        header.appendChild(dateRange)
        const sectionEnd = document.createElement("hr")
        header.appendChild(sectionEnd)

        const repArea = document.getElementById("report")
        repArea.appendChild(header)

        try {
            
            // Send POST request

            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions_by_org?id=" + org_ID , {
                method: "GET",
            })
            
            

            if (response.ok) {
                const result = await response.json();
                buildReport(result)
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