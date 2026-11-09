// Contact form simulation
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const msg = document.getElementById('message').value;

      localStorage.setItem('inquiry', JSON.stringify({ name, email, msg }));
      document.getElementById('status').textContent = "Message submitted successfully!";
      form.reset();
    });
  }

  // Admin login
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const user = document.getElementById('adminUser').value;
      const pass = document.getElementById('adminPass').value;

      if (user === 'admin' && pass === '1234') {
        document.getElementById('loginBox').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        const data = JSON.parse(localStorage.getItem('inquiry'));
        if (data) {
          document.getElementById('inquiryList').innerHTML =
            `<li>${data.name} (${data.email}): ${data.msg}</li>`;
        } else {
          document.getElementById('inquiryList').innerHTML = '<li>No inquiries found</li>';
        }
      } else {
        document.getElementById('loginStatus').textContent = "Invalid credentials!";
      }
    });
  }
});
