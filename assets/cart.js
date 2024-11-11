const CartState = {
    items: [],
    
    async load() {
        try {
            // Cargar desde Shopify en lugar de localStorage
            const response = await fetch('/cart.js');
            const shopifyCart = await response.json();
            
            this.items = shopifyCart.items.map(item => ({
                variantId: item.variant_id.toString(),
                quantity: item.quantity,
                title: item.product_title,
                price: item.price,
                image: item.image,
                variant: item.variant_title
            }));
            
            this.updateUI();
            this.updateCheckoutButton();
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    },
    
    async save() {
        // No necesitamos guardar en localStorage, Shopify maneja la persistencia
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
                    <div class="cart-item-price">${formatMoney(item.price * item.quantity)}</div>
                    <div class="cart-item-quantity">
                        <button class="btn-quantity decrease" data-variant-id="${item.variantId}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-quantity increase" data-variant-id="${item.variantId}" data-action="increase">+</button>
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

        // Remover listeners anteriores
        const oldContainer = cartItemsContainer.cloneNode(true);
        cartItemsContainer.parentNode.replaceChild(oldContainer, cartItemsContainer);

        // Event delegation mejorado
        oldContainer.addEventListener('click', async (e) => {
            const button = e.target.closest('.btn-quantity, .remove-item');
            if (!button) return;

            const variantId = button.dataset.variantId;
            if (!variantId) return;

            const item = this.items.find(item => item.variantId === variantId);
            if (!item) return;

            if (button.classList.contains('remove-item')) {
                await this.removeItem(variantId);
            } else if (button.classList.contains('decrease')) {
                await this.updateQuantity(variantId, item.quantity - 1);
            } else if (button.classList.contains('increase')) {
                await this.updateQuantity(variantId, item.quantity + 1);
            }
        });
    },
    
    async addItem(item) {
        try {
            // Primero actualizar Shopify
            const result = await this.addToShopifyCart(item.variantId, item.quantity);
            if (result) {
                // Luego actualizar el estado local
                await this.load(); // Recargar todo el carrito desde Shopify
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error en addItem:', error);
            return false; // Retornar false si hay algún error
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

            const result = await response.json();
            await this.load(); // Recargar el carrito después de añadir
            return result;
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
            
            const result = await this.updateShopifyCartItem(variantId, newQuantity);
            if (result) {
                await this.load(); // Recargar el carrito después de actualizar
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
                await this.load(); // Recargar el carrito después de eliminar
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al eliminar item:', error);
            alert('Error al eliminar el producto');
            return false;
        }
    },

    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('open');
            console.log('Abriendo carrito'); // Para debugging
        }
        
        if (cartOverlay) {
            cartOverlay.classList.add('show');
        }
        
        // Recargar el contenido del carrito al abrirlo
        this.load();
    },
    
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
            console.log('Cerrando carrito'); // Para debugging
        }
        
        if (cartOverlay) {
            cartOverlay.classList.remove('show');
        }
    },

    initializeCart() {
        this.load();

        // Mejorar los event listeners para el carrito
        const cartIconContainer = document.getElementById('cart-icon-container');
        const cartOverlay = document.getElementById('cart-overlay');
        const closeCartBtn = document.getElementById('close-cart');

        if (cartIconContainer) {
            cartIconContainer.addEventListener('click', () => {
                console.log('Click en icono del carrito'); // Para debugging
                this.openCart();
            });
        }

        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                this.closeCart();
            });
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }

        this.updateCheckoutButton();
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    CartState.initializeCart();
});