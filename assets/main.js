class ProductSelector {
    constructor() {
        this.selectedColor = null;
        this.selectedSize = null;
        this.selectedPrice = null;
        this.productData = JSON.parse(document.getElementById('ProductJson-product-template').textContent);
        this.initializeSelectors();
    }
    
    initializeSelectors() {
        this.setupOptions('.opcion-color', 'color');
        this.setupOptions('.talla', 'size');
        
        const addToCartBtn = document.querySelector('.btn-carrito');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }
    }

    setupOptions(selector, type) {
        const options = document.querySelectorAll(selector);
        options.forEach(option => {
            option.addEventListener('click', () => this.handleOptionSelect(option, type, options));
        });
    }

    handleOptionSelect(option, type, options) {
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        if (type === 'color') {
            this.selectedColor = option.dataset.color;
            document.getElementById('color-seleccionado').textContent = this.selectedColor;
            document.getElementById('imagen-principal').src = option.dataset.image;
        } else if (type === 'size') {
            this.selectedSize = option.dataset.talla;
            document.getElementById('talla-seleccionada').textContent = this.selectedSize;
        }

        this.updateSelectedVariant();
    }

    updateSelectedVariant() {
        const selectedVariant = this.productData.variants.find(variant => 
            variant.option1 === this.selectedColor && variant.option2 === this.selectedSize
        );

        if (selectedVariant) {
            this.selectedPrice = selectedVariant.price;
            document.getElementById('precio-descuento').textContent = this.formatMoney(this.selectedPrice);
        }
    }

    formatMoney(cents) {
        return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    handleAddToCart() {
        if (!this.selectedColor || !this.selectedSize) {
            showNotification('Please select a color and size');
            return;
        }
        
        const quantity = parseInt(document.getElementById('cantidad').textContent);
        
        const cartItem = {
            variantId: `${this.productData.id}-${this.selectedColor}-${this.selectedSize}`,
            title: this.productData.title,
            color: this.selectedColor,
            size: this.selectedSize,
            price: this.selectedPrice || this.productData.price,
            image: document.getElementById('imagen-principal').src,
            quantity: quantity
        };
    
        CartState.addItem(cartItem);
        showNotification('Product added to cart!', 'success');
        CartState.openCart();
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProductSelector();
});

document.addEventListener('DOMContentLoaded', () => {
    // Configuración del Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // El elemento será visible cuando el 15% esté en el viewport
    };

    // Callback que se ejecuta cuando un elemento entra en el viewport
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Opcional: dejar de observar el elemento una vez que se ha animado
                observer.unobserve(entry.target);
            }
        });
    };

    // Crear el observer
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todos los elementos con la clase fade-up
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(element => observer.observe(element));
});