// public/js/admin-auth.js - Handles the client-side Admin Login (M5)
document.getElementById('adminLoginForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);
    const messageElement = document.getElementById('loginMessage');

    messageElement.textContent = 'Logging in...';
    messageElement.style.color = 'gray';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formProps),
        });

        const result = await response.json();

        if (response.ok) {
            // SUCCESS PATH (M5 demonstrated)
            messageElement.textContent = 'Login successful! Redirecting...';
            messageElement.style.color = 'green';
            // In a real app, you would store the token here.
            window.location.href = 'admin-dashboard.html'; 
        } else {
            messageElement.textContent = result.message || 'Login failed. Check credentials.';
            messageElement.style.color = 'red';
        }
    } catch (error) {
        messageElement.textContent = 'A network error occurred. Ensure the server is running.';
        messageElement.style.color = 'red';
        console.error('Login submission error:', error);
    }
});