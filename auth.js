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

// Check for existing session as soon as DOM content is ready
document.addEventListener("DOMContentLoaded", function () {
  checkAdminSession();
});

/**
 * Validates entered Admin ID and Password against AUTHORIZED_ADMINS
 */
function verifyAdmin() {
  const adminIDInput = document.getElementById("adminID");
  const adminPassInput = document.getElementById("adminPasscode");
  const errorDiv = document.getElementById("loginError");

  if (!adminIDInput || !adminPassInput) return;

  const adminID = adminIDInput.value.trim().toLowerCase();
  const pass = adminPassInput.value.trim();

  // Validate credentials
  if (AUTHORIZED_ADMINS[adminID] && AUTHORIZED_ADMINS[adminID] === pass) {
    // Save active session token to browser storage
    sessionStorage.setItem("adminLoggedIn", "true");
    sessionStorage.setItem("activeAdminID", adminID);
    
    if (errorDiv) errorDiv.innerText = "";
    showDashboard();
  } else {
    if (errorDiv) {
      errorDiv.innerText = "❌ Invalid Admin ID or Password!";
    }
  }
}

/**
 * Checks session storage on page load/refresh
 */
function checkAdminSession() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
  if (isLoggedIn) {
    showDashboard();
  } else {
    hideDashboard();
  }
}

/**
 * Unlocks the main dashboard view and pre-fills active session info
 */
function showDashboard() {
  const loginCard = document.getElementById("loginCard");
  const mainDashboard = document.getElementById("mainDashboard");
  const adminBadge = document.getElementById("adminBadge");

  if (loginCard) loginCard.style.display = "none";
  if (mainDashboard) mainDashboard.style.display = "block";

  // Display active admin ID in badge if element exists
  const activeUser = sessionStorage.getItem("activeAdminID") || "Admin";
  if (adminBadge) {
    adminBadge.innerText = `👤 Logged in as: ${activeUser}`;
  }

  // Pre-fill today's date in DD/MM/YY format if date field exists and is empty
  const dateInput = document.getElementById("dateInput");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    dateInput.value = `${dd}/${mm}/${yy}`;
  }
}

/**
 * Hides main station and presents the login card
 */
function hideDashboard() {
  const loginCard = document.getElementById("loginCard");
  const mainDashboard = document.getElementById("mainDashboard");

  if (loginCard) loginCard.style.display = "block";
  if (mainDashboard) mainDashboard.style.display = "none";
}

/**
 * Clears session tokens and logs out current admin
 */
function logoutAdmin() {
  sessionStorage.removeItem("adminLoggedIn");
  sessionStorage.removeItem("activeAdminID");

  const idInput = document.getElementById("adminID");
  const passInput = document.getElementById("adminPasscode");
  const errorDiv = document.getElementById("loginError");

  if (idInput) idInput.value = "";
  if (passInput) passInput.value = "";
  if (errorDiv) errorDiv.innerText = "";

  hideDashboard();
}