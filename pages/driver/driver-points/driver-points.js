const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");

window.onload = function() {
    var list = this.document.getElementById("links")
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../driver.html?id=" + USER_ID 
    link.textContent = "Dashboard"
    li.appendChild(link)
    const store = document.createElement("a");
    store.href = "../../DriverStorePage/DriverStore.html?id=" + USER_ID
    store.textContent = "Store"
    li.appendChild(store)
    list.appendChild(li);
}