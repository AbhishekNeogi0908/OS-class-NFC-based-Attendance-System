/**
 * Admin Authentication & Session Management Module
 * NFC Attendance Station
 */

// Authorized Admins Credentials Object (Add or remove admins here)
const AUTHORIZED_ADMINS = {
  "abhishek": "iitg2026",
  "pankaj": "nfc2026",
  "admin": "pass1234"
};

// Run session check and pre-fill date on page load
document.addEventListener("DOMContentLoaded", function () {
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

/**
 * Verifies admin credentials, initializes session state,
 * and calls Apps Script to create the date column in the target sheet.
 */
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
  const selectedCourse = courseSelect ? courseSelect.value : "OS_lab_att";

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

    // Set global variables used in index.html
    window.activeDate = dateStr;
    window.activeCourse = selectedCourse;

    // Dispatch column creation request to Apps Script
    if (typeof sendRequest === "function") {
      await sendRequest({ action: "createColumn", dateStr: dateStr });
    }

    if (errorDiv) errorDiv.innerText = "";
    showDashboard();
  } else {
    if (errorDiv) {
      errorDiv.innerText = "❌ Invalid Admin ID or Password!";
    }
  }
}

/**
 * Validates password only (used for the "Mark Absentees" admin prompt)
 */
function validatePasswordOnly(adminID, pass) {
  if (!adminID || !pass) return false;
  return AUTHORIZED_ADMINS[adminID.toLowerCase()] === pass.trim();
}

/**
 * Checks session storage on page load/refresh
 */
function checkAdminSession() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
  if (isLoggedIn) {
    window.activeDate = sessionStorage.getItem("activeDate") || "";
    window.activeCourse = sessionStorage.getItem("activeCourse") || "Attendance";
    showDashboard();
  } else {
    hideDashboard();
  }
}

/**
 * Unlocks the main scanning dashboard and updates session details
 */
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
    sessionInfo.innerText = `Course: ${window.activeCourse || 'Attendance'} | Date: ${window.activeDate}`;
  }
}

/**
 * Hides main station UI and presents the login card
 */
function hideDashboard() {
  const loginCard = document.getElementById("loginCard");
  const mainDashboard = document.getElementById("mainDashboard");

  if (loginCard) loginCard.style.display = "block";
  if (mainDashboard) mainDashboard.style.display = "none";
}

/**
 * Clears session tokens and logs out the current admin
 */
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