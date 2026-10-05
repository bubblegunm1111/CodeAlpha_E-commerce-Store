let cart = getCart();
let wishlist = getWishlist();

function updateHeaderCounts() {
    document.getElementById('nav-bag').textContent = cart.length;
    document.getElementById('nav-wishlist').textContent = wishlist.length;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const product = productsDatabase.find(p => p.id === productId);

if (!product) {
    document.getElementById('detail-container').innerHTML = '<p>Product not found.</p>';
} else {
    document.getElementById('bread-name').textContent = product.name;
    const backLink = document.getElementById('back-link');
    if (backLink) {
        backLink.href = product.department + '.html';
        const deptName = product.department.charAt(0).toUpperCase() + product.department.slice(1);
        backLink.innerHTML = '&larr; Back to ' + (deptName === 'Exclusive' ? 'Royal Essence' : deptName);
    }
    
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    // Build optional specs
    let specsHtml = `<p><strong>Category:</strong> <span style="text-transform: capitalize;">${product.category.replace('_', ' ')}</span></p>`;
    if (product.material) specsHtml += `<p><strong>Material:</strong> <span style="text-transform: capitalize;">${product.material}</span></p>`;
    if (product.gemstone) specsHtml += `<p><strong>Gemstone:</strong> <span style="text-transform: capitalize;">${product.gemstone}</span></p>`;
    if (product.size) specsHtml += `<p><strong>Size:</strong> <span style="text-transform: capitalize;">${product.size}</span></p>`;

    document.getElementById('detail-container').innerHTML = `
        <div class="detail-image-box">
            <div class="image-placeholder">
                <img src="${product.imagePath}" alt="${product.name}" onerror="this.style.display='none'">
            </div>
        </div>
        <div class="detail-info-box">
            <h1 class="detail-title">${product.name}</h1>
            <div style="color: var(--accent); margin-bottom: 1rem; font-size: 0.9rem;">
                &#9733; &#9733; &#9733; &#9733; ${product.rating === 5.0 ? '&#9733;' : '&#9734;'} <span style="color: var(--text-muted); margin-left: 0.5rem;">(${product.rating})</span>
            </div>
            <p class="detail-price">${formatPrice(product.price)}</p>
            <p class="detail-desc">${product.description}</p>
            
            <div class="detail-specs">
                ${specsHtml}
            </div>

            <div class="detail-actions">
                <button class="add-cart-btn large-btn" id="add-to-bag-btn">ADD TO CART &rarr;</button>
                <button class="wishlist-detail-btn ${isInWishlist ? 'active' : ''}" id="add-to-wishlist-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="${isInWishlist ? 'var(--accent)' : 'none'}" stroke="var(--accent)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>
                </button>
            </div>
        </div>
    `;

    document.getElementById('add-to-bag-btn').addEventListener('click', (e) => {
        cart.push(product);
        localStorage.setItem('sys_cart', JSON.stringify(cart));
        updateHeaderCounts();
        
        const originalText = e.target.innerHTML;
        e.target.innerHTML = "ADDED TO CART &check;";
        e.target.style.backgroundColor = "var(--accent)";
        e.target.style.color = "var(--bg-dark)";
        setTimeout(() => {
            e.target.innerHTML = originalText;
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "var(--accent)";
        }, 1500);
    });

    document.getElementById('add-to-wishlist-btn').addEventListener('click', (e) => {
        const existsIndex = wishlist.findIndex(item => item.id === product.id);
        if (existsIndex > -1) {
            wishlist.splice(existsIndex, 1);
            e.currentTarget.classList.remove('active');
            e.currentTarget.querySelector('svg').setAttribute('fill', 'none');
        } else {
            wishlist.push(product);
            e.currentTarget.classList.add('active');
            e.currentTarget.querySelector('svg').setAttribute('fill', 'var(--accent)');
        }
        localStorage.setItem('sys_wishlist', JSON.stringify(wishlist));
        updateHeaderCounts();
    });

    // Render related
    const related = productsDatabase.filter(p => p.id !== product.id && p.department === product.department).slice(0, 4);
    const relatedGrid = document.getElementById('related-grid');
    related.forEach(rel => {
        const isRelWishlist = wishlist.some(item => item.id === rel.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <div class="image-placeholder" style="cursor: pointer;" onclick="window.location.href='product.html?id=${rel.id}'">
                    <img src="${rel.imagePath}" alt="${rel.name}" onerror="this.style.display='none'">
                </div>
                <button class="wishlist-btn ${isRelWishlist ? 'active' : ''}" onclick="event.stopPropagation();">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isRelWishlist ? 'var(--accent)' : 'none'}" stroke="var(--accent)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${rel.name}</h3>
                <div class="product-bottom">
                    <span class="product-price">${formatPrice(rel.price)}</span>
                    <button class="add-cart-btn" onclick="window.location.href='product.html?id=${rel.id}'">VIEW DETAILS</button>
                </div>
            </div>
        `;
        relatedGrid.appendChild(card);
    });
}

updateHeaderCounts();
