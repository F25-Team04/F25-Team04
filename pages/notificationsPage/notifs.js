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

  function fillScreen(orgInfo) {

    
    const area = document.getElementById("orgs")

    const numOrgs = orgInfo.length

    for (i = (numOrgs -1); i > -1; --i){

      const notifType = document.createElement("div");
      const notif = document.createElement("div");
      const mess = document.createElement("p");
      mess.textContent = orgInfo[i]["Message"];
      const date = document.createElement("h2");
      date.textContent = orgInfo[i]["Date"];

      notif.appendChild(date);
      notif.appendChild(mess);
      notif.className = "notification";
      //area.appendChild(notif)

      const options = document.createElement("div");
      options.className = "options"

      const newForm = document.createElement("form");
      newForm.id = orgInfo[i]["IdNum"];
      newForm.addEventListener("submit", read);
      const newInput = document.createElement("input");
      newInput.type = "submit";
      newInput.value = "Mark as Read";
      newInput.id = orgInfo[i]["IdNum"];
      newInput.name = orgInfo[i];
      newForm.appendChild(newInput);


      // const newForm2 = document.createElement("form");
      // newForm2.id = orgInfo[i]["IdNum"];
      // newForm2.addEventListener("submit", read);
      // const newInput2 = document.createElement("input");
      // newInput2.type = "submit";
      // newInput2.value = "Read";
      // options.appendChild(newInput2);

      options.appendChild(newForm)


      
      notif.appendChild(options);

      notifType.appendChild(notif)
      notifType.className = orgInfo[i]["Subject"];
      area.appendChild(notifType);
      // const newLine = document.createElement("hr");
      // area.appendChild(newLine);
        }
        
        
    }

    go();

    async function go() {
        
    try {
            
          // Send POST request

          const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/notifications?id=" + USER_ID, {
              method: "GET",
          })
          
          

          if (response.ok) {
              // const texter = await response.text();
              // alert(texter)
              const result = await response.json();
              fillScreen(result)

          } else {
              //alert("Password or Email is Incorrect  ");
              const text = await response.text();
              alert(text);
          }

      } catch (error) {
          alert("EROR " + error)
      }


      
  };
  
  async function read(event) {
      event.preventDefault();
      const notId = event.target.id

      try {
          
        // Send POST request
        
        const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/notifications?id=" + notId, {
          method: "DELETE",
        });
          

        if (response.ok) {
          alert("Notification Deleted")

        } else {
          //alert("Password or Email is Incorrect  ");
          const text = await response.text();
          alert(text);
        }

      } catch (error) {
        alert("EROR " + error)
      }

    };

    document.getElementById("hidePts").addEventListener("change", async function (event) {
      const ptNots = document.getElementsByClassName("Points")

      for (let i = 0; i < ptNots.length; i++) {
        const element = ptNots[i];
        element.style.display = 'none'
      }
    })

  document
    .getElementById("hidePts")
    .addEventListener("change", async function (event) {
      const ptNots = document.getElementsByClassName("Points");
      let newVal = "none"
      let checkVal = ptNots[0]
      if (checkVal.style.display == "none"){
        newVal = "block"
      }
      else{
        alert("Print WHO NEW")
      }

      for (let i = 0; i < ptNots.length; i++) {
        const element = ptNots[i];
        element.style.display = newVal;
        alert ("NEw value " + element.style.display)
      }

    });
};
