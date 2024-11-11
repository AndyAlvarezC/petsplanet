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
