let cart = JSON.parse(localStorage.getItem('sys_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sys_wishlist')) || [];

const gridElement = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const priceFilter = document.getElementById('price-filter');
const catFilterDropdown = document.getElementById('cat-filter');
const materialFilterDropdown = document.getElementById('material-filter');
const sortFilter = document.getElementById('sort-filter');
const countElement = document.getElementById('results-count');
const clearBtn = document.getElementById('clear-filters');

function updateHeaderCounts() {
    document.getElementById('nav-bag').textContent = cart.length;
    document.getElementById('nav-wishlist').textContent = wishlist.length;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function renderProducts(products) {
    gridElement.innerHTML = '';
    countElement.textContent = `${products.length} RESULT${products.length !== 1 ? 'S' : ''}`;

    if (products.length === 0) {
        gridElement.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 4rem 0;">No items match your criteria.</p>';
        return;
    }

    products.forEach(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <div class="image-placeholder" style="cursor: pointer;" onclick="window.location.href='product.html?id=${product.id}'">
                    <img src="${product.imagePath}" alt="${product.name}" onerror="this.style.display='none'">
                </div>
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isInWishlist ? 'var(--accent)' : 'none'}" stroke="var(--accent)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>
                </button>
            </div>
            <div class="product-info" style="cursor: pointer;" onclick="window.location.href='product.html?id=${product.id}'">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-bottom">
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
            </div>
        `;
        gridElement.appendChild(card);
    });

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.currentTarget.dataset.id;
            const product = productsDatabase.find(p => p.id === id);
            
            const existsIndex = wishlist.findIndex(item => item.id === id);
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
    });
}

function filterAndSort() {
    let filtered = productsDatabase.filter(p => p.department === 'bags');
    
    // Search
    const term = searchInput.value.toLowerCase();
    if (term) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }

    // Category
    const cat = catFilterDropdown.value;
    if (cat !== 'all') {
        filtered = filtered.filter(p => p.category === cat);
    }

    // Material
    const mat = materialFilterDropdown.value;
    if (mat !== 'all') {
        filtered = filtered.filter(p => p.material === mat);
    }

    // Price
    const priceRange = priceFilter.value;
    if (priceRange === 'under5k') {
        filtered = filtered.filter(p => p.price < 5000);
    } else if (priceRange === '5k-10k') {
        filtered = filtered.filter(p => p.price >= 5000 && p.price <= 10000);
    } else if (priceRange === 'over10k') {
        filtered = filtered.filter(p => p.price > 10000);
    }

    // Sort
    const sortBy = sortFilter.value;
    if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderProducts(filtered);
}

// Event Listeners
searchInput.addEventListener('input', filterAndSort);
priceFilter.addEventListener('change', filterAndSort);
catFilterDropdown.addEventListener('change', filterAndSort);
materialFilterDropdown.addEventListener('change', filterAndSort);
sortFilter.addEventListener('change', filterAndSort);

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    priceFilter.value = 'all';
    catFilterDropdown.value = 'all';
    materialFilterDropdown.value = 'all';
    sortFilter.value = 'featured';
    filterAndSort();
});

// Init
updateHeaderCounts();
filterAndSort();
