const favoritesList = document.getElementById('favorites-list');
const favoritesEmpty = document.getElementById('favorites-empty');

function getFavorites() {
    try { return JSON.parse(localStorage.getItem('sys_wishlist')) || []; } catch { return []; }
}

function renderFavorites() {
    const favorites = getFavorites();
    favoritesList.innerHTML = '';
    favoritesEmpty.hidden = favorites.length > 0;
    document.getElementById('nav-wishlist').textContent = favorites.length;
    favorites.forEach(product => {
        const row = document.createElement('article');
        row.className = 'favorite-row';
        row.dataset.id = product.id;
        row.innerHTML = `
            <a class="favorite-image" href="product.html?id=${product.id}"><img src="${product.imagePath}" alt="${product.name}"></a>
            <div class="favorite-details"><a href="product.html?id=${product.id}" class="favorite-name">${product.name}</a><span class="cart-item-meta">${product.category.replace(/_/g, ' ')}</span><strong>${formatAccountPrice(product.price)}</strong></div>
            <button class="favorite-heart" type="button" aria-label="Remove ${product.name}">♥</button>
            <button class="favorite-remove" type="button" aria-label="Delete ${product.name}"><span aria-hidden="true">⌫</span></button>
            <button class="checkout-btn favorite-add" type="button">ADD TO CART <span>&rarr;</span></button>
        `;
        favoritesList.appendChild(row);
    });
}

favoritesList.addEventListener('click', event => {
    const row = event.target.closest('.favorite-row');
    if (!row) return;
    const favorites = getFavorites();
    const product = favorites.find(item => item.id === row.dataset.id);
    if (event.target.closest('.favorite-heart, .favorite-remove')) {
        localStorage.setItem('sys_wishlist', JSON.stringify(favorites.filter(item => item.id !== row.dataset.id)));
        renderFavorites();
    }
    if (event.target.closest('.favorite-add') && product) {
        const cart = JSON.parse(localStorage.getItem('sys_cart') || '[]');
        cart.push(product);
        localStorage.setItem('sys_cart', JSON.stringify(cart));
        event.target.closest('.favorite-add').textContent = 'ADDED TO CART ✓';
        document.getElementById('nav-bag').textContent = cart.length;
    }
});

renderFavorites();
