const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
const PROD = params.get("prod");
let User = {};
let ConversionRate = 0;
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
          console.log(User);
          ConversionRate =
            User["Organizations"][ORG_ID - 1]["org_conversion_rate"];
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
    document.getElementById("order_img").src = prod["image"];
    document.getElementById("order_address").innerText = User["Address"];
    document.getElementById("order_product").innerText = prod["title"];

    const PricePoints = prod["price"] / ConversionRate;
    document.getElementById("order_cost").innerText = PricePoints + " Points";
    var confirm = document.getElementById("order_button");
    confirm.innerText = "Confirm Order";
    confirm.addEventListener("click", function () {
      console.log("Hello");
      ConfirmOrder(prod);
    });
  }

  async function ConfirmOrder(prod) {
    const data = {
      user_id: USER_ID,
      org_id: ORG_ID,
      items: [parseInt(prod["id"])],
    };
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // IMPORTANT
          },
          body: JSON.stringify(data),
        }
      );
      console.log(response);
      if (response.ok) {
        const result = await response.json();

        if (response.status != 200) {
          alert(result.message);
        } else if (response.status == 200) {
          alert("Order Placed");
          window.location =
            "../DriverStorePage/DriverStore.html?id=" +
            USER_ID +
            "&org=" +
            ORG_ID;
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};
