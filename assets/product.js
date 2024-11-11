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

let quantity = 1;
let selectedColor = null;
let selectedSize = null;
let productVariants = [];

// Initialize product
document.addEventListener('DOMContentLoaded', initializeProduct);

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

// Update price
function updatePrice(price, comparePrice) {
    const priceElement = document.querySelector('.price');
    priceElement.innerHTML = comparePrice && comparePrice > price ?
        `<span class="discount-price">${formatMoney(price)}</span><span class="original-price">${formatMoney(comparePrice)}</span>` :
        `<span class="discount-price">${formatMoney(price)}</span>`;
}

// Format money (EUR)
function formatMoney(cents) {
    return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

// Update quantity
btnDecrease.addEventListener("click", () => { if (quantity > 1) quantity--; updateQuantity(); });
btnIncrease.addEventListener("click", () => { quantity++; updateQuantity(); });

function updateQuantity() { quantityDisplay.textContent = quantity; }

// Handle thumbnails
thumbnails.forEach(thumbnail => thumbnail.addEventListener('click', (e) => { mainImage.src = e.target.src; }));

// Generic selection handler for color/size
function handleSelection(elements, displayElement, selectedAttr) {
    elements.forEach(element => {
        element.addEventListener("click", () => {
            elements.forEach(el => el.classList.remove("selected"));
            element.classList.add("selected");
            displayElement.textContent = element.getAttribute(selectedAttr);
            selectedAttr === "data-color" ? selectedColor = element.getAttribute("data-color") : selectedSize = element.getAttribute("data-size");
            console.log(selectedAttr === "data-color" ? 'Color selected:' : 'Size selected:', displayElement.textContent);
        });
    });
}

handleSelection(colorOptions, selectedColorDisplay, "data-color");
handleSelection(sizeOptions, selectedSizeDisplay, "data-size");

// Find variant ID
function findVariantId(color, size) {
    const variant = productVariants.find(v => (v.option1 || '').toLowerCase().trim() === color.toLowerCase() &&
                                                (v.option2 || '').toLowerCase().trim() === size.toLowerCase());
    return variant ? variant.id : null;
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
function closeCart() { document.querySelector('.cart-modal').style.display = 'none'; }

// Event when adding to the cart
btnCart.addEventListener("click", () => {
    if (!selectedColor || !selectedSize) {
        alert("Please select a color and a size");
        return;
    }
    const variantId = findVariantId(selectedColor, selectedSize);
    variantId ? addToCart(variantId, quantity) : alert("The selected combination is not available");
});
