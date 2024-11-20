document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    // Mostrar/ocultar el menú
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("nav-open");
    });

    // Cerrar el menú al hacer clic en un enlace
    navMenu.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            navMenu.classList.remove("nav-open");
        }
    });
});