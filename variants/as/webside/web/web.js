// Portfolio filter
const filterBtns = document.querySelectorAll(".filter-btns button");
const images = document.querySelectorAll(".gallery img");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const category = btn.dataset.filter;

    images.forEach(img => {
      img.style.display = (category === "all" || img.dataset.category === category) ? "block" : "none";
    });
  });
});

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.querySelector(".lightbox .close");

images.forEach(img => {
  img.addEventListener("click", () => {
    lightbox.style.display = "flex";
    lightboxImg.src = img.src;
  });
});

closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});

lightbox.addEventListener("click", (e) => {
  if (e.target !== lightboxImg) {
    lightbox.style.display = "none";
  }
});
