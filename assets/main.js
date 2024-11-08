class ProductSelector {
    constructor() {
        this.selectedColor = null;
        this.selectedSize = null;
        
        this.initializeSelectors();
    }
    
    initializeSelectors() {
        // Color selectors
        const colorOptions = document.querySelectorAll('.opcion-color');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remover selección previa
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                // Añadir nueva selección
                option.classList.add('selected');
                
                // Asignar el color seleccionado
                this.selectedColor = option.dataset.color;
                console.log('Selected Color:', this.selectedColor);  // Depuración
                document.getElementById('color-seleccionado').textContent = this.selectedColor;
            });
        });
    
        // Size selectors
        const sizeOptions = document.querySelectorAll('.talla');
        sizeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remover selección previa
                sizeOptions.forEach(opt => opt.classList.remove('selected'));
                // Añadir nueva selección
                option.classList.add('selected');
                
                // Asignar la talla seleccionada
                this.selectedSize = option.dataset.talla;
                console.log('Selected Size:', this.selectedSize);  // Depuración
                document.getElementById('talla-seleccionada').textContent = this.selectedSize;
            });
        });
    
        // Add to cart button
        const addToCartBtn = document.querySelector('.btn-carrito');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }
    }
    
    handleAddToCart() {
        if (!this.selectedColor || !this.selectedSize) {
            showNotification('Por favor, selecciona color y talla');
            console.log('Error: No se ha seleccionado color o talla'); // Depurar
            return;
        }
    
        const quantity = parseInt(document.getElementById('cantidad').textContent);
        const productData = JSON.parse(document.getElementById('ProductJson-product-template').textContent);
        
        // Crear item para el carrito
        const cartItem = {
            variantId: `${productData.id}-${this.selectedColor}-${this.selectedSize}`,  // ID único por color y talla
            title: productData.title,
            color: this.selectedColor,
            size: this.selectedSize,
            price: productData.price,
            image: document.querySelector('.imagen-principal img').src,
            quantity: quantity
        };
    
        CartState.addItem(cartItem);
        showNotification('¡Producto añadido al carrito!', 'success');
        CartState.openCart();  // Llamar desde CartState
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProductSelector();
});
