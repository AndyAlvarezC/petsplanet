const btnMenor = document.getElementById("btn-menor");
const btnMayor = document.getElementById("btn-mayor");
const cantidadDisplay = document.getElementById("cantidad");
const btnCarrito = document.querySelector(".btn-carrito");
const colorSeleccionado = document.getElementById("color-seleccionado");
const tallaSeleccionada = document.getElementById("talla-seleccionada");

let cantidad = 1;
let selectedColor = null;
let selectedSize = null;
let productVariants = [];

function getProductVariants() {
    const productJson = document.getElementById('ProductJson-product-template');
    if (!productJson) {
        console.error('No se encuentra el elemento ProductJson-product-template');
        return null;
    }
    return JSON.parse(productJson.textContent);
}

function initializeProduct() {
    try {
        const product = getProductVariants();
        if (product) {
            productVariants = product.variants;
            console.log('Variantes disponibles:', productVariants);
            updatePrice(product.price, product.compare_at_price);
        }
    } catch (error) {
        console.error('Error al inicializar el producto:', error);
    }
}

function updatePrice(price, comparePrice) {
    const priceElement = document.querySelector('.precio');
    if (comparePrice && comparePrice > price) {
        priceElement.innerHTML = `
            <span class="precio-descuento">${formatMoney(price)}</span>
            <span class="precio-original">${formatMoney(comparePrice)}</span>
        `;
    } else {
        priceElement.innerHTML = `<span class="precio-descuento">${formatMoney(price)}</span>`;
    }
}

function formatMoney(cents) {
    return (cents/100).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR'
    });
}

function actualizarCantidad() {
    cantidadDisplay.textContent = cantidad;
}

// Eventos para los botones de cantidad
btnMenor.addEventListener("click", () => {
    if (cantidad > 1) {
        cantidad--;
        actualizarCantidad();
    }
});

btnMayor.addEventListener("click", () => {
    cantidad++;
    actualizarCantidad();
});

// Manejo de miniaturas
const miniaturas = document.querySelectorAll('.miniatura');
const imagenPrincipal = document.querySelector('.imagen-principal img');

miniaturas.forEach(miniatura => {
    miniatura.addEventListener('click', (event) => {
        imagenPrincipal.src = event.target.src;
    });
});

// Manejo de selección de color
const opcionesColores = document.querySelectorAll(".opcion-color");

opcionesColores.forEach(opcion => {
    opcion.addEventListener("click", () => {
        // Eliminar selección previa
        opcionesColores.forEach(color => color.classList.remove("seleccionado"));
        // Agregar nueva selección
        opcion.classList.add("seleccionado");
        selectedColor = opcion.getAttribute("data-color");
        colorSeleccionado.textContent = selectedColor;
        console.log('Color seleccionado:', selectedColor);
    });
});

// Manejo de selección de talla
const opcionesTallas = document.querySelectorAll(".talla");

opcionesTallas.forEach(opcion => {
    opcion.addEventListener("click", () => {
        // Eliminar selección previa
        opcionesTallas.forEach(talla => talla.classList.remove("talla-seleccionada"));
        // Agregar nueva selección
        opcion.classList.add("talla-seleccionada");
        selectedSize = opcion.getAttribute("data-talla");
        tallaSeleccionada.textContent = selectedSize;
        console.log('Talla seleccionada:', selectedSize);
    });
});

// Función para encontrar la variante
function findVariantId(color, size) {
    if (!productVariants || productVariants.length === 0) {
        console.error('No hay variantes disponibles');
        return null;
    }

    const normalizedColor = color.toLowerCase().trim();
    const normalizedSize = size.toLowerCase().trim();

    console.log('Buscando variante:', {
        color: normalizedColor,
        size: normalizedSize,
        selectedColor,
        selectedSize
    });

    const variant = productVariants.find(v => {
        const variantColor = (v.option1 || '').toLowerCase().trim();
        const variantSize = (v.option2 || '').toLowerCase().trim();
        
        return variantColor === normalizedColor && 
            variantSize === normalizedSize;
    });

    return variant ? variant.id : null;
}

// Nueva función para añadir al carrito
async function addToCart(variantId, quantity) {
    try {
        // Get the current product data
        const product = getProductVariants();
        if (!product) {
            throw new Error('No se pudo obtener la información del producto');
        }

        // Find the selected variant
        const variant = product.variants.find(v => v.id === variantId);
        if (!variant) {
            throw new Error('Variante no encontrada');
        }

        // Create the cart item
        const cartItem = {
            variantId: variantId,
            quantity: quantity,
            title: product.title,
            price: variant.price,
            image: variant.featured_image ? variant.featured_image.src : product.featured_image,
            variant: `${variant.option1}${variant.option2 ? ' / ' + variant.option2 : ''}`
        };

        // Add to cart using CartState
        const success = await CartState.addItem(cartItem);
        
        if (success) {
            // Show success message
            const cartModal = document.querySelector('.cart-modal');
            if (cartModal) {
                cartModal.style.display = 'block';
                setTimeout(() => {
                    cartModal.style.display = 'none';
                }, 2000);
            }
            
            // Open cart sidebar
            CartState.openCart();
        }
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        alert('Hubo un error al agregar el producto al carrito');
    }
}

// Nueva función para cerrar el modal del carrito
function closeCart() {
    const cartModal = document.querySelector('.cart-modal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

// Evento del botón de añadir al carrito
btnCarrito.addEventListener("click", () => {
    console.log('Estado actual:', { selectedColor, selectedSize });
    
    if (!selectedColor || !selectedSize || 
        selectedColor === null || selectedSize === null || 
        selectedSize === "Selecciona una talla") {
        alert("Por favor, selecciona un color y una talla");
        return;
    }

    const variantId = findVariantId(selectedColor, selectedSize);
    if (!variantId) {
        alert("La combinación seleccionada no está disponible");
        return;
    }

    addToCart(variantId, cantidad);
});

// Inicializar el producto cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initializeProduct();
});