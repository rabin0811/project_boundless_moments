// front-end interactions for contact, portfolio, admin
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

/* contact form */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = contactForm.querySelector('#name').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();
    const status = document.getElementById('responseMsg');
    status.textContent = '';
    if (!name || !email || !message) {
      status.textContent = 'All fields required';
      return;
    }
    try {
      const r = await postJSON('/api/contact', { name, email, message });
      if (r.success) {
        status.textContent = 'Message sent';
        contactForm.reset();
      } else {
        status.textContent = r.message || 'Send failed';
      }
    } catch (err) {
      status.textContent = 'Server error';
    }
  });
}

/* load portfolio items */
async function loadPortfolio() {
  const container = document.getElementById('portfolioContainer');
  if (!container) return;
  const res = await fetch('/api/portfolio');
  const items = await res.json();
  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = '<p>No items yet</p>';
    return;
  }
  container.innerHTML = items.map(i => {
    const img = i.image ? i.image : '/images/placeholder.jpg';
    return `
      <div class="card">
        <img src="${img}" alt="${escape(i.title)}">
        <h3>${escape(i.title)}</h3>
        <p>${escape(i.description || '')}</p>
      </div>
    `;
  }).join('');
}
function escape(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
loadPortfolio();

/* admin login and fetch inquiries */
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPass').value.trim();
    const status = document.getElementById('loginStatus');
    status.textContent = '';
    if (!username || !password) { status.textContent = 'Enter credentials'; return; }
    try {
      const res = await postJSON('/api/login', { username, password });
      if (res.success) {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        loadInquiries();
      } else {
        status.textContent = 'Invalid credentials';
      }
    } catch (err) {
      status.textContent = 'Server error';
    }
  });
}

async function loadInquiries() {
  const res = await fetch('/api/inquiries');
  const items = await res.json();
  const list = document.getElementById('inquiryList');
  list.innerHTML = items.map(i => `<li><strong>${escape(i.name)}</strong> (${escape(i.email)})<br>${escape(i.message)}<br><small>${i.created_at}</small></li>`).join('');
}

/* admin add portfolio via simple form with image upload */
const portfolioForm = document.getElementById('portfolioForm');
if (portfolioForm) {
  portfolioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData(portfolioForm);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      const pfstatus = document.getElementById('portfolioStatus');
      if (data.success) {
        pfstatus.textContent = 'Added';
        portfolioForm.reset();
      } else {
        pfstatus.textContent = data.message || 'Failed';
      }
    } catch (err) {
      document.getElementById('portfolioStatus').textContent = 'Server error';
    }
  });
}
