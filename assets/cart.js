const CartState = {
    items: [],

    // Función auxiliar para llamar a la API de Shopify
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
            console.error(`Error en ${endpoint}:`, error);
            return null;
        }
    },

    // Cargar los elementos del carrito de Shopify
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

    // Actualizar el UI del carrito
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
        const cartTotal = document.getElementById('cart-total');
        if (!cartItemsContainer || !cartTotal) return;

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

        cartTotal.textContent = formatMoney(this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));

        // Añadir event listeners después de renderizar
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
        if (newQuantity < 1) {
            return await this.removeItem(variantId);
        } else {
            const result = await this.fetchShopifyCart('/cart/change.js', 'POST', {
                id: variantId,
                quantity: newQuantity
            });
            if (result) await this.load();
        }
    },

    async removeItem(variantId) {
        const result = await this.fetchShopifyCart('/cart/change.js', 'POST', {
            id: variantId,
            quantity: 0
        });
        if (result) await this.load();
    },

    openCart() {
        document.getElementById('cart-sidebar').classList.add('open');
        document.getElementById('cart-overlay').classList.add('show');
        this.load();
    },

    closeCart() {
        document.getElementById('cart-sidebar').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('show');
    },

    initializeCart() {
        this.load();
        document.getElementById('cart-icon-container').addEventListener('click', () => this.openCart());
        document.getElementById('close-cart').addEventListener('click', () => this.closeCart());
        document.getElementById('cart-overlay').addEventListener('click', () => this.closeCart());
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    CartState.initializeCart();
});
