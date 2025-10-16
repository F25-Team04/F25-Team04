const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
let User = {};
let PointConversionRate;
let currentPage = 1;
const ITEMS_PER_PAGE = 6;
let storeItems = [];
window.onload = function() {
    var list = this.document.getElementById("links")
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../driver/driver.html?id=" + USER_ID 
    link.textContent = "Home"
    li.appendChild(link)
    const store = document.createElement("a");
    store.href = "../DriverStorePage/DriverStore.html?id=" + USER_ID
    store.textContent = "Store"
    li.appendChild(store)
    list.appendChild(li);

    async function GetShop() {
        try {
        // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/products", {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
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
        var store = document.getElementById("store-catalog")
        store.innerHTML = "";
        console.log(items)
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = items.slice(start, end);
        for (var product of pageItems) {
            const product_div = document.createElement("div")
            product_div.className = "product_wrapper"
            const product_img = document.createElement("img")
            product_img.className = "product_image"
            product_img.src = product["image"] || product.image || ""
            const product_desc = document.createElement("p")
            product_desc.className = "product_desc"
            const PricePoints = ((PointConversionRate || 1) * Number(product["price"] || product.price || 0)).toFixed(2)
            const rating = (product["rating"] && product["rating"]["rate"]) || (product.rating && product.rating.rate) || "N/A"
            product_desc.innerText = (product["title"] || product.title || "Untitled") + "\n\nRating: " + rating + " out of 5\nCost: " + PricePoints + " points"
            product_div.appendChild(product_img)
            product_div.appendChild(product_desc)
            store.appendChild(product_div)
        }
    }

    function renderPage() {
        if (!storeItems || storeItems.length === 0) {
            document.getElementById("store-catalog").innerHTML = "<p>No items available in the store.</p>";
            document.getElementById("pagination").innerHTML = "";
            return;
        }
        const totalPages = Math.max(1, Math.ceil(storeItems.length / ITEMS_PER_PAGE));
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        GenerateStore(storeItems);
    }

    function renderPagination() {
        const totalPages = Math.max(1, Math.ceil(storeItems.length / ITEMS_PER_PAGE));
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
        pag.appendChild(makeButton("Previous", Math.max(1, currentPage - 1), currentPage === 1, false));
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            pag.appendChild(makeButton(i, i, false, i === currentPage));
        }
        // Next button
        pag.appendChild(makeButton("Next", Math.min(totalPages, currentPage + 1), currentPage === totalPages, false));
    }

    async function GetUser() {
        try {
        // Send POST request
            const response = await fetch("https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/user?id=" + USER_ID, {
            method: "GET",
            });
            if (response.ok) {
                const result = await response.json();
                if (response.success == false) {
                    alert(result.message);
                }
                else if (response.status == 200) {
                    PointConversionRate = result[0]["Convert"]
                    SetPoints(result[0]["Point Balance"])
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }
    function SetPoints(points) {
        let point = document.getElementById("points")
        point.innerText = "Current Points: " + points

    }
    GetUser()
    GetShop()
}
