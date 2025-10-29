const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
const PROD = params.get("prod");
let User = {};

window.onload = function () {
  async function GetUser() {
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
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          User = result[0];
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetUser();
  async function GetProduct() {
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/product?id=" +
          PROD,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          console.log(result);
          GenerateOrderSummary(result);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetProduct();
  function GenerateOrderSummary(prod) {
    console.log(User);
    document.getElementById("order_img").src = prod["image"];
    document.getElementById("order_address").innerText = User["Address"];
    document.getElementById("order_product").innerText = prod["title"];
    document.getElementById("order_cost").innerText = prod["price"];
    var confirm = document.createElement("button");
    confirm.innerText = "Confirm Order";
    confirm.addEventListener("click", function () {});
  }
};
