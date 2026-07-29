/**
 * Admin Authentication & Session Management Module
 */

const AUTHORIZED_ADMINS = {
  "abhishek": "iitg2026",
  "pankaj": "nfc2026",
  "admin": "pass1234"
};

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

// Helper to check if entered DD/MM/YY date is strictly before today
function isBackdate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);
  if (year < 100) year += 2000;

  const enteredDate = new Date(year, month, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return enteredDate < today;
}

async function verifyAndStartClass() {
  const adminIDInput = document.getElementById("adminID");
  const adminPassInput = document.getElementById("adminPasscode");
  const dateInput = document.getElementById("dateInput");
  const courseSelect = document.getElementById("courseSelect");
  const errorDiv = document.getElementById("loginError");

  const adminID = adminIDInput ? adminIDInput.value.trim().toLowerCase() : "";
  const pass = adminPassInput ? adminPassInput.value.trim() : "";
  const dateStr = dateInput ? dateInput.value.trim() : "";
  const selectedCourse = courseSelect ? courseSelect.value : "OS_lab_att";

  if (!dateStr) {
    if (errorDiv) errorDiv.innerText = "❌ Please enter a valid class date!";
    return;
  }

  // Validate date is not before current date
  if (isBackdate(dateStr)) {
    if (errorDiv) errorDiv.innerText = "❌ Backdate attendance is invalid! Enter today's or a future date.";
    return;
  }

  // Validate credentials directly
  if (AUTHORIZED_ADMINS[adminID] && AUTHORIZED_ADMINS[adminID] === pass) {
    sessionStorage.setItem("adminLoggedIn", "true");
    sessionStorage.setItem("activeAdminID", adminID);
    sessionStorage.setItem("activeDate", dateStr);
    sessionStorage.setItem("activeCourse", selectedCourse);

    if (errorDiv) errorDiv.innerText = "";

    window.activeDate = dateStr;
    window.activeCourse = selectedCourse;

    if (typeof sendRequest === "function") {
      await sendRequest({ action: "createColumn", dateStr: dateStr });
    }

    showDashboard();
  } else {
    if (errorDiv) {
      errorDiv.innerText = "❌ Invalid Admin ID or Password!";
    }
  }
}

function openEndClassModal() {
  const modal = document.getElementById("endClassModal");
  const passInput = document.getElementById("endClassPasscode");
  const errDiv = document.getElementById("modalError");

  if (passInput) passInput.value = "";
  if (errDiv) errDiv.innerText = "";
  if (modal) modal.style.display = "flex";
}

function closeEndClassModal() {
  const modal = document.getElementById("endClassModal");
  if (modal) modal.style.display = "none";
}

async function confirmAndEndClass() {
  const activeAdminID = sessionStorage.getItem("activeAdminID");
  const passInput = document.getElementById("endClassPasscode");
  const errDiv = document.getElementById("modalError");

  const enteredPass = passInput ? passInput.value.trim() : "";

  if (AUTHORIZED_ADMINS[activeAdminID.toLowerCase()] === enteredPass) {
    closeEndClassModal();

    if (typeof sendRequest === "function") {
      await sendRequest({ action: "markAbsentees", dateStr: activeDate });
    }

    alert(`Absentees marked for ${activeDate} in "${activeCourse}" tab! Class session ended.`);
    logoutAdmin();
  } else {
    if (errDiv) errDiv.innerText = "❌ Incorrect Password!";
  }
}

function checkAdminSession() {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
  if (isLoggedIn) {
    window.activeDate = sessionStorage.getItem("activeDate") || "";
    window.activeCourse = sessionStorage.getItem("activeCourse") || "OS_lab_att";
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
    sessionInfo.innerText = `Course: ${window.activeCourse || 'OS_lab_att'} | Date: ${window.activeDate}`;
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