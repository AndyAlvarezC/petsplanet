const btnMenor = document.getElementById("btn-menor");
const btnMayor = document.getElementById("btn-mayor");
const cantidadDisplay = document.getElementById("cantidad");
const btnCarrito = document.querySelector(".btn-carrito");

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

const miniaturas = document.querySelectorAll('.miniatura');
const imagenPrincipal = document.querySelector('.imagen-principal img');

miniaturas.forEach(miniatura => {
    miniatura.addEventListener('click', (event) => {
        imagenPrincipal.src = event.target.src;
    });
});

const opcionesColores = document.querySelectorAll(".opcion-color");

opcionesColores.forEach(opcion => {
    opcion.addEventListener("click", () => {
        opcionesColores.forEach(color => color.classList.remove("seleccionado"));
        opcion.classList.add("seleccionado");
        selectedColor = opcion.getAttribute("data-color");
        colorSeleccionado.textContent = selectedColor;
        console.log('Color seleccionado:', selectedColor);
    });
});

const opcionesTallas = document.querySelectorAll(".talla");

opcionesTallas.forEach(opcion => {
    opcion.addEventListener("click", () => {
        opcionesTallas.forEach(talla => talla.classList.remove("talla-seleccionada"));
        opcion.classList.add("talla-seleccionada");
        selectedSize = opcion.getAttribute("data-talla");
        tallaSeleccionada.textContent = selectedSize;
        console.log('Talla seleccionada:', selectedSize);
    });
});

btnCarrito.addEventListener("click", () => {
    if (!selectedColor || !selectedSize) {
        alert("Por favor, selecciona un color y una talla");
        return;
    }

    console.log('Buscando variante para:', {
        color: selectedColor,
        talla: selectedSize,
        variantes: productVariants
    });

    const variantId = findVariantId(selectedColor, selectedSize);
    if (!variantId) {
        alert("La combinación seleccionada no está disponible");
        return;
    }

    addToCart(variantId, cantidad);
});

function findVariantId(color, size) {

    const normalizedColor = color.toLowerCase().trim();
    const normalizedSize = size.split(' ')[0].toLowerCase().trim();

    console.log('Buscando variante con valores normalizados:', {
        color: normalizedColor,
        size: normalizedSize
    });

    const variant = productVariants.find(v => {
        const variantColor = (v.option1 || '').toLowerCase().trim();
        const variantSize = (v.option2 || '').toLowerCase().trim();
        
        console.log('Comparando con variante:', {
            variantColor,
            variantSize,
            match: variantColor === normalizedColor && variantSize.startsWith(normalizedSize)
        });

        return variantColor === normalizedColor && variantSize.startsWith(normalizedSize);
    });

    return variant ? variant.id : null;
}