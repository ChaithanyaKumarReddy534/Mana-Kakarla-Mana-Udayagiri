import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgSnIyYPtGoh4Ad3UUDAYDIe0ji3h4OE0",
  authDomain: "smart-grievance-system-fdff7.firebaseapp.com",
  databaseURL: "https://smart-grievance-system-fdff7-default-rtdb.firebaseio.com",
  projectId: "smart-grievance-system-fdff7",
  storageBucket: "smart-grievance-system-fdff7.firebasestorage.app",
  messagingSenderId: "407276556461",
  appId: "1:407276556461:web:ed52c1c7d18458ebb2f624"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==================== PUBLIC SITE FUNCTIONS ====================

// Smooth scroll to section
window.scrollToSection = (id) => {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
};

// Handle search
window.handleSearch = () => {
  const query = document.getElementById('heroSearch').value.trim();
  if (query) {
    document.getElementById('track-section').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('trackInput').value = query;
    trackComplaint();
  }
};

// COMPLAINT FORM
const form = document.getElementById("complaintForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMessage");

if (form) {
  const attachmentsInput = document.getElementById("attachments");
  const filePreview = document.getElementById("filePreview");
  const fileLabel = document.querySelector(".file-label");

  if (fileLabel) {
    fileLabel.addEventListener("click", () => attachmentsInput.click());
  }

  if (attachmentsInput) {
    attachmentsInput.addEventListener("change", (e) => {
      filePreview.innerHTML = "";
      filePreview.style.display = "block";
      Array.from(e.target.files).forEach(file => {
        const div = document.createElement("div");
        div.className = "file-preview-item";
        if (file.type.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = URL.createObjectURL(file);
          img.style.width = "60px";
          img.style.height = "60px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "5px";
          img.style.marginRight = "10px";
          div.appendChild(img);
        }
        div.innerHTML += file.name + ` (${(file.size/1024).toFixed(1)}KB) <br><small>${file.type}</small>`;
        filePreview.appendChild(div);
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const mandal = document.getElementById("mandal").value;
    const issue = document.getElementById("issue").value;
    const files = attachmentsInput ? attachmentsInput.files : [];
    const attachments = Array.from(files).map(f => f.name);

    if (!name || !phone || !mandal || !issue) {
      alert("దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లు ఫిల్ చేయండి | Please fill all required fields.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';

    try {
      await push(ref(db, "complaints"), {
        name, phone, mandal, issue, attachments,
        status: "Pending",
        time: new Date().toLocaleString()
      });
    } catch (error) {
      console.error("Firebase error:", error);
    }

    form.style.display = "none";
    successMsg.style.display = "block";

    setTimeout(() => {
      successMsg.style.display = "none";
      form.style.display = "block";
      form.reset();
      if (attachmentsInput) attachmentsInput.value = "";
      filePreview.style.display = "none";
      filePreview.innerHTML = "";
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Complaint';
    }, 5000);
  });
}

window.submitAnother = () => {
  if (successMsg) successMsg.style.display = "none";
  if (form) {
    form.style.display = "block";
    form.reset();
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Complaint';
  }
};

// TRACK COMPLAINT
window.trackComplaint = () => {
  const input = document.getElementById("trackInput").value.trim();
  const resultDiv = document.getElementById("trackResult");

  if (!input) {
    resultDiv.innerHTML = '<div class="alert alert-warning">Please enter a Complaint ID or Phone Number</div>';
    return;
  }

  resultDiv.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i><p class="mt-2">Searching...</p></div>';

  onValue(ref(db, "complaints"), (snapshot) => {
    let found = false;
    let html = '';

    snapshot.forEach((child) => {
      const data = child.val();
      const key = child.key;

      if (key === input || data.phone === input) {
        found = true;
        const statusClass = data.status === 'Resolved' ? 'success' : data.status === 'In Progress' ? 'warning' : 'danger';

        html += `
          <div class="card border-${statusClass} mb-3">
            <div class="card-header bg-${statusClass} text-white">
              <strong>Complaint ID:</strong> ${key}
            </div>
            <div class="card-body">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Phone:</strong> ${data.phone}</p>
              <p><strong>Mandal:</strong> ${data.mandal}</p>
              <p><strong>Issue:</strong> ${data.issue}</p>
              <p><strong>Status:</strong> <span class="badge bg-${statusClass}">${data.status}</span></p>
              <p><strong>Submitted:</strong> ${data.time || 'N/A'}</p>
            </div>
        `;
      }
    });

    resultDiv.innerHTML = found ? html : '<div class="alert alert-info">No complaint found with the given ID or phone number.</div>';
  }, { onlyOnce: true });
};

// ==================== DEVELOPMENT WORKS ====================

let allWorks = [];
let currentMandalFilter = null;

// Load works for carousel and gallery
const worksCarousel = document.getElementById("worksCarousel");
const publicWorks = document.getElementById("publicWorks");

if (worksCarousel || publicWorks) {
  onValue(ref(db, "works"), (snapshot) => {
    allWorks = [];
    snapshot.forEach((child) => {
      allWorks.push({ key: child.key, ...child.val() });
    });

    renderCarousel();
    renderWorksGallery();
  });
}

function renderCarousel() {
  if (!worksCarousel) return;

  const sortedWorks = [...allWorks].reverse().slice(0, 10);
  worksCarousel.innerHTML = sortedWorks.map(work => {
    const imageUrl = work.image || "https://via.placeholder.com/300x200/b71c1c/ffffff?text=Development+Work";
    const statusClass = work.status === 'Completed' ? 'completed' : 'in-progress';

    return `
      <div class="carousel-item">
        <img src="${imageUrl}" alt="${work.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/b71c1c/ffffff?text=Development+Work'">
        <div class="carousel-item-body">
          <h4>${work.title}</h4>
          <p><i class="fas fa-map-marker-alt me-1 text-red"></i> ${work.mandal}</p>
          <span class="status-badge ${statusClass}">${work.status}</span>
        </div>
    `;
  }).join('');
}

function renderWorksGallery() {
  if (!publicWorks) return;

  const filteredWorks = currentMandalFilter
    ? allWorks.filter(w => w.mandal === currentMandalFilter)
    : allWorks;

  if (filteredWorks.length === 0) {
    publicWorks.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">No works found</h4>
        <p class="text-muted">${currentMandalFilter ? 'No development works found for ' + currentMandalFilter + ' mandal.' : 'No development works added yet.'}</p>
      </div>
    `;
    return;
  }

  publicWorks.innerHTML = filteredWorks.map(work => {
    const imageUrl = work.image || "https://via.placeholder.com/300x200/b71c1c/ffffff?text=Development+Work";
    const statusClass = work.status.toLowerCase().replace(' ', '-');

    return `
      <div class="col-md-6 col-lg-4">
        <div class="work-gallery-item">
          <img src="${imageUrl}" alt="${work.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200/b71c1c/ffffff?text=Development+Work'">
          <h4>${work.title}</h4>
          <p><strong>Mandal:</strong> ${work.mandal}</p>
          <span class="status ${statusClass}">${work.status}</span>
        </div>
    `;
  }).join('');
}

// Mandal filter
window.filterByMandal = (mandal) => {
  currentMandalFilter = mandal;
  const filterText = document.getElementById("worksFilterText");
  const clearBtn = document.getElementById("clearMandalFilter");

  if (filterText) filterText.textContent = `Showing development works for ${mandal} mandal`;
  if (clearBtn) clearBtn.style.display = "inline-block";

  renderWorksGallery();
  document.getElementById("works-section").scrollIntoView({ behavior: 'smooth' });
};

window.clearMandalFilter = () => {
  currentMandalFilter = null;
  const filterText = document.getElementById("worksFilterText");
  const clearBtn = document.getElementById("clearMandalFilter");

  if (filterText) filterText.textContent = "Showing all development works in the constituency";
  if (clearBtn) clearBtn.style.display = "none";

  renderWorksGallery();
};

// Carousel navigation
let carouselScrollPos = 0;
window.moveCarousel = (direction) => {
  if (!worksCarousel) return;
  const scrollAmount = 340;
  carouselScrollPos += direction * scrollAmount;
  carouselScrollPos = Math.max(0, Math.min(carouselScrollPos, worksCarousel.scrollWidth - worksCarousel.clientWidth));
  worksCarousel.scrollTo({ left: carouselScrollPos, behavior: 'smooth' });
};

// Auto-scroll carousel
setInterval(() => {
  if (worksCarousel && allWorks.length > 3) {
    carouselScrollPos += 340;
    if (carouselScrollPos >= worksCarousel.scrollWidth - worksCarousel.clientWidth) {
      carouselScrollPos = 0;
    }
    worksCarousel.scrollTo({ left: carouselScrollPos, behavior: 'smooth' });
  }
}, 5000);

// ==================== ADMIN PANEL FUNCTIONS ====================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Check if on admin page
const loginPage = document.getElementById("loginPage");
const adminDashboard = document.getElementById("adminDashboard");

if (loginPage && adminDashboard) {
  // Check existing session
  if (sessionStorage.getItem("adminLoggedIn") === "true") {
    showAdminDashboard();
  }
}

window.adminLogin = () => {
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem("adminLoggedIn", "true");
    showAdminDashboard();
  } else {
    alert("Invalid username or password!");
  }
};

function showAdminDashboard() {
  if (loginPage) loginPage.style.display = "none";
  if (adminDashboard) adminDashboard.style.display = "flex";
  loadAdminData();
}

window.adminLogout = () => {
  sessionStorage.removeItem("adminLoggedIn");
  location.reload();
};

window.showSection = (sectionId) => {
  document.querySelectorAll(".admin-section").forEach(sec => sec.style.display = "none");
  document.getElementById(sectionId).style.display = "block";

  document.querySelectorAll(".sidebar-link").forEach(link => link.classList.remove("active"));
  event.target.closest(".sidebar-link").classList.add("active");
};

window.toggleSidebar = () => {
  document.getElementById("adminSidebar").classList.toggle("show");
};

// Load admin data
function loadAdminData() {
  loadAdminStats();
  loadComplaintsTable();
  loadRecentComplaints();
  loadWorksTable();
}

// Admin stats
function loadAdminStats() {
  onValue(ref(db, "complaints"), (snapshot) => {
    let total = 0, pending = 0, inProgress = 0, resolved = 0;

    snapshot.forEach((child) => {
      const status = child.val().status;
      total++;
      if (status === "Pending") pending++;
      else if (status === "In Progress") inProgress++;
      else if (status === "Resolved") resolved++;
    });

    const statTotal = document.getElementById("adminStatTotal");
    const statPending = document.getElementById("adminStatPending");
    const statProgress = document.getElementById("adminStatProgress");
    const statResolved = document.getElementById("adminStatResolved");

    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statProgress) statProgress.textContent = inProgress;
    if (statResolved) statResolved.textContent = resolved;
  });
}

// Complaints table
function loadComplaintsTable() {
  const tableBody = document.getElementById("complaintsTable");
  if (!tableBody) return;

  onValue(ref(db, "complaints"), (snapshot) => {
    let html = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const key = child.key;
      const statusClass = data.status === 'Pending' ? 'status-pending' : data.status === 'In Progress' ? 'status-inprogress' : 'status-resolved';

      html += `
        <tr>
          <td><code>${key.substring(0, 8)}...</code></td>
          <td>${data.name}</td>
          <td>${data.phone}</td>
          <td>${data.mandal}</td>
          <td>${data.issue.substring(0, 50)}${data.issue.length > 50 ? '...' : ''}</td>
          <td>
            <select class="status-select ${statusClass}" onchange="updateStatus('${key}', this.value)">
              <option value="Pending" ${data.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${data.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Resolved" ${data.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            </select>
          </td>
          <td>${data.time || 'N/A'}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="viewComplaint('${key}')">
              <i class="fas fa-eye"></i>
            </button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = html || '<tr><td colspan="8" class="text-center py-4">No complaints found</td></tr>';
  });
}

// Recent complaints (dashboard preview)
function loadRecentComplaints() {
  const tableBody = document.getElementById("recentComplaintsTable");
  if (!tableBody) return;

  onValue(ref(db, "complaints"), (snapshot) => {
    let html = "";
    let count = 0;
    snapshot.forEach((child) => {
      if (count >= 5) return;
      const data = child.val();
      const key = child.key;
      const statusBadge = data.status === 'Pending' ? 'bg-warning' : data.status === 'In Progress' ? 'bg-info' : 'bg-success';

      html += `
        <tr>
          <td><code>${key.substring(0, 8)}...</code></td>
          <td>${data.name}</td>
          <td>${data.mandal}</td>
          <td><span class="badge ${statusBadge}">${data.status}</span></td>
          <td>${data.time || 'N/A'}</td>
        </tr>
      `;
      count++;
    });
    tableBody.innerHTML = html || '<tr><td colspan="5" class="text-center py-4">No complaints found</td></tr>';
  });
}

// Update status
window.updateStatus = (id, newStatus) => {
  update(ref(db, "complaints/" + id), { status: newStatus })
    .then(() => {
      console.log("Status updated successfully");
    })
    .catch((error) => {
      console.error("Error updating status:", error);
    });
};

// View complaint details
window.viewComplaint = (id) => {
  onValue(ref(db, "complaints/" + id), (snapshot) => {
    const data = snapshot.val();
    alert(`Complaint Details:\n\nName: ${data.name}\nPhone: ${data.phone}\nMandal: ${data.mandal}\nIssue: ${data.issue}\nStatus: ${data.status}\nTime: ${data.time || 'N/A'}`);
  }, { onlyOnce: true });
};

// Add work (admin)
window.addWork = () => {
  const title = document.getElementById("workTitle").value;
  const mandal = document.getElementById("workMandal").value;
  const image = document.getElementById("workImage").value || "";
  const status = document.getElementById("workStatus").value;

  if (!title || !mandal) {
    alert("Please fill in all required fields");
    return;
  }

  push(ref(db, "works"), { title, mandal, image, status })
    .then(() => {
      document.getElementById("workTitle").value = "";
      document.getElementById("workMandal").value = "";
      document.getElementById("workImage").value = "";
      alert("Work added successfully!");
    })
    .catch((error) => {
      console.error("Error adding work:", error);
    });
};

// Works table (admin)
function loadWorksTable() {
  const tableBody = document.getElementById("worksTable");
  if (!tableBody) return;

  onValue(ref(db, "works"), (snapshot) => {
    let html = "";
    snapshot.forEach((child) => {
      const data = child.val();
      const imageUrl = data.image || "https://via.placeholder.com/50x50/b71c1c/ffffff?text=Work";

      html += `
        <tr>
          <td><img src="${imageUrl}" alt="${data.title}" style="width:50px;height:50px;object-fit:cover;border-radius:5px;" onerror="this.src='https://via.placeholder.com/50x50/b71c1c/ffffff?text=Work'"></td>
          <td>${data.title}</td>
          <td>${data.mandal}</td>
          <td><span class="badge ${data.status === 'Completed' ? 'bg-success' : 'bg-warning'}">${data.status}</span></td>
        </tr>
      `;
    });
    tableBody.innerHTML = html || '<tr><td colspan="4" class="text-center py-4">No works found</td></tr>';
  });
}
