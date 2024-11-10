document.addEventListener('DOMContentLoaded', function() {
    // Funciones para manejar el idioma
    function setLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        // Aquí puedes agregar la lógica para cambiar el idioma de la tienda
        // Por ejemplo, redirigir a la versión correspondiente del sitio
        // window.location.href = `/${lang}${window.location.pathname}`;
    }

    // Funciones para manejar la divisa
    function setCurrency(currency) {
        localStorage.setItem('selectedCurrency', currency);
        document.querySelectorAll('.currency-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.currency === currency);
        });
        // Aquí puedes agregar la lógica para cambiar la divisa
        // Normalmente esto se haría a través de la API de Shopify
    }

    // Inicializar con valores guardados o por defecto
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'es';
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'eur';
    
    setLanguage(savedLanguage);
    setCurrency(savedCurrency);

    // Event listeners para los botones de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Event listeners para los botones de divisa
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
    });
});