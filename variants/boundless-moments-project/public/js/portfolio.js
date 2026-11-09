// public/js/portfolio.js - Handles fetching, rendering, and filtering portfolio data (P6)
document.addEventListener('DOMContentLoaded', () => {
    const portfolioGrid = document.getElementById('portfolioGrid');
    const immersiveGallery = document.getElementById('immersiveGallery');
    
    if (portfolioGrid || immersiveGallery) {
        fetchPortfolioItems(portfolioGrid || immersiveGallery);
        
        if (portfolioGrid && document.querySelector('.portfolio-filters')) {
            setupFilters(portfolioGrid);
        }
    }
});

async function fetchPortfolioItems(container, limit = null) {
    if (!container) return [];

    try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
            throw new Error('Failed to fetch portfolio data from API.');
        }

        let items = await response.json();
        
        if (limit) {
            items = items.slice(0, limit); 
        }

        if (items.length === 0) {
            container.innerHTML = '<p>No portfolio items currently available.</p>';
            return items;
        }

        renderPortfolioItems(container, items);
        return items;

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        container.innerHTML = '<p class="error-message">Could not load portfolio. Please check server connection.</p>';
        return [];
    }
}

function renderPortfolioItems(container, items) {
    const html = items.map(item => `
        <div class="portfolio-card" data-category="${item.category}" data-id="${item.id}">
            <img src="${item.image_url}" alt="${item.title}" onerror="this.onerror=null; this.src='https://placehold.co/400x250/333/fff?text=Boundless'">
            <div class="card-info">
                <h4>${item.title}</h4>
                <p>${(item.description || 'No description provided.').substring(0, 80)}...</p>
                <span class="category-tag">${item.category}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function setupFilters(container) {
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedCategory = e.target.getAttribute('data-category');
            
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            document.querySelectorAll('.portfolio-card').forEach(card => {
                if (selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}