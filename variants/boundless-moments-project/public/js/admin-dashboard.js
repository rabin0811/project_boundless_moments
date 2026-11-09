// public/js/admin-dashboard.js - Handles CRUD operations and message display (P6, M5)
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.admin-dashboard-page')) return;
    fetchAndRenderPortfolio();
    fetchAndRenderMessages();
    setupAddPortfolioForm();
    setupUpdatePortfolioForm(); 
    setupLogoutButton();
});

let portfolioData = [];

// 1. READ (Fetch and Render Portfolio for Management)
async function fetchAndRenderPortfolio() {
    const listContainer = document.getElementById('existingProjectsList');
    listContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const response = await fetch('/api/portfolio'); // Public GET route
        portfolioData = await response.json();

        if (portfolioData.length === 0) {
            listContainer.innerHTML = '<p>No projects in the database.</p>';
            return;
        }

        const html = portfolioData.map(item => `
            <div class="admin-list-item" data-id="${item.id}">
                <span>[ID: ${item.id}] ${item.title} (${item.category})</span>
                <div>
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </div>
            </div>
        `).join('');

        listContainer.innerHTML = html;

        listContainer.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deletePortfolioItem(e.target.getAttribute('data-id')));
        });
        listContainer.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => loadItemForUpdate(e.target.getAttribute('data-id')));
        });

    } catch (error) {
        listContainer.innerHTML = '<p class="error-message">Failed to load projects for management. Check API connection.</p>';
    }
}

// 2. CREATE (Add New Item)
function setupAddPortfolioForm() {
    document.getElementById('addPortfolioForm')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const formProps = Object.fromEntries(formData);
        const messageElement = document.getElementById('portfolioMessage');

        try {
            const response = await fetch('/api/portfolio', { 
                method: 'POST', // Protected POST route
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formProps),
            });
            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = 'Project added successfully!';
                messageElement.style.color = 'green';
                event.target.reset();
                fetchAndRenderPortfolio();
            } else {
                messageElement.textContent = `Error: ${result.message || 'Failed to add project.'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            messageElement.textContent = 'A network error occurred. Check server.';
            messageElement.style.color = 'red';
        }
    });
}

// 3. UPDATE (Load Item and Submit Changes)
function loadItemForUpdate(id) {
    const item = portfolioData.find(p => p.id == id);
    const updateForm = document.getElementById('updatePortfolioForm');
    if (!item) return alert('Item not found for editing.');

    document.getElementById('u-id').value = item.id;
    document.getElementById('u-title').value = item.title;
    document.getElementById('u-url').value = item.image_url;
    document.getElementById('u-desc').value = item.description || '';
    document.getElementById('u-cat').value = item.category;
    document.getElementById('update-project-id').textContent = `[ID: ${item.id}]`;
    
    updateForm.style.display = 'block';
    updateForm.scrollIntoView({ behavior: 'smooth' });
}

function setupUpdatePortfolioForm() {
    document.getElementById('updatePortfolioForm')?.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const formProps = Object.fromEntries(formData);
        const id = formProps.id;
        const messageElement = document.getElementById('updateMessage');

        try {
            const response = await fetch(`/api/portfolio/${id}`, {
                method: 'PUT', // Protected PUT route (P6)
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formProps),
            });

            const result = await response.json();

            if (response.ok) {
                messageElement.textContent = `Project ${id} updated successfully.`;
                messageElement.style.color = 'green';
                fetchAndRenderPortfolio();
                document.getElementById('updatePortfolioForm').style.display = 'none';
            } else {
                messageElement.textContent = `Error: ${result.message || 'Failed to update project.'}`;
                messageElement.style.color = 'red';
            }
        } catch (error) {
            messageElement.textContent = 'A network error occurred.';
            messageElement.style.color = 'red';
        }
    });
}

// 4. DELETE (Remove Item)
async function deletePortfolioItem(id) {
    if (!window.confirm(`Are you sure you want to delete project ID ${id}?`)) return;

    try {
        const response = await fetch(`/api/portfolio/${id}`, {
            method: 'DELETE', // Protected DELETE route (P6)
        });

        if (response.ok) {
            alert(`Project ${id} deleted successfully.`);
            fetchAndRenderPortfolio();
        } else {
            const result = await response.json();
            alert(`Deletion failed: ${result.message}`);
        }
    } catch (error) {
        alert('A network error occurred during deletion.');
    }
}

// --- MESSAGE VIEWER ---
async function fetchAndRenderMessages() {
    const listContainer = document.getElementById('messagesList');
    listContainer.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch('/api/messages'); // Protected GET route
        const messages = await response.json();
        
        if (messages.length === 0) {
            listContainer.innerHTML = '<p>No messages received yet.</p>';
            return;
        }

        const html = messages.map(msg => `
            <div class="message-card">
                <strong>From: ${msg.sender_name} &lt;${msg.sender_email}&gt;</strong>
                <p>Subject: ${msg.subject || '[No Subject]'}</p>
                <p class="message-body">${msg.message}</p>
                <small>Received: ${new Date(msg.received_at).toLocaleString()}</small>
            </div>
        `).join('');

        listContainer.innerHTML = html;

    } catch (error) {
        listContainer.innerHTML = '<p class="error-message">Failed to load client messages. (Check server)</p>';
    }
}

function setupLogoutButton() {
    document.getElementById('logout-button')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Logged out successfully (session cleared hypothetically).');
        window.location.href = 'index.html';
    });
}