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

// Nueva función para añadir al carrito utilizando la API de Shopify
async function addToCart(variantId, quantity) {
    try {
        // Verificar si el variantId es válido
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
            
            // Mostrar mensaje de éxito
            const cartModal = document.querySelector('.cart-modal');
            if (cartModal) {
                cartModal.style.display = 'block';
                setTimeout(() => {
                    cartModal.style.display = 'none';
                }, 2000);
            }

            // Abre el carrito si es necesario
            CartState.openCart();
        } else {
            throw new Error('Error al agregar el producto al carrito');
        }
    } catch (error) {
        console.error('Error en addToCart:', error);
        alert('Ocurrió un problema al intentar agregar el producto al carrito.');
    }
}


// Nueva función para cerrar el modal del carrito
function closeCart() {
    const cartModal = document.querySelector('.cart-modal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

btnCarrito.addEventListener("click", () => {
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

    // Aquí ya estás seguro de que tienes un variantId válido, entonces puedes llamar a la función
    addToCart(variantId, cantidad);
});



// Inicializar el producto cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    initializeProduct();
});
