class ProductSelector {
    constructor() {
        this.selectedColor = null;
        this.selectedSize = null;
        this.selectedPrice = null; // Agregado para almacenar el precio de la variante seleccionada
        this.initializeSelectors();
    }
    
    initializeSelectors() {
        const colorOptions = document.querySelectorAll('.opcion-color');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                this.selectedColor = option.dataset.color;
                document.getElementById('color-seleccionado').textContent = this.selectedColor;

                const newImageSrc = option.getAttribute('data-image');
                document.getElementById('imagen-principal').src = newImageSrc;

                this.updateSelectedVariantPrice(); // Actualizar precio cuando se selecciona un color
            });
        });
    
        const sizeOptions = document.querySelectorAll('.talla');
        sizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                this.selectedSize = option.dataset.talla;
                document.getElementById('talla-seleccionada').textContent = this.selectedSize;

                this.updateSelectedVariantPrice(); // Actualizar precio cuando se selecciona una talla
            });
        });
    
        const addToCartBtn = document.querySelector('.btn-carrito');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }
    }

    updateSelectedVariantPrice() {
        const productData = JSON.parse(document.getElementById('ProductJson-product-template').textContent);
        
        // Encontrar la variante específica según color y talla seleccionados
        const selectedVariant = productData.variants.find(variant => 
            variant.option1 === this.selectedColor && variant.option2 === this.selectedSize
        );

        if (selectedVariant) {
            this.selectedPrice = selectedVariant.price; // Guardar el precio de la variante
            document.getElementById('precio-descuento').textContent = this.formatMoney(this.selectedPrice);
        }
    }

    formatMoney(cents) {
        return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    }

    handleAddToCart() {
        if (!this.selectedColor || !this.selectedSize) {
            showNotification('Por favor, selecciona color y talla');
            return;
        }
    
        const quantity = parseInt(document.getElementById('cantidad').textContent);
        const productData = JSON.parse(document.getElementById('ProductJson-product-template').textContent);
        
        const cartItem = {
            variantId: `${productData.id}-${this.selectedColor}-${this.selectedSize}`,
            title: productData.title,
            color: this.selectedColor,
            size: this.selectedSize,
            price: this.selectedPrice || productData.price,
            image: document.getElementById('imagen-principal').src,
            quantity: quantity
        };
    
        CartState.addItem(cartItem);
        showNotification('¡Producto añadido al carrito!', 'success');
        CartState.openCart();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProductSelector();
});
