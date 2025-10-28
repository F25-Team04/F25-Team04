const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
let User = {};
let PointConversionRate;
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let storeItems = [];

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
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/products",
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          storeItems = Array.isArray(result) ? result : [];
          renderPage();
          renderPagination();
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  function GenerateStore(items) {
    var store = document.getElementById("store-catalog");
    store.innerHTML = "";
    console.log(items);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = items.slice(start, end);
    for (var product of pageItems) {
      const product_div = document.createElement("div");
      product_div.className = "product_wrapper";
      const product_img = document.createElement("img");
      product_img.className = "product_image";
      product_img.src = product["image"] || product.image || "";

      const content = document.createElement("div");
      content.className = "product_content";

      const totalCents = Math.round(
        Number(product["price"] || product.price || 0) * 100
      );
      const dollars = Math.floor(totalCents / 100);
      const cents = totalCents % 100;
      const PricePoints = String(dollars * 10 + cents);

      const rating =
        (product["rating"] && product["rating"]["rate"]) ||
        (product.rating && product.rating.rate) ||
        "N/A";
      const title = product["title"] || product.title || "Untitled";

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
        GenerateOrderSummary(product, PricePoints);
      });

      metaRow.appendChild(productRating);
      metaRow.appendChild(productCost);
      metaRow.appendChild(orderButton);

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

  function GenerateOrderSummary(prod, cost) {
    document.getElementById("order_img").src = prod["image"];
    document.getElementById("order_address").innerText = User["Address"];
    document.getElementById("order_product").innerText = prod["title"];
    document.getElementById("order_cost").innerText = cost;
  }

  function renderPage() {
    if (!storeItems || storeItems.length === 0) {
      document.getElementById("store-catalog").innerHTML =
        "<p>No items available in the store.</p>";
      document.getElementById("pagination").innerHTML = "";
      return;
    }
    const totalPages = Math.max(
      1,
      Math.ceil(storeItems.length / ITEMS_PER_PAGE)
    );
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    GenerateStore(storeItems);
  }

  function renderPagination() {
    const totalPages = Math.max(
      1,
      Math.ceil(storeItems.length / ITEMS_PER_PAGE)
    );
    const pag = document.getElementById("pagination");
    pag.innerHTML = "";

    const makeButton = (label, page, disabled = false, isActive = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.className = "page-btn";
      // store page number and disabled state
      button.dataset.page = page;
      button.disabled = !!disabled;
      if (isActive) button.classList.add("active");
      button.addEventListener("click", () => {
        const targetPage = Number(button.dataset.page);
        if (targetPage === currentPage) return;
        currentPage = targetPage;
        renderPage();
        renderPagination();
      });
      return button;
    };

    // Previous button
    pag.appendChild(
      makeButton(
        "Previous",
        Math.max(1, currentPage - 1),
        currentPage === 1,
        false
      )
    );
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      pag.appendChild(makeButton(i, i, false, i === currentPage));
    }
    // Next button
    pag.appendChild(
      makeButton(
        "Next",
        Math.min(totalPages, currentPage + 1),
        currentPage === totalPages,
        false
      )
    );
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
          PointConversionRate = result[0]["Convert"];
          SetPoints(result[0]["Point Balance"]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function SetPoints(points) {
    let point = document.getElementById("points");
    point.innerText = points;
  }

  GetUser();
  GetShop();
};
