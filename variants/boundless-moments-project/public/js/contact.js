// public/js/contact.js - Handles Contact Form Submission
document.getElementById('contactForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);
    const messageElement = document.getElementById('contactMessage');

    messageElement.textContent = 'Sending message...';
    messageElement.style.color = 'gray';

    try {
        // Send data to the public API route
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formProps),
        });

        const result = await response.json();

        if (response.ok) {
            messageElement.textContent = 'Thank you! Your message has been sent successfully.';
            messageElement.style.color = 'green';
            event.target.reset(); // Clear the form on success
        } else {
            messageElement.textContent = result.message || 'Failed to send message. Please try again.';
            messageElement.style.color = 'red';
        }
    } catch (error) {
        messageElement.textContent = 'A network error occurred. Please ensure the Node.js server is running.';
        messageElement.style.color = 'red';
        console.error('Contact form submission error:', error);
    }
});