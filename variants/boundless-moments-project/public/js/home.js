// public/js/home.js - Fetches and renders only featured projects on the home page (P6)
// This file relies on functions defined in public/js/portfolio.js.
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('latestProjectsContainer');
    if (container) {
        // fetchPortfolioItems is defined in portfolio.js
        fetchPortfolioItems(container, 3); // Limit to 3 featured projects
    }
});