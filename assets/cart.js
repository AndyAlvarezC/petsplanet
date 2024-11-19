const CartState = {
    items: [],
    isUpdating: false, // Flag to track if a quantity update is in progress

    // Helper function to call the Shopify API
    async fetchShopifyCart(endpoint, method, body = null) {
        try {
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            };
            const response = await fetch(endpoint, options);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error(`Error at ${endpoint}:`, error);
            return null;
        }
    },

    // Load Shopify cart items
    async load() {
        try {
            const shopifyCart = await this.fetchShopifyCart('/cart.js', 'GET');
            if (shopifyCart) {
                this.items = shopifyCart.items.map(item => ({
                    variantId: item.variant_id.toString(),
                    quantity: item.quantity,
                    title: item.product_title,
                    price: item.price,
                    image: item.image,
                    variant: item.variant_title
                }));
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    },

    // Update the cart UI
    updateUI() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        if (cartTotal) {
            cartTotal.textContent = formatMoney(this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
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
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="btn-quantity increase" data-variant-id="${item.variantId}" data-action="increase">+</button>
                    </div>
                </div>
                <button class="remove-item" data-variant-id="${item.variantId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add event listeners after rendering
        this.addEventListeners();
    },

    addEventListeners() {
        document.getElementById('cart-items').addEventListener('click', async (e) => {
            const button = e.target.closest('.btn-quantity, .remove-item');
            if (!button) return;

            const variantId = button.dataset.variantId;
            if (!variantId) return;

            const item = this.items.find(item => item.variantId === variantId);
            if (!item) return;

            if (button.classList.contains('remove-item')) {
                await this.removeItem(variantId);
            } else {
                const newQuantity = item.quantity + (button.classList.contains('increase') ? 1 : -1);
                await this.updateQuantity(variantId, newQuantity);
            }
        });
    },

    async updateQuantity(variantId, newQuantity) {
        if (this.isUpdating) return;  // Prevent further updates while an update is in progress
        this.isUpdating = true; // Set flag to indicate update is in progress

        if (newQuantity < 1) {
            await this.removeItem(variantId);
        } else {
            // Update the UI immediately
            const cartItemElement = document.querySelector(`.cart-item[data-variant-id="${variantId}"]`);
            const quantityDisplay = cartItemElement.querySelector('.quantity-display');
            const priceElement = cartItemElement.querySelector('.cart-item-price');
            const currentItem = this.items.find(item => item.variantId === variantId);

            // Update quantity and price immediately in the UI
            quantityDisplay.textContent = newQuantity;
            priceElement.textContent = formatMoney(newQuantity * currentItem.price);

            try {
                // Make the request to update the quantity in the Shopify cart immediately
                const response = await fetch('/cart/change.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: variantId, quantity: newQuantity })
                });

                if (response.ok) {
                    const cart = await response.json();
                    this.items = cart.items.map(item => ({
                        variantId: item.variant_id.toString(),
                        quantity: item.quantity,
                        title: item.product_title,
                        price: item.price,
                        image: item.image,
                        variant: item.variant_title
                    }));
                    this.updateUI();
                } else {
                    console.error('Error updating cart:', response.statusText);
                }
            } catch (error) {
                console.error('Error in updateQuantity:', error);
                await this.load(); // Reload the cart if an error occurs
            } finally {
                this.isUpdating = false; // Reset the flag after the update process completes
            }
        }
    },

    async removeItem(variantId) {
        this.items = this.items.filter(item => item.variantId !== variantId);
        this.updateUI();

        const response = await fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity: 0 })
        });

        if (response.ok) {
            const cart = await response.json();
            this.items = cart.items.map(item => ({
                variantId: item.variant_id.toString(),
                quantity: item.quantity,
                title: item.product_title,
                price: item.price,
                image: item.image,
                variant: item.variant_title
            }));
            this.updateUI();
        } else {
            console.error('Error removing item from cart:', response.statusText);
            await this.load(); // Refresh the cart if the remove operation fails
        }
    },

    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('show');
        document.body.classList.add('cart-open');
    
        this.load();
    },
        
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('show');
        document.body.classList.remove('cart-open');
    },
    
    initializeCart() {
        this.load();
        document.getElementById('cart-icon-container').addEventListener('click', () => this.openCart());
        document.getElementById('close-cart').addEventListener('click', () => this.closeCart());
        document.getElementById('cart-overlay').addEventListener('click', () => this.closeCart());
    },

    async handleCheckout() {
        if (this.items.length === 0) {
          // Muestra una alerta si el carrito está vacío
        alert("Tu carrito está vacío. Por favor, agrega algunos artículos antes de proceder al checkout.");
        } else {
          // Redirige a la página de checkout si el carrito tiene artículos
        window.location.href = "/checkout";
        }
    }
};
      // Actualiza el evento de clic del botón de Checkout
    document.addEventListener('DOMContentLoaded', () => {
        CartState.initializeCart();
        document.querySelector('.btn-checkout').addEventListener('click', (event) => {
          event.preventDefault(); // Evita la redirección predeterminada
        CartState.handleCheckout();
        });
    });
