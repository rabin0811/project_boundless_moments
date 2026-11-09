// public/js/main.js

document.getElementById('contactForm')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    // Collect form data
    const formData = new FormData(form);
    const formProps = Object.fromEntries(formData);
    const messageElement = document.getElementById('formMessage');

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formProps),
        });

        if (response.ok) {
            messageElement.textContent = 'Success! Your message has been sent.';
            messageElement.style.color = 'green';
            form.reset();
        } else {
            const error = await response.json();
            messageElement.textContent = `Error: Failed to send message. ${error.message || ''}`;
            messageElement.style.color = 'red';
        }
    } catch (error) {
        messageElement.textContent = 'A network error occurred. Please check your connection.';
        messageElement.style.color = 'red';
        console.error('Submission error:', error);
    }
});