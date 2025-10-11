const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
let User = {};
let PointConversionRate;
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
                    GenerateStore(result)
                }

            } 
            } catch (error) {
                console.error("Error:", error);
            }
    }
    function GenerateStore(items) {
        var store = document.getElementById("store-catalog")
        console.log(items)
        for (var item of items) {
            product_div = document.createElement("div")
            product_div.id = "product_wrapper"
            product_img = document.createElement("img")
            product_img.id = "product_image"
            product_img.src = item["image"] 
            product_desc = document.createElement("p")
            product_desc.id = "product_desc_id"
            var PricePoints = (PointConversionRate * item["price"]).toFixed(2)
            product_desc.innerText = item["title"] + "\n\nRating: " + item["rating"]["rate"] + " out of 5\nCost: " + PricePoints + " points"
            
            product_div.appendChild(product_img)
            product_div.appendChild(product_desc)
            store.appendChild(product_div)
        }
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