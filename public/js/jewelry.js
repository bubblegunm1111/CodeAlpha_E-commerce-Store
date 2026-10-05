// Database is now loaded from db.js

// App State
let cart = JSON.parse(localStorage.getItem('sys_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sys_wishlist')) || [];
let currentCategory = 'all';

const gridElement = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const priceFilter = document.getElementById('price-filter');
const catFilterDropdown = document.getElementById('cat-filter');
const sortFilter = document.getElementById('sort-filter');
const countElement = document.getElementById('results-count');
const tabs = document.querySelectorAll('.tab-btn');
const clearBtn = document.getElementById('clear-filters');

function updateHeaderCounts() {
    document.getElementById('nav-bag').textContent = `BAG (${cart.length})`;
    document.getElementById('nav-wishlist').textContent = `WISHLIST (${wishlist.length})`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function renderProducts(products) {
    gridElement.innerHTML = '';
    countElement.textContent = `${products.length} PIECES`;
    
    if (products.length === 0) {
        gridElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem 0;">No products match your criteria.</p>';
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
                <div class="product-bottom" style="margin-top: 1rem;">
                    <span class="product-price">${formatPrice(product.price)}</span>
                </div>
            </div>
        `;
        gridElement.appendChild(card);
    });

    // Removed grid-level add to cart event listeners since it's now on the product page

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const product = jewelryDatabase.find(p => p.id === id);
            
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
    let filtered = jewelryDatabase;

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm));
    }

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    
    if (catFilterDropdown.value !== 'all' && currentCategory === 'all') {
        filtered = filtered.filter(p => p.category === catFilterDropdown.value);
    }

    const priceVal = priceFilter.value;
    if (priceVal === 'under-5000') filtered = filtered.filter(p => p.price < 5000);
    if (priceVal === 'over-5000') filtered = filtered.filter(p => p.price >= 5000);

    const sortVal = sortFilter.value;
    if (sortVal === 'low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
}

// Event Listeners
searchInput.addEventListener('input', filterAndSort);
priceFilter.addEventListener('change', filterAndSort);
catFilterDropdown.addEventListener('change', filterAndSort);
sortFilter.addEventListener('change', filterAndSort);

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.cat;
        catFilterDropdown.value = 'all'; // reset dropdown when tab clicked
        filterAndSort();
    });
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    priceFilter.value = 'all';
    catFilterDropdown.value = 'all';
    sortFilter.value = 'featured';
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector('.tab-btn[data-cat="all"]').classList.add('active');
    currentCategory = 'all';
    filterAndSort();
});

// Initial render
updateHeaderCounts();
filterAndSort();
