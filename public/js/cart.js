const cartItems = document.getElementById('cart-items');
const emptyCart = document.getElementById('empty-cart');

function getStoredCart() {
    try { return JSON.parse(localStorage.getItem('sys_cart')) || []; } catch { return []; }
}

function setStoredCart(items) {
    localStorage.setItem('sys_cart', JSON.stringify(items));
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function groupedCart() {
    const groups = new Map();
    getStoredCart().forEach(product => {
        if (!product || !product.id) return;
        const existing = groups.get(product.id);
        groups.set(product.id, { product, quantity: existing ? existing.quantity + 1 : 1 });
    });
    return [...groups.values()];
}

function updateHeaderCounts() {
    document.getElementById('nav-bag').textContent = getStoredCart().length;
    try {
        document.getElementById('nav-wishlist').textContent = JSON.parse(localStorage.getItem('sys_wishlist'))?.length || 0;
    } catch {
        document.getElementById('nav-wishlist').textContent = 0;
    }
}

function renderCart() {
    const groups = groupedCart();
    cartItems.innerHTML = '';
    emptyCart.hidden = groups.length > 0;
    document.querySelector('.cart-table-head').hidden = groups.length === 0;
    document.querySelector('.continue-shopping').hidden = groups.length === 0;
    document.querySelector('#checkout-toggle').disabled = groups.length === 0;

    groups.forEach(({ product, quantity }) => {
        const row = document.createElement('article');
        row.className = 'cart-item-row';
        row.dataset.id = product.id;
        row.innerHTML = `
            <a class="cart-item-image" href="product.html?id=${product.id}"><img src="${product.imagePath}" alt="${product.name}"></a>
            <div class="cart-item-details">
                <a href="product.html?id=${product.id}" class="cart-item-name">${product.name}</a>
                <span class="cart-item-meta">${product.category.replace(/_/g, ' ')}${product.size ? ` · ${product.size}` : ''}</span>
            </div>
            <div class="quantity-control" aria-label="Quantity for ${product.name}">
                <button type="button" class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
                <span>${quantity}</span>
                <button type="button" class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
            </div>
            <strong class="cart-item-price">${formatPrice(product.price * quantity)}</strong>
            <button type="button" class="remove-item" aria-label="Remove ${product.name}" title="Remove item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7l1-3h4l1 3"/></svg>
            </button>
        `;
        cartItems.appendChild(row);
    });

    const subtotal = groups.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('total').textContent = formatPrice(subtotal);
    updateHeaderCounts();
}

function changeQuantity(id, delta) {
    const items = getStoredCart();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;
    delta > 0 ? items.push(items[index]) : items.splice(index, 1);
    setStoredCart(items);
    renderCart();
}

function setStep(step) {
    const steps = ['cart', 'information', 'payment'];
    if (!steps.includes(step)) step = 'cart';
    if (step !== 'cart' && !getStoredCart().length) step = 'cart';
    document.querySelectorAll('.checkout-view').forEach(view => {
        view.hidden = view.id !== `${step}-step`;
        view.classList.toggle('is-active', !view.hidden);
    });
    document.querySelectorAll('.checkout-step').forEach(button => {
        const targetIndex = steps.indexOf(button.dataset.stepTarget);
        const currentIndex = steps.indexOf(step);
        button.classList.toggle('active', button.dataset.stepTarget === step);
        button.classList.toggle('complete', targetIndex < currentIndex);
        button.querySelector('.step-marker').textContent = targetIndex < currentIndex ? '✓' : targetIndex + 1;
    });
    if (step !== 'cart') document.querySelector('.cart-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

cartItems.addEventListener('click', event => {
    const row = event.target.closest('.cart-item-row');
    if (!row) return;
    const id = row.dataset.id;
    if (event.target.closest('[data-action="increase"]')) changeQuantity(id, 1);
    if (event.target.closest('[data-action="decrease"]')) changeQuantity(id, -1);
    if (event.target.closest('.remove-item')) {
        setStoredCart(getStoredCart().filter(item => item.id !== id));
        renderCart();
    }
});

document.querySelectorAll('[data-step-target]').forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.stepTarget;
        if (target === 'information' && !getStoredCart().length) return;
        if (target === 'payment' && !document.getElementById('information-form').checkValidity()) {
            setStep('information');
            document.getElementById('information-form').reportValidity();
            return;
        }
        setStep(target);
    });
});

document.getElementById('checkout-toggle').addEventListener('click', () => setStep('information'));

document.getElementById('information-form').addEventListener('submit', event => {
    event.preventDefault();
    if (event.target.checkValidity()) setStep('payment');
});

const cardNumber = document.getElementById('card-number');
const cardName = document.getElementById('card-name');
const cardExpiry = document.getElementById('card-expiry');
const paymentCard = document.getElementById('payment-card');

cardNumber.addEventListener('input', event => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 16);
    event.target.value = digits.replace(/(.{4})/g, '$1 ').trim();
    document.getElementById('card-preview-number').textContent = event.target.value || '•••• •••• •••• ••••';
});

cardName.addEventListener('input', event => {
    event.target.value = event.target.value.toUpperCase();
    document.getElementById('card-preview-name').textContent = event.target.value || 'YOUR NAME';
});

cardExpiry.addEventListener('input', event => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    document.getElementById('card-preview-expiry').textContent = event.target.value || 'MM/YY';
});

paymentCard.addEventListener('pointermove', event => {
    const rect = paymentCard.getBoundingClientRect();
    const horizontalPosition = (event.clientX - rect.left) / rect.width - 0.5;
    const translateX = horizontalPosition * 14;
    const rotateY = horizontalPosition * 6;
    paymentCard.style.transform = `translateX(${translateX}px) rotateY(${rotateY}deg)`;
});

paymentCard.addEventListener('pointerleave', () => {
    paymentCard.style.transform = '';
});

document.getElementById('payment-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.target.checkValidity()) return;
    const message = document.getElementById('checkout-message');
    message.hidden = false;
    message.textContent = 'Your order has been prepared for secure confirmation.';
    setStoredCart([]);
    renderCart();
});

renderCart();
setStep('cart');
