// Authorized Admins Credentials Object
const AUTHORIZED_ADMINS = {
  "abhishek": "iitg2026",
  "pankaj": "nfc2026",
  "admin": "pass1234"
};

document.addEventListener("DOMContentLoaded", function () {
  // Pre-fill today's date on load
  const dateInput = document.getElementById("dateInput");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    dateInput.value = `${dd}/${mm}/${yy}`;
  }
  
  checkAdminSession();
});

// Verifies credentials, initializes the date/course, and creates the column in Google Sheet
async function verifyAndStartClass() {
  const adminIDInput = document.getElementById("adminID");
  const adminPassInput = document.getElementById("adminPasscode");
  const dateInput = document.getElementById("dateInput");
  const courseSelect = document.getElementById("courseSelect");
  const errorDiv = document.getElementById("loginError");

  if (!adminIDInput || !adminPassInput || !dateInput) return;

  const adminID = adminIDInput.value.trim().toLowerCase();
  const pass = adminPassInput.value.trim();
  const dateStr = dateInput.value.trim();
  const selectedCourse = courseSelect ? courseSelect.value : "OS Lab";

  if (!dateStr) {
    if (errorDiv) errorDiv.innerText = "❌ Please enter a valid class date!";
    return;
  }

  // Validate admin login credentials
  if (AUTHORIZED_ADMINS[adminID] && AUTHORIZED_ADMINS[adminID] === pass) {
    sessionStorage.setItem("adminLoggedIn", "true");
    sessionStorage.setItem("activeAdminID", adminID);
    sessionStorage.setItem("activeDate", dateStr);
    sessionStorage.setItem("activeCourse", selectedCourse);

    if (errorDiv) errorDiv.innerText = "Creating column in Sheet...";

    // Set global variables in index.html
    window.activeDate = dateStr;
    window.activeCourse = selectedCourse;

    // Send API call to create sheet column
    await sendRequest({ action: "createColumn", dateStr: dateStr });

    if (errorDiv) errorDiv.innerText = "";
    showDashboard();
  } else {
    if (errorDiv) {
      errorDiv.innerText = "❌ Invalid Admin ID or Password!";
    }
  }
}

// Validates password only (for marking absentees prompt)
function validatePasswordOnly(adminID, pass) {
  if (!adminID || !pass) return false;
  return AUTHORIZED_ADMINS[adminID.toLowerCase()] === pass.trim();
}

function checkAdminSession() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
  if (isLoggedIn) {
    window.activeDate = sessionStorage.getItem("activeDate") || "";
    window.activeCourse = sessionStorage.getItem("activeCourse") || "OS Lab";
    showDashboard();
  } else {
    hideDashboard();
  }
}

function showDashboard() {
  const loginCard = document.getElementById("loginCard");
  const mainDashboard = document.getElementById("mainDashboard");
  const adminBadge = document.getElementById("adminBadge");
  const sessionInfo = document.getElementById("sessionInfo");

  if (loginCard) loginCard.style.display = "none";
  if (mainDashboard) mainDashboard.style.display = "block";

  const activeUser = sessionStorage.getItem("activeAdminID") || "Admin";
  if (adminBadge) {
    adminBadge.innerText = `👤 Logged in: ${activeUser}`;
  }

  if (sessionInfo) {
    sessionInfo.innerText = `Course: ${window.activeCourse} | Date: ${window.activeDate}`;
  }
}

function hideDashboard() {
  const loginCard = document.getElementById("loginCard");
  const mainDashboard = document.getElementById("mainDashboard");

  if (loginCard) loginCard.style.display = "block";
  if (mainDashboard) mainDashboard.style.display = "none";
}

function logoutAdmin() {
  sessionStorage.removeItem("adminLoggedIn");
  sessionStorage.removeItem("activeAdminID");
  sessionStorage.removeItem("activeDate");
  sessionStorage.removeItem("activeCourse");

  const passInput = document.getElementById("adminPasscode");
  const errorDiv = document.getElementById("loginError");

  if (passInput) passInput.value = "";
  if (errorDiv) errorDiv.innerText = "";

  hideDashboard();
}