// Gestión del estado del carrito
const CartState = {
    items: [],
    
    // Cargar el carrito desde localStorage
    load() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateUI();
        }
    },
    
    // Guardar el carrito en localStorage
    save() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        this.updateUI();
    },
    
    // Actualizar la UI del carrito
    updateUI() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Actualizar contador del carrito
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // Actualizar contenido del carrito
        this.renderItems();
    },
    
    // Renderizar items del carrito
    renderItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-variant-id="${item.variantId}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-variants">
                        <span>${item.color}</span> | <span>${item.size}</span>
                    </div>
                    <div class="cart-item-price">${formatMoney(item.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="btn-quantity" onclick="CartState.updateQuantity('${item.variantId}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-quantity" onclick="CartState.updateQuantity('${item.variantId}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="CartState.removeItem('${item.variantId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        // Actualizar total
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = formatMoney(total);
        }
    },
    
    // Añadir item al carrito
    addItem(item) {
        const existingItem = this.items.find(i => i.variantId === item.variantId);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            this.items.push(item);
        }
        this.save();
    },
    
    // Actualizar cantidad de un item
    updateQuantity(variantId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(variantId);
            return;
        }
        
        const item = this.items.find(item => item.variantId === variantId);
        if (item) {
            item.quantity = newQuantity;
            this.save();
        }
    },
    
    // Eliminar item del carrito
    removeItem(variantId) {
        this.items = this.items.filter(item => item.variantId !== variantId);
        this.save();
    }
};

// Gestión de selecciones de producto
class ProductSelector {
    constructor() {
        this.selectedColor = null;
        this.selectedSize = null;
        
        this.initializeSelectors();
        this.initializeCart();
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
    
    initializeCart() {
        // Cargar estado del carrito
        CartState.load();
        
        // Inicializar eventos del carrito
        const cartIcon = document.getElementById('cart-icon');
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCart = document.getElementById('close-cart');
        
        if (cartIcon) cartIcon.addEventListener('click', () => this.openCart());
        if (closeCart) closeCart.addEventListener('click', () => this.closeCart());
        if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeCart());
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
            variantId: `${productData.id}-${this.selectedColor}-${this.selectedSize}`,  // Asegúrate de usar las comillas invertidas (backticks)
            title: productData.title,
            color: this.selectedColor,
            size: this.selectedSize,
            price: productData.price,
            image: document.querySelector('.imagen-principal img').src,
            quantity: quantity
        };
    
        CartState.addItem(cartItem);
        showNotification('¡Producto añadido al carrito!', 'success');
        this.openCart();
    }
    
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('show');
    }
    
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('show');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProductSelector();
});