async function loadPortfolio() {
  const res = await fetch("/api/portfolio");
  const data = await res.json();

  if (!data.success) return console.error("Failed to load portfolio");

  const galleryContainer = document.querySelector(".gallery-grid");
  galleryContainer.innerHTML = data.data.map(item => `
    <div class="grid-item" data-cat="${item.Category}">
      <img src="${item.ImageUrl}" alt="${item.Title}">
      <p>${item.Title}</p>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", loadPortfolio);
