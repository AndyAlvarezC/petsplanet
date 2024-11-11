// Declaraciones de elementos
const cantidadDisplay = document.getElementById("cantidad");
const btnMenor = document.getElementById("btn-menor");
const btnMayor = document.getElementById("btn-mayor");
const btnCarrito = document.querySelector(".btn-carrito");
const colorSeleccionado = document.getElementById("color-seleccionado");
const tallaSeleccionada = document.getElementById("talla-seleccionada");
const miniaturas = document.querySelectorAll('.miniatura');
const imagenPrincipal = document.querySelector('.imagen-principal img');
const opcionesColores = document.querySelectorAll(".opcion-color");
const opcionesTallas = document.querySelectorAll(".talla");

let cantidad = 1;
let selectedColor = null;
let selectedSize = null;
let productVariants = [];

// Inicializar producto
document.addEventListener('DOMContentLoaded', initializeProduct);

function initializeProduct() {
    const productJson = document.getElementById('ProductJson-product-template');
    if (productJson) {
        const product = JSON.parse(productJson.textContent);
        productVariants = product.variants;
        updatePrice(product.price, product.compare_at_price);
    } else {
        console.error('No se encuentra el elemento ProductJson-product-template');
    }
}

// Actualizar precio
function updatePrice(price, comparePrice) {
    const priceElement = document.querySelector('.precio');
    priceElement.innerHTML = comparePrice && comparePrice > price ?
        `<span class="precio-descuento">${formatMoney(price)}</span><span class="precio-original">${formatMoney(comparePrice)}</span>` :
        `<span class="precio-descuento">${formatMoney(price)}</span>`;
}

// Formatear dinero
function formatMoney(cents) {
    return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

// Actualizar cantidad
btnMenor.addEventListener("click", () => { if (cantidad > 1) cantidad--; actualizarCantidad(); });
btnMayor.addEventListener("click", () => { cantidad++; actualizarCantidad(); });
function actualizarCantidad() { cantidadDisplay.textContent = cantidad; }

// Manejo de miniaturas
miniaturas.forEach(miniatura => miniatura.addEventListener('click', (e) => { imagenPrincipal.src = e.target.src; }));

// Selección genérica para color/talla
function handleSelection(elements, displayElement, selectedAttr) {
    elements.forEach(element => {
        element.addEventListener("click", () => {
            elements.forEach(el => el.classList.remove("seleccionado"));
            element.classList.add("seleccionado");
            displayElement.textContent = element.getAttribute(selectedAttr);
            selectedAttr === "data-color" ? selectedColor = element.getAttribute("data-color") : selectedSize = element.getAttribute("data-talla");
            console.log(selectedAttr === "data-color" ? 'Color seleccionado:' : 'Talla seleccionada:', displayElement.textContent);
        });
    });
}

handleSelection(opcionesColores, colorSeleccionado, "data-color");
handleSelection(opcionesTallas, tallaSeleccionada, "data-talla");

// Buscar variantId
function findVariantId(color, size) {
    const variant = productVariants.find(v => (v.option1 || '').toLowerCase().trim() === color.toLowerCase() && 
                                                (v.option2 || '').toLowerCase().trim() === size.toLowerCase());
    return variant ? variant.id : null;
}

async function addToCart(variantId, quantity) {
    try {
        if (!variantId) {
            throw new Error('La variante seleccionada no es válida');
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
            console.log('Producto añadido al carrito:', cart);
            
            // Mostrar el modal de éxito
            const cartModal = document.querySelector('.cart-modal');
            if (cartModal) {
                cartModal.style.display = 'block';
                setTimeout(() => {
                    cartModal.style.display = 'none';
                }, 2000);
            }

            // Abre el carrito automáticamente
            if (typeof CartState !== 'undefined' && CartState.openCart) {
                CartState.openCart();
            } else {
                console.error("CartState.openCart no está definido.");
            }
        } else {
            throw new Error('Error al agregar el producto al carrito');
        }
    } catch (error) {
        console.error('Error en addToCart:', error);
        alert('Ocurrió un problema al intentar agregar el producto al carrito.');
    }
}

// Cerrar el modal del carrito
document.querySelector('.cart-modal button').addEventListener("click", closeCart);
function closeCart() { document.querySelector('.cart-modal').style.display = 'none'; }

// Evento al añadir al carrito
btnCarrito.addEventListener("click", () => {
    if (!selectedColor || !selectedSize) {
        alert("Por favor, selecciona un color y una talla");
        return;
    }
    const variantId = findVariantId(selectedColor, selectedSize);
    variantId ? addToCart(variantId, cantidad) : alert("La combinación seleccionada no está disponible");
});
