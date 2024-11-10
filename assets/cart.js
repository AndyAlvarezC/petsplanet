const CartState = {
    items: [],
    
    load() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateUI();
            this.updateCheckoutButton();
        }
    },
    
    save() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        this.updateUI();
        this.updateCheckoutButton();
    },
    
    updateUI() {
        const cartCount = document.getElementById('cart-count');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        this.renderItems();
    },
    
    renderItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-variant-id="${item.variantId}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-variants">
                        ${item.variant ? `<span>${item.variant}</span>` : ''}
                    </div>
                    <div class="cart-item-price">${formatMoney(item.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="btn-quantity" data-variant-id="${item.variantId}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-quantity" data-variant-id="${item.variantId}" data-action="increase">+</button>
                    </div>
                </div>
                <button class="remove-item" data-variant-id="${item.variantId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = formatMoney(total);
        }

        // Agregar event listeners después de renderizar
        this.addEventListeners();
    },

    addEventListeners() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;

        // Event delegation para los botones de cantidad
        cartItemsContainer.addEventListener('click', async (e) => {
            const button = e.target.closest('.btn-quantity, .remove-item');
            if (!button) return;

            const variantId = button.dataset.variantId;
            if (!variantId) return;

            const item = this.items.find(item => item.variantId === variantId);
            if (!item) return;

            if (button.classList.contains('remove-item')) {
                await this.removeItem(variantId);
            } else if (button.dataset.action === 'decrease') {
                await this.updateQuantity(variantId, item.quantity - 1);
            } else if (button.dataset.action === 'increase') {
                await this.updateQuantity(variantId, item.quantity + 1);
            }
        });
    },
    
    async addItem(item) {
        try {
            const existingItem = this.items.find(i => i.variantId === item.variantId);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                this.items.push(item);
            }
            
            const result = await this.addToShopifyCart(item.variantId, item.quantity);
            if (result) {
                this.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            alert('Hubo un error al agregar el producto al carrito');
            return false;
        }
    },
    
    async addToShopifyCart(variantId, quantity) {
        try {
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [{
                        id: variantId,
                        quantity: quantity
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en addToShopifyCart:', error);
            throw error;
        }
    },
    
    async updateQuantity(variantId, newQuantity) {
        try {
            if (newQuantity < 1) {
                return await this.removeItem(variantId);
            }
            
            const item = this.items.find(item => item.variantId === variantId);
            if (!item) return false;

            const result = await this.updateShopifyCartItem(variantId, newQuantity);
            if (result) {
                item.quantity = newQuantity;
                this.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            alert('Error al actualizar la cantidad del producto');
            return false;
        }
    },

    async updateShopifyCartItem(variantId, quantity) {
        try {
            const response = await fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: variantId,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en updateShopifyCartItem:', error);
            throw error;
        }
    },

    async removeItem(variantId) {
        try {
            const result = await this.updateShopifyCartItem(variantId, 0);
            if (result) {
                this.items = this.items.filter(item => item.variantId !== variantId);
                this.save();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar item:', error);
            alert('Error al eliminar el producto');
            return false;
        }
    },

    updateCheckoutButton() {
        const checkoutButton = document.getElementById('checkout-button');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
        if (checkoutButton) {
            checkoutButton.disabled = totalItems === 0;
            checkoutButton.href = totalItems === 0 ? "#" : "/checkout";
        }
    },
    
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.add('open');
        if (cartOverlay) cartOverlay.classList.add('show');
    },
    
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        if (cartSidebar) cartSidebar.classList.remove('open');
        if (cartOverlay) cartOverlay.classList.remove('show');
    },

    initializeCart() {
        this.load();

        // Event Listeners para el carrito
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.matches('#cart-icon, #cart-count') || target.closest('#cart-icon-container')) {
                this.openCart();
            } else if (target.matches('#close-cart, #cart-overlay')) {
                this.closeCart();
            }
        });

        this.updateCheckoutButton();
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    CartState.initializeCart();
});