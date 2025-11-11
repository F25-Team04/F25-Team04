const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
let User = {};
let PointConversionRate;
let storeItems = [];
let CurrDriverPoints;

window.onload = function () {
  var list = this.document.getElementById("links");
  var aboutPage = this.document.getElementById("aboutPage");
  aboutPage.href = "../about/about.html?id=" + USER_ID + "&org=" + ORG_ID;
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = "../driver/driver.html?id=" + USER_ID + "&org=" + ORG_ID;
  link.textContent = "Dashboard";
  li.appendChild(link);
  const store = document.createElement("a");
  store.href =
    "../DriverStorePage/DriverStore.html?id=" + USER_ID + "&org=" + ORG_ID;
  store.textContent = "Store";
  li.appendChild(store);
  const cart = document.createElement("a");
  cart.href = "../DriverCart/DriverCart.html?id=" + USER_ID + "&org=" + ORG_ID;
  cart.textContent = "Cart";
  li.appendChild(cart);
  const orders = document.createElement("a");
  orders.href =
    "../driver/driver-orders/driver-orders.html?id=" +
    USER_ID +
    "&org=" +
    ORG_ID;
  orders.textContent = "Orders";
  li.appendChild(orders);
  const account = document.createElement("a");
  account.href =
    "../driver-change-info/change-info.html?id=" + USER_ID + "&org=" + ORG_ID;
  account.textContent = "Update Account Info";
  li.appendChild(account);
  const switchOrg = document.createElement("a");
  switchOrg.href = "../DriverSelectOrg/DriverSelectOrg.html?id=" + USER_ID;
  switchOrg.textContent = "Switch Organization";
  li.appendChild(switchOrg);
  const apply = document.createElement("a");
  apply.href = "../DriverApp/apply.html?id=" + USER_ID + "&org=" + ORG_ID;
  apply.textContent = "Apply";
  li.appendChild(apply);
  list.appendChild(li);

  async function GetShop() {
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/cart?id=" +
          USER_ID +
          "&org=" +
          ORG_ID,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        result = await response.json();
        result = result[0];
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          storeItems = Array.isArray(result["items"]) ? result["items"] : [];
          console.log(storeItems.length);
          if (storeItems.length == 0) {
            EmptyCart();
          } else {
            GenerateStore(storeItems);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  function EmptyCart() {
    head = document.createElement("h1");
    head.innerText = "Your Cart Is Empty";
    document.getElementById("store-catalog").innerHTML = "";
    document.getElementById("store-catalog").appendChild(head);
  }
  function GenerateStore(items) {
    console.log(items);
    var store = document.getElementById("store-catalog");
    store.innerHTML = "";
    console.log(items);
    for (let product of items) {
      const product_div = document.createElement("div");
      product_div.className = "product_wrapper";
      const product_img = document.createElement("img");
      product_img.className = "product_image";
      product_img.src = product["itm_image"] || product.image || "";

      const content = document.createElement("div");
      content.className = "product_content";
      const PricePoints = parseInt(product["itm_pointcost"]);

      const totalCents = Math.round(
        Number(product["price"] || product.price || 0) * 100
      );
      const dollars = Math.floor(totalCents / 100);
      const cents = totalCents % 100;

      const rating =
        (product["rating"] && product["rating"]["rate"]) ||
        (product.rating && product.rating.rate) ||
        "N/A";
      const title = product["itm_name"] || product.title || "Untitled";

      const productName = document.createElement("h3");
      productName.className = "product_name";
      productName.textContent = title;

      const metaRow = document.createElement("div");
      metaRow.className = "product_meta";

      const productRating = document.createElement("span");
      productRating.className = "product_rating";
      if (rating === "N/A") {
        const icon = document.createElement("i");
        icon.className = "bx bx-star";
        productRating.append(icon, document.createTextNode(" Rating: N/A"));
      } else {
        productRating.append(
          makeStars(Number(rating)),
          document.createTextNode(` ${rating} / 5`)
        );
      }

      const productCost = document.createElement("span");
      productCost.className = "product_cost";
      const rewardsIcon = document.createElement("i");
      rewardsIcon.className = "bx bx-medal-star-alt";
      const pointsValue = document.createElement("span");
      pointsValue.className = "points_value";
      pointsValue.textContent = PricePoints;
      const pointsText = document.createElement("span");
      pointsText.className = "points_text";
      pointsText.textContent = " points";
      productCost.append(rewardsIcon, pointsValue, pointsText);

      var orderButton = document.createElement("button");
      orderButton.innerText = "Order Item";
      orderButton.addEventListener("click", function () {
        if (PricePoints > CurrDriverPoints) {
          alert("Item is to expensive");
        } else {
          window.location =
            "../OrderSummary/OrderSummary.html?id=" +
            USER_ID +
            "&org=" +
            ORG_ID +
            "&prod=" +
            product["id"];
        }
      });

      var addCart = document.createElement("button");
      addCart.innerText = "Remove From Cart";
      addCart.addEventListener("click", function () {
        RemoveItem(product["itm_productid"]);
      });

      metaRow.appendChild(productRating);
      metaRow.appendChild(productCost);
      metaRow.appendChild(orderButton);
      metaRow.appendChild(addCart);

      content.appendChild(productName);
      content.appendChild(metaRow);

      product_div.appendChild(product_img);
      product_div.appendChild(content);
      store.appendChild(product_div);
    }
  }

  function makeStars(value) {
    const wrap = document.createElement("span");
    wrap.className = "stars";
    for (let i = 1; i <= 5; i++) {
      const iEl = document.createElement("i");
      iEl.className =
        value >= i
          ? "bx bxs-star"
          : value >= i - 0.5
          ? "bx bxs-star-half"
          : "bx bx-star";
      iEl.setAttribute("aria-hidden", "true");
      wrap.appendChild(iEl);
    }
    return wrap;
  }

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
          for (var org of result[0]["Organizations"]) {
            if (org["org_id"] == ORG_ID) {
              console.log(org);
              SetPoints(org["spo_pointbalance"]);
              PointConversionRate = org["org_conversion_rate"];
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function SetPoints(points) {
    let point = document.getElementById("points");
    point.innerText = points;
    CurrDriverPoints = parseInt(points);
  }

  async function RemoveItem(id) {
    console.log(id);
    const data = {
      user_id: USER_ID,
      org_id: ORG_ID,
      items: [parseInt(id)],
    };
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/remove_from_cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // IMPORTANT
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        if (response.status != 200) {
          alert(result.message);
        } else if (response.status == 200) {
          GetShop();
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  GetUser();
  GetShop();
};
