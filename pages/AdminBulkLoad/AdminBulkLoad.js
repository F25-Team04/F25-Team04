const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");
const ROLE = params.get("role");

window.onload = function () {
    setupNavBar();
    document.getElementById("submitFile").addEventListener("click", submitBulk);
    
    // COLLAPSIBLE FORMAT GUIDE
    const toggleBtn = document.getElementById("toggleGuideBtn");
    const guideContainer = document.getElementById("formatGuide");

    if (toggleBtn && guideContainer) {

        // Start collapsed — remove this line if you want expanded by default
        guideContainer.classList.remove("open");

        toggleBtn.addEventListener("click", () => {
            const isOpen = guideContainer.classList.toggle("open");
            toggleBtn.textContent = isOpen
                ? "Text Document Format Guide ▼"
                : "Text Document Format Guide ▲";
        });
    }
};


// ============================================================
// NAVBAR BUILDER
// ============================================================
function setupNavBar() {
    const about = document.getElementById("about-page");
    if (about) {
        about.href = `../about/about.html?id=${USER_ID}&org=${ORG_ID}&role=${ROLE}`;
    }

    const list = document.getElementById("links");
    const li = document.createElement("li");

    function add(path, text) {
        const a = document.createElement("a");
        a.href = `${path}?id=${USER_ID}&org=${ORG_ID}&role=${ROLE}`;
        a.textContent = text;
        li.appendChild(a);
    }

    add("../SponsorHomepage/SponsorHome.html", "Home");
    add("../SponsorCreateDriver/SponsorCreateDriver.html", "Create Driver");
    add("../SponsorCreateSponsor/SponsorCreateSponsor.html", "Create Sponsor");
    add("../SponsorApplicationPage/sponsor-applications.html", "Applications");
    add("../SponsorChangeConversionRate/ChangeConversionRate.html", "Change Point Conversion Rate");

    // New page added to navbar:
    add("../BulkLoad/BulkLoad.html", "Bulk Loader");

    list.appendChild(li);
}


// ============================================================
// SUBMIT FILE TO API
// ============================================================
async function submitBulk() {
    const fileInput = document.getElementById("commandFile");
    
    if (!fileInput.files.length) {
        alert("Please select a .txt file.");
        return;
    }

    const file = fileInput.files[0];

    if (!file.name.endsWith(".txt")) {
        alert("Only .txt files allowed.");
        return;
    }

    const text = await file.text();

    const body = {
        user_id: Number(USER_ID),
        commands: text
    };

    try {
        const response = await fetch(
            "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/bulk_load",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
        );

        const result = await response.json();
        alert(result.message);
        loadResults(result);

    } catch (err) {
        console.error("Bulk error:", err);
        alert("Error sending bulk file.\n" + err.message);
    }
}


// ============================================================
// POPULATE ERROR + SUCCESS PANELS
// ============================================================
function loadResults(result) {
    const errors = document.getElementById("errorsList");
    const success = document.getElementById("successList");

    errors.innerHTML = "";
    success.innerHTML = "";

    result.errors?.forEach(err => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<strong>Line ${err.line}</strong><br>${err.error}`;
        errors.appendChild(div);
    });

    result.successes?.forEach(s => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<strong>Line ${s.line}</strong> (${s.type})<br>${s.detail}`;
        success.appendChild(div);
    });
}
