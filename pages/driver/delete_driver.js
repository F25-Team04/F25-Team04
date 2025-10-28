const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

window.onload = function () {
  var list = this.document.getElementById("links");
  const li = document.createElement("li");

  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;

  const link = document.createElement("a");
  link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);

  const store = document.createElement("a");
  store.href =
    "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
  store.textContent = "Store";
  li.appendChild(store);
  list.appendChild(li);

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

  const id = new URLSearchParams(location.search).get("id");
  document.querySelector(
    ".points-header"
  ).href = `driver-points/driver-points.html?id=${encodeURIComponent(id)}`;
  document.querySelector(
    ".orders-header"
  ).href = `driver-orders/driver-orders.html?id=${encodeURIComponent(id)}`;

  function fillScreen(driverInfo) {
    place = document.getElementById("name");
    place.innerHTML = driverInfo["First Name"] + " " + driverInfo["Last Name"];
    place = document.getElementById("usrID");
    place.innerHTML = "ID: " + driverInfo["User ID"];
    place = document.getElementById("email");
    place.innerHTML = driverInfo["Email"];
    place = document.getElementById("role");
    place.innerHTML = driverInfo["Role"];
    for (var org of driverInfo["Organizations"]) {
      if (org["org_id"] == ORG_ID) {
        place = document.getElementById("org");
        place.innerHTML = org["org_name"];
        place = document.getElementById("balance");
        place.innerHTML = org["spo_pointbalance"];
      }
    }

    document.getElementById("greeting").textContent = `${getGreeting()}, ${
      driverInfo["First Name"]
    }!`;
  }

  function fillTransactions(transactionInfo){
    const data = transactionInfo
    area = document.getElementById("recentTransactions")
    numTrans = data.length


    for (i = 0; i < numTrans; ++i){
      const newDiv  = document.createElement('div');

      const newp = document.createElement('p');
      newp.textContent = "Amount: " + data[i]["Amount"];
      newDiv.appendChild(newp)
      const newp2 = document.createElement('p');
      newp2.textContent = "Reason: " + data[i]["Reason"];
      newDiv.appendChild(newp2)
      const newp4 = document.createElement('p');
      newp4.textContent = "Date:  " + data[i]["Date"];
      newDiv.appendChild(newp4)


      newDiv.id = 'childDiv';
      if (data[i]["Amount"] < 0){
          newDiv.className = 'loss';
      }
      else{
          newDiv.className = 'gain';
      }

      if (i%2){
          newDiv.style.backgroundColor = 'lightblue';
      }
      newDiv.style.padding = '10px';

      // 3. Append the new div to the parent div
      area.appendChild(newDiv)
    }


  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  go();

  async function go() {
    try {
      // Send POST request

      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" +
          USER_ID,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const result = await response.json();
        const text1 = result[0].Email;
        fillScreen(result[0]);
      } else {
        //alert("Password or Email is Incorrect  ");
        const text = await response.text();
        alert(text);
      }
    } catch (error) {
      alert("EROR " + error);
    }
    
    try {
      const response2 = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/driver_transactions?id=" + USER_ID , {
        method: "GET",
      })
            
        
      if (response2.ok) {
        const result2 = await response2.json();
        fillTransactions(result2)

      } else {
          const text = await response.text();
            alert(text);
        }

    } catch (error) {
      alert("EROR " + error)
    }

    const place = document.getElementById("test2");
  }

  document.
    getElementById("showLoss").
      addEventListener("change", async function (event) {
        event.preventDefault();

        let dval = ''

        if (event.target.checked){
          dval = 'none';
        }
        else{
          dval = 'block'
        }

        tester = document.getElementsByClassName('loss')
        for (let x = 0; x < tester.length; ++x){
          tester[x].style.display = dval
        }

      });

  document
    .getElementById("delete")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      const pop = document.getElementById("test");
      pop.style.display = "block";
      //alert("SOmething");
    });

  document
    .getElementById("test")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      // Gather form data
      const form = event.target;
      const data = {
        id: form.usrID.value,
      };

      console.log(data);
      try {
        // Send POST request

        const response = await fetch(
          "https://5ynirur3b5.execute-api.us-east-2.amazonaws.com/dev/user?id=" +
            data.id,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          //alert("THERE DAMN");
          const text = await response.text();
          alert(text);
        } else {
          //alert("Password or Email is Incorrect  ");
          const text = await response.text();
          alert(text);
        }
      } catch (error) {
        alert("EROR " + error);
      }
    });
};
