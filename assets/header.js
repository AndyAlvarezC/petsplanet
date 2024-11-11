document.addEventListener('DOMContentLoaded', function() {
    // Functions to handle language
    function setLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        // You can add logic here to change the store's language
        // For example, redirect to the corresponding version of the site
        // window.location.href = `/${lang}${window.location.pathname}`;
    }

    // Functions to handle currency
    function setCurrency(currency) {
        localStorage.setItem('selectedCurrency', currency);
        document.querySelectorAll('.currency-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.currency === currency);
        });
        // You can add logic here to change the currency
        // This is typically done via Shopify's API
    }

    // Initialize with saved values or defaults
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'usd';
    
    setLanguage(savedLanguage);
    setCurrency(savedCurrency);

    // Event listeners for language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Event listeners for currency buttons
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
    });
});
