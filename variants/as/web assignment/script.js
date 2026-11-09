// ========== GALLERY FILTER ==========
const filterButtons = document.querySelectorAll(".filter-btn");
const galleryItems = document.querySelectorAll(".gallery-item");

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach(button => button.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
            if (filter === "all" || item.classList.contains(filter)) {
                item.style.display = "block";
                setTimeout(() => item.style.opacity = "1", 100);
            } else {
                item.style.opacity = "0";
                setTimeout(() => item.style.display = "none", 300);
            }
        });
    });
});

// ========== LIGHTBOX ==========
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
document.body.appendChild(lightbox);

const lightboxImg = document.createElement("img");
lightbox.appendChild(lightboxImg);

galleryItems.forEach(item => {
    const img = item.querySelector("img");
    img.addEventListener("click", () => {
        lightbox.classList.add("active");
        lightboxImg.src = img.src;
    });
});

lightbox.addEventListener("click", e => {
    if (e.target !== lightboxImg) {
        lightbox.classList.remove("active");
    }
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// ========== NAVBAR TOGGLE (for mobile) ==========
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle) {
    navToggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
    });
}
