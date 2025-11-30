const params = new URLSearchParams(window.location.search);
const USER_ID = params.get("id");
const ORG_ID = params.get("org");

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
    about.href = `../about/about.html?id=${USER_ID}&org=${ORG_ID}`;
  }

  const list = document.getElementById("links");
  const li = document.createElement("li");

  function add(path, text) {
    const a = document.createElement("a");
    a.href = `${path}?id=${USER_ID}&org=${ORG_ID}`;
    a.textContent = text;
    li.appendChild(a);
  }

  add("../SponsorHomepage/SponsorHome.html", "Dashboard");
  add("../SponsorCatalogView/SponsorCatalogView.html", "Catalog View");
  add(
    "../SponsorChangeConversionRate/ChangeConversionRate.html",
    "Change Point Conversion Rate"
  );
  add("../SponsorBulkLoad/SponsorBulkLoad.html", "Bulk Loader");
  add("../SponsorImpersonator/SponsorImpersonator.html", "Impersonation");

  list.appendChild(li);
}

// ============================================================
// SUBMIT FILE TO API (in chunks if needed)
// ============================================================
async function submitBulk() {
  showLoader();
  try {
    const fileInput = document.getElementById("commandFile");

    if (!fileInput || !fileInput.files.length) {
      alert("Please select a .txt file.");
      return;
    }

    const file = fileInput.files[0];

    if (!file.name.endsWith(".txt")) {
      alert("Only .txt files are allowed.");
      return;
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/);

    const encoder = new TextEncoder();

    // cap the encoded JSON body around ~1 MB under the 10MB limit
    const MAX_REQUEST_BYTES = 1 * 1024 * 1024;
    const MAX_LINES_PER_BATCH = 1000;

    const batches = [];
    let currentLines = [];
    let currentStartLine = 1;
    let currentCommandsText = "";
    let currentCommandsBytes = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // text to add (include newline if needed)
      const addition = currentCommandsText.length ? "\n" + line : line;
      const additionBytes = encoder.encode(addition).length;

      // We only approximate JSON overhead (keys user_id / commands / start_line),
      // so this is conservative.
      const estimatedJsonBytes = currentCommandsBytes + additionBytes + 1024;

      const wouldExceedBytes =
        currentLines.length > 0 && estimatedJsonBytes > MAX_REQUEST_BYTES;
      const wouldExceedLines = currentLines.length >= MAX_LINES_PER_BATCH;

      // If adding this line would blow the limit, close current batch (if it has content)
      if (currentLines.length > 0 && (wouldExceedBytes || wouldExceedLines)) {
        batches.push({
          startLine: currentStartLine,
          commands: currentCommandsText,
        });

        // Start a new batch
        currentLines = [line];
        currentStartLine = i + 1; // next line index, 1-based
        currentCommandsText = line;
        currentCommandsBytes = encoder.encode(line).length;
      } else {
        // Safe to add to current batch
        currentLines.push(line);
        currentCommandsText += addition;
        currentCommandsBytes += additionBytes;
      }
    }

    // Push final batch if any lines remain
    if (currentLines.length > 0) {
      batches.push({
        startLine: currentStartLine,
        commands: currentCommandsText,
      });
    }

    setLoaderProgress(
      "Prepared bulk batches:",
      batches.map((b) => ({
        startLine: b.startLine,
        approxBytes: encoder.encode(
          JSON.stringify({
            user_id: Number(USER_ID),
            commands: b.commands,
            start_line: b.startLine,
          })
        ).length,
      }))
    );

    // Clear previous results
    const errorsPanel = document.getElementById("errorsList");
    const successPanel = document.getElementById("successList");
    if (errorsPanel) errorsPanel.innerHTML = "";
    if (successPanel) successPanel.innerHTML = "";

    const allResults = { successes: [], errors: [] };

    for (const batch of batches) {
      const body = {
        user_id: Number(USER_ID),
        commands: batch.commands,
        start_line: batch.startLine,
      };

      // Optional debugging: see exact request size
      const jsonStr = JSON.stringify(body);
      const byteLength = encoder.encode(jsonStr).length;
      setLoaderProgress(
        `Sending batch starting at line ${batch.startLine}, size ≈ ${byteLength} bytes`
      );

      try {
        const response = await fetch(
          "https://ozbssob4k2.execute-api.us-east-1.amazonaws.com/dev/bulk_load",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: jsonStr,
          }
        );

        if (!response.ok) {
          console.error(
            "Bulk request failed for batch starting at line",
            batch.startLine,
            "status:",
            response.status
          );
          alert(
            "Bulk upload failed for part of the file. " +
              "Check the results and try again."
          );
          continue;
        }

        const result = await response.json();
        allResults.successes.push(...(result.successes || []));
        allResults.errors.push(...(result.errors || []));
      } catch (err) {
        console.error(
          "Bulk error for batch starting at line",
          batch.startLine,
          err
        );
        alert("An error occurred while uploading a part of the bulk file.");
      }
    }

    // Render combined results with global line numbers
    loadResults(allResults);
  } finally {
    hideLoader();
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

  result.errors?.forEach((err) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>Line ${err.line}</strong><br>${err.error}`;
    errors.appendChild(div);
  });

  result.successes?.forEach((s) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>Line ${s.line}</strong> (${s.type})<br>${s.detail}`;
    success.appendChild(div);
  });
}

// ============================================================
// LOADING SPINNER
// ============================================================
function showLoader(message = "Processing...") {
  const overlay = document.getElementById("loadingOverlay");
  const msg = document.getElementById("loadingMessage");
  if (overlay) overlay.classList.remove("hidden");
  if (msg) msg.textContent = message;
}

function hideLoader() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function setLoaderProgress(text = "") {
  const prg = document.getElementById("loadingProgress");
  if (prg) prg.textContent = text;
}
