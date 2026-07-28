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

async function verifyAndStartClass() {
  const adminIDInput = document.getElementById("adminID");
  const dateInput = document.getElementById("dateInput");
  const courseSelect = document.getElementById("courseSelect");
  const errorDiv = document.getElementById("loginError");

  // Fetch the real unmasked password string from helper
  const pass = typeof getRealPassword === "function" ? getRealPassword("adminPasscode") : "";
  const adminID = adminIDInput ? adminIDInput.value.trim().toLowerCase() : "";
  const dateStr = dateInput ? dateInput.value.trim() : "";
  const selectedCourse = courseSelect ? courseSelect.value : "OS_lab_att";

  if (!dateStr) {
    if (errorDiv) errorDiv.innerText = "❌ Please enter a valid class date!";
    return;
  }

  if (AUTHORIZED_ADMINS[adminID] && AUTHORIZED_ADMINS[adminID] === pass) {
    sessionStorage.setItem("adminLoggedIn", "true");
    sessionStorage.setItem("activeAdminID", adminID);
    sessionStorage.setItem("activeDate", dateStr);
    sessionStorage.setItem("activeCourse", selectedCourse);

    if (errorDiv) errorDiv.innerText = "Creating column in Sheet...";

    window.activeDate = dateStr;
    window.activeCourse = selectedCourse;

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

function openEndClassModal() {
  const modal = document.getElementById("endClassModal");
  const errDiv = document.getElementById("modalError");

  if (typeof clearRealPassword === "function") clearRealPassword("endClassPasscode");
  if (errDiv) errDiv.innerText = "";
  if (modal) modal.style.display = "flex";
}

function closeEndClassModal() {
  const modal = document.getElementById("endClassModal");
  if (modal) modal.style.display = "none";
}

async function confirmAndEndClass() {
  const activeAdminID = sessionStorage.getItem("activeAdminID");
  const errDiv = document.getElementById("modalError");
  const enteredPass = typeof getRealPassword === "function" ? getRealPassword("endClassPasscode") : "";

  if (AUTHORIZED_ADMINS[activeAdminID.toLowerCase()] === enteredPass) {
    closeEndClassModal();
    document.getElementById('statusMsg').innerText = "Marking absentees...";
    await sendRequest({ action: "markAbsentees", dateStr: activeDate });
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
    window.activeCourse = sessionStorage.getItem("activeCourse") || "Attendance";
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
    sessionInfo.innerText = `Course: ${window.activeCourse || 'Attendance'} | Date: ${window.activeDate}`;
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

  if (typeof clearRealPassword === "function") clearRealPassword("adminPasscode");
  const errorDiv = document.getElementById("loginError");
  if (errorDiv) errorDiv.innerText = "";

  hideDashboard();
}