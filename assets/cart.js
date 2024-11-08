// Asegúrate de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Inicia el carrito después de que el DOM haya cargado
    CartState.initializeCart();
});

const CartState = {
    items: [],
    
    // Cargar el carrito desde localStorage
    load() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateUI();
            this.updateCheckoutButton(); // Actualiza el botón de checkout
        }
    },
    
    // Guardar el carrito en localStorage
    save() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        this.updateUI();
        this.updateCheckoutButton(); // Actualiza el botón de checkout
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
    
    // Agregar un item al carrito
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
    },

    updateCheckoutButton() {
        const checkoutButton = document.getElementById('checkout-button');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
        if (checkoutButton) {
            if (totalItems === 0) {
                checkoutButton.disabled = true;
                checkoutButton.href = "#"; // Si el carrito está vacío, deshabilita el botón
            } else {
                checkoutButton.disabled = false;
    
                // Construir la URL de checkout con los productos del carrito
                let checkoutUrl = "https://2vwf7p-jv.myshopify.com/cart?";
    
                // Construir los parámetros de cada producto (variantId y quantity)
                const itemsParam = this.items.map(item => 
                    `${item.variantId}:${item.quantity}`).join('&');
                
                checkoutUrl += itemsParam;  // Añadir los parámetros al final de la URL
    
                // Imprimir la URL para depuración (opcional)
                console.log(checkoutUrl);
    
                checkoutButton.href = checkoutUrl;  // Actualizar el href del botón
            }
        }
    },
    
    // Función para abrir el carrito
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('show');
    },
    
    // Función para cerrar el carrito
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('show');
    },

    // Inicializar el carrito
    initializeCart() {
        this.load();

        // Configuración de eventos
        const cartIcon = document.getElementById('cart-icon');
        const cartCount = document.getElementById('cart-count');
        const closeCart = document.getElementById('close-cart');
        const cartOverlay = document.getElementById('cart-overlay');
        const checkoutButton = document.getElementById('checkout-button');

        if (cartIcon) cartIcon.addEventListener('click', () => this.openCart());
        if (cartCount) cartCount.addEventListener('click', () => this.openCart());
        if (closeCart) closeCart.addEventListener('click', () => this.closeCart());
        if (cartOverlay) cartOverlay.addEventListener('click', () => this.closeCart());

        if (checkoutButton) {
            checkoutButton.addEventListener('click', (event) => {
                event.preventDefault();
                if (this.items.length > 0) {
                    window.location.href = "https://2vwf7p-jv.myshopify.com/checkout";
                } else {
                    alert("El carrito está vacío.");
                }
            });
        }

        this.updateCheckoutButton(); // Llama a updateCheckoutButton al inicializar el carrito
    }
};
