const token = localStorage.getItem("bm_token");
if (!token) {
  window.location.href = "admin-login.html";
}

const authHeader = () => ({ Authorization: "Bearer " + token });

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[character]));
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}), ...authHeader() };
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem("bm_token");
    window.location.href = "admin-login.html";
    throw new Error("Session expired");
  }
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

document.getElementById("welcome").textContent =
  "Welcome, " + (localStorage.getItem("bm_name") || "Admin");

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("bm_token");
  localStorage.removeItem("bm_name");
  window.location.href = "admin-login.html";
});

async function loadCategories() {
  const select = document.getElementById("categorySelect");
  try {
    const data = await api("/api/categories");
    select.innerHTML = '<option value="">Select Category</option>';
    (data.items || []).forEach((category) => {
      const option = document.createElement("option");
      option.value = category.Name;
      option.textContent = category.Name;
      select.appendChild(option);
    });
  } catch (error) {
    select.innerHTML = '<option value="">Failed to load categories</option>';
  }
}

async function loadPortfolio() {
  const container = document.getElementById("portfolioList");
  try {
    const data = await api("/api/portfolio/admin");
    const items = data.items || [];
    if (!items.length) {
      container.innerHTML = '<p class="muted">No portfolio items yet.</p>';
      return;
    }
    container.innerHTML = `
      <table class="table">
        <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Featured</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><img src="${escapeHtml(item.ImageUrl)}" alt="" style="width:120px;height:80px;object-fit:cover;border-radius:6px" /></td>
              <td>${escapeHtml(item.Title)}</td>
              <td>${escapeHtml(item.Category)}</td>
              <td><input type="checkbox" ${item.Featured ? "checked" : ""} onchange="toggleFeatured(${item.Id}, this.checked)"></td>
              <td>${item.CreatedAt ? new Date(item.CreatedAt).toLocaleString() : ""}</td>
              <td><button class="btn" onclick="deletePortfolio(${item.Id})">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  } catch (error) {
    container.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

async function loadInquiries() {
  const container = document.getElementById("inquiryList");
  try {
    const data = await api("/api/contact");
    const items = data.items || [];
    if (!items.length) {
      container.innerHTML = '<p class="muted">No inquiries yet.</p>';
      return;
    }
    container.innerHTML = `
      <table class="table">
        <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Service</th><th>Message</th><th>Actions</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${item.CreatedAt ? new Date(item.CreatedAt).toLocaleString() : ""}</td>
              <td>${escapeHtml(item.Name)}</td>
              <td>${escapeHtml(item.Email)}</td>
              <td>${escapeHtml(item.Service)}</td>
              <td>${escapeHtml(item.Message)}</td>
              <td><button class="btn" onclick="deleteInquiry(${item.Id})">Delete</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  } catch (error) {
    container.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

document.getElementById("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById("uploadMsg");
  message.textContent = "Uploading...";
  try {
    const data = await api("/api/portfolio/add", {
      method: "POST",
      body: new FormData(form),
    });
    message.textContent = data.message || "Uploaded";
    form.reset();
    await loadPortfolio();
  } catch (error) {
    message.textContent = error.message;
  }
});

window.toggleFeatured = async function toggleFeatured(id, checked) {
  try {
    await api(`/api/portfolio/feature/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: checked ? 1 : 0 }),
    });
    await loadPortfolio();
  } catch (error) {
    alert(error.message);
  }
};

window.deletePortfolio = async function deletePortfolio(id) {
  if (!confirm("Delete this portfolio item?")) return;
  try {
    await api(`/api/portfolio/${id}`, { method: "DELETE" });
    await loadPortfolio();
  } catch (error) {
    alert(error.message);
  }
};

window.deleteInquiry = async function deleteInquiry(id) {
  if (!confirm("Delete this inquiry?")) return;
  try {
    await api(`/api/contact/${id}`, { method: "DELETE" });
    await loadInquiries();
  } catch (error) {
    alert(error.message);
  }
};

loadCategories();
loadPortfolio();
loadInquiries();
