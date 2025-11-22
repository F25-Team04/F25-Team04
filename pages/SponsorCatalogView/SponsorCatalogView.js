const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
let User = {};
let PointConversionRate;
let currentPage = 1;
const ITEMS_PER_PAGE = 8;
let storeItems = [];
let CurrDriverPoints;

window.onload = function () {
  const form = this.document.getElementById("create-catalog");
  const dropdown = document.getElementById("rule-type");
  dropdown.addEventListener("change", () => {
    let div = this.document.getElementById("input");
    div.innerHTML = "";
    console.log(dropdown.value);
    if (dropdown.value === "category") {
      var input = this.document.createElement("select");
      var categories = [
        "men's clothing",
        "women's clothing",
        "jewelery",
        "electronics",
      ];
      var placeholder = document.createElement("option");
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.hidden = true;
      placeholder.textContent = "Select Item category...";
      input.appendChild(placeholder);
      for (let category of categories) {
        var option = this.document.createElement("option");
        option.textContent = category;
        input.appendChild(option);
      }
    } else if (dropdown.value === "max_price") {
      var input = this.document.createElement("input");
      input.placeholder = "Input Max Price";
      input.id = "answer";
      input.type = "number";
    } else if (dropdown.value === "min_price") {
      var input = this.document.createElement("input");
      input.placeholder = "Input Min Price";
      input.id = "answer";
      input.type = "number";
    }
    div.appendChild(input);

    input.addEventListener("change", function () {
      button = document.createElement("button");
      button.type = "submit";
      button.textContent = "Add Rule";
      div.appendChild(button);
    });
    form.appendChild(div);
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      try {
        const data = {
          org: ORG_ID,
          type: dropdown.value,
          value: input.value,
        };
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/catalog_rules",
          {
            method: "POST",
            body: JSON.stringify(data),
          }
        );
        if (response.ok) {
          const result = await response.json();
          if (response.success == false) {
            alert(result.message);
          } else if (response.status == 200) {
            window.location.reload();
          }
        }
        console.log(data);
      } catch (error) {
        console.error("Error:", error);
      }
    });
  });
  function CatalogRuleList(rules) {
    const list = document.getElementById("list-rule");
    list.innerHTML = "";
    if (rules.length == 0) {
      let item = document.createElement("div");
      let text = document.createElement("p");
      text.innerText = "Your Organization Does Not Have Catalog Rules";
      item.appendChild(text);
      list.appendChild(item);
    }
    rules.forEach((rule) => {
      let item = document.createElement("div");
      let text = document.createElement("p");
      let point = document.createElement("p");
      let button = document.createElement("button");
      item.id = "rule-row";
      point.id = "pointnum";
      text.id = "rule-descript";
      text.textContent = rule["Rule Type"];
      point.textContent = rule["Rule Value"];
      button.innerText = "Delete Rule";
      button.addEventListener("click", function () {
        DeleteCatalogRule(rule["Catalog Rule ID"]);
      });
      item.appendChild(text);
      item.appendChild(point);
      item.appendChild(button);
      list.appendChild(item);
    });
  }
  async function DeleteCatalogRule(id) {
    console.log(id);
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/catalog_rules?id=" +
          id,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (response.success == false) {
          alert(result.message);
        } else if (response.status == 200) {
          console.log(result);
          GetCatalogRules(result);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async function GetCatalogRules() {
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/catalog_rules?org=" +
          ORG_ID,
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
          CatalogRuleList(result);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function GetShop() {
    try {
      // Send POST request
      const response = await fetch(
        "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/products?org=" +
          ORG_ID,
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
    for (let product of items) {
      const product_div = document.createElement("div");
      product_div.className = "product_wrapper";
      const product_img = document.createElement("img");
      product_img.className = "product_image";
      product_img.src = product["image"] || product.image || "";

      const content = document.createElement("div");
      content.className = "product_content";
      console.log(PointConversionRate);
      const PricePoints = parseInt(product["price"]) / PointConversionRate;

      const totalCents = Math.round(
        Number(product["price"] || product.price || 0) * 100
      );
      const dollars = Math.floor(totalCents / 100);
      const cents = totalCents % 100;

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

      metaRow.appendChild(productRating);
      metaRow.appendChild(productCost);

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

  function renderPage() {
    if (!storeItems || storeItems.length === 0) {
      document.getElementById("store-catalog").innerHTML =
        "<p>No items available in the store.</p>";
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
          console.log(PointConversionRate);
          for (var org of result[0]["Organizations"]) {
            if (org["org_id"] == ORG_ID) {
              console.log(org);
              PointConversionRate = org["org_conversion_rate"];
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  GetUser();
  GetCatalogRules();
  GetShop();
};
