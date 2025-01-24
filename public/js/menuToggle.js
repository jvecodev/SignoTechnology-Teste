const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

document.querySelector('#menu-toggle').addEventListener('click', () => {
    document.querySelector('.menu').classList.toggle('active');
});


const menuItems = document.querySelectorAll(".list");

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menu.classList.remove("active");
    });
});