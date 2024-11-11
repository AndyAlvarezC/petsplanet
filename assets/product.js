// Element declarations
const quantityDisplay = document.getElementById("quantity");
const btnDecrease = document.getElementById("btn-decrease");
const btnIncrease = document.getElementById("btn-increase");
const btnCart = document.querySelector(".btn-cart");
const selectedColorDisplay = document.getElementById("selected-color");
const selectedSizeDisplay = document.getElementById("selected-size");
const thumbnails = document.querySelectorAll('.thumbnail');
const mainImage = document.querySelector('.main-image img');
const colorOptions = document.querySelectorAll(".color-option");
const sizeOptions = document.querySelectorAll(".size");
const discountPriceElement = document.getElementById("discount-price");

let quantity = 1;
let selectedColor = null;
let selectedSize = null;
let productVariants = [];
let currentVariant = null;

// Initialize product
document.addEventListener('DOMContentLoaded', () => {
    initializeProduct();
    initializeSelections();
});

function initializeProduct() {
    const productJson = document.getElementById('ProductJson-product-template');
    if (productJson) {
        const product = JSON.parse(productJson.textContent);
        productVariants = product.variants;
        updatePrice(product.price, product.compare_at_price);
    } else {
        console.error('ProductJson-product-template element not found');
    }
}

// Initialize selections and thumbnails
function initializeSelections() {
    // Handle color selection and image updates
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update selected color
            selectedColor = this.getAttribute('data-color');
            selectedColorDisplay.textContent = selectedColor;
            
            // Update main image
            const newImageUrl = this.getAttribute('data-image');
            if (newImageUrl) {
                mainImage.src = newImageUrl;
            }
            
            updateVariantPrice();
            console.log('Color selected:', selectedColor);
        });
    });

    // Handle size selection
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update selected size
            selectedSize = this.getAttribute('data-size');
            selectedSizeDisplay.textContent = selectedSize;
            
            updateVariantPrice();
            console.log('Size selected:', selectedSize);
        });
    });

    // Handle thumbnails with active state
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            e.target.classList.add('active');
            mainImage.src = e.target.src;
        });
    });
}

// Find current variant and update price
function updateVariantPrice() {
    if (selectedColor && selectedSize) {
        const variant = findVariant(selectedColor, selectedSize);
        if (variant) {
            currentVariant = variant;
            updatePrice(variant.price, variant.compare_at_price);
        }
    }
}

// Find variant based on color and size
function findVariant(color, size) {
    return productVariants.find(v => 
        (v.option1 || '').toLowerCase().trim() === color.toLowerCase() &&
        (v.option2 || '').toLowerCase().trim() === size.toLowerCase()
    );
}

// Update price display
function updatePrice(price, comparePrice) {
    const priceElement = document.querySelector('.price');
    if (comparePrice && comparePrice > price) {
        priceElement.innerHTML = `
            <span class="discount-price">${formatMoney(price)}</span>
            <span class="original-price">${formatMoney(comparePrice)}</span>
        `;
    } else {
        priceElement.innerHTML = `<span class="discount-price">${formatMoney(price)}</span>`;
    }
}

// Format money (EUR)
function formatMoney(cents) {
    return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

// Update quantity
btnDecrease.addEventListener("click", () => { if (quantity > 1) quantity--; updateQuantity(); });
btnIncrease.addEventListener("click", () => { quantity++; updateQuantity(); });

function updateQuantity() { 
    quantityDisplay.textContent = quantity; 
}

async function addToCart(variantId, quantity) {
    try {
        if (!variantId) {
            throw new Error('The selected variant is not valid');
        }

        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: [{
                    id: variantId,
                    quantity: quantity,
                }]
            })
        });

        if (response.ok) {
            const cart = await response.json();
            console.log('Product added to cart:', cart);
            
            // Show success modal
            const cartModal = document.querySelector('.cart-modal');
            if (cartModal) {
                cartModal.style.display = 'block';
                setTimeout(() => {
                    cartModal.style.display = 'none';
                }, 2000);
            }

            // Automatically open the cart
            if (typeof CartState !== 'undefined' && CartState.openCart) {
                CartState.openCart();
            } else {
                console.error("CartState.openCart is not defined.");
            }
        } else {
            throw new Error('Error adding product to cart');
        }
    } catch (error) {
        console.error('Error in addToCart:', error);
        alert('There was a problem adding the product to the cart.');
    }
}

// Close the cart modal
document.querySelector('.cart-modal button').addEventListener("click", closeCart);
function closeCart() { 
    document.querySelector('.cart-modal').style.display = 'none'; 
}

// Event when adding to the cart
btnCart.addEventListener("click", () => {
    if (!selectedColor || !selectedSize) {
        alert("Please select a color and a size");
        return;
    }
    
    if (!currentVariant) {
        alert("The selected combination is not available");
        return;
    }
    
    addToCart(currentVariant.id, quantity);
});