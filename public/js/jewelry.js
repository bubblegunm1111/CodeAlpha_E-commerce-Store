// Mock Database for Jewelry
const jewelryDatabase = [
    {
        id: "j1",
        name: "The Crimson Tear Necklace",
        category: "necklace",
        price: 12500,
        description: "A rare pear-cut ruby surrounded by pavé diamonds, set in 18k white gold.",
        imagePath: "images/jewelry/necklaces/crimson_tear.jpg"
    },
    {
        id: "j2",
        name: "Eternity Diamond Band",
        category: "ring",
        price: 4200,
        description: "A continuous circle of flawless brilliant-cut diamonds, representing eternal romance.",
        imagePath: "images/jewelry/rings/eternity_band.jpg"
    },
    {
        id: "j3",
        name: "Obsidian Royalty Ring",
        category: "ring",
        price: 8900,
        description: "A bold, dark obsidian center stone crowned with delicate gold filigree.",
        imagePath: "images/jewelry/rings/obsidian_royalty.jpg"
    },
    {
        id: "j4",
        name: "Starlight Sapphire Bracelet",
        category: "bracelet",
        price: 15600,
        description: "Midnight blue sapphires alternating with bright white diamonds on a platinum chain.",
        imagePath: "images/jewelry/bracelets/starlight_sapphire.jpg"
    },
    {
        id: "j5",
        name: "The Sovereign Solitaire",
        category: "ring",
        price: 24000,
        description: "An awe-inspiring 3-carat flawless diamond perched upon a cathedral setting.",
        imagePath: "images/jewelry/rings/sovereign_solitaire.jpg"
    },
    {
        id: "j6",
        name: "Velvet Choker with Pearl Drop",
        category: "necklace",
        price: 2100,
        description: "Luxurious black velvet ribbon featuring a single, lustrous South Sea pearl.",
        imagePath: "images/jewelry/necklaces/velvet_pearl.jpg"
    }
];

// App State
let cart = JSON.parse(localStorage.getItem('sys_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sys_wishlist')) || [];

const gridElement = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const priceFilter = document.getElementById('price-filter');
const catFilters = document.querySelectorAll('.cat-filter');

function updateHeaderCounts() {
    document.getElementById('nav-bag').textContent = `BAG (${cart.length})`;
    document.getElementById('nav-wishlist').textContent = `WISHLIST (${wishlist.length})`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function renderProducts(products) {
    gridElement.innerHTML = '';
    
    if (products.length === 0) {
        gridElement.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No products match your criteria.</p>';
        return;
    }

    products.forEach(product => {
        const isInWishlist = wishlist.some(item => item.id === product.id);
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <!-- Placeholder black block; when user adds image to folder, it will load -->
                <div class="image-placeholder">
                    <img src="${product.imagePath}" alt="${product.name}" onerror="this.style.display='none'">
                </div>
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z"/></svg>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-bottom">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button class="add-cart-btn btn btn-primary" data-id="${product.id}">ADD TO BAG</button>
                </div>
            </div>
        `;
        gridElement.appendChild(card);
    });

    // Attach listeners to new buttons
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const product = jewelryDatabase.find(p => p.id === id);
            cart.push(product);
            localStorage.setItem('sys_cart', JSON.stringify(cart));
            updateHeaderCounts();
            
            // Visual feedback
            const originalText = e.target.textContent;
            e.target.textContent = "ADDED!";
            e.target.style.backgroundColor = "var(--accent)";
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.backgroundColor = "transparent";
            }, 1000);
        });
    });

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
                e.currentTarget.querySelector('svg').setAttribute('fill', 'currentColor');
            }
            
            localStorage.setItem('sys_wishlist', JSON.stringify(wishlist));
            updateHeaderCounts();
        });
    });
}

function filterAndSort() {
    let filtered = jewelryDatabase;

    // Search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm));
    }

    // Category filter
    const activeCategories = Array.from(catFilters).filter(cb => cb.checked).map(cb => cb.value);
    filtered = filtered.filter(p => activeCategories.includes(p.category));

    // Price range filter
    const priceVal = priceFilter.value;
    if (priceVal === 'under-5000') filtered = filtered.filter(p => p.price < 5000);
    if (priceVal === 'over-5000') filtered = filtered.filter(p => p.price >= 5000);

    // Sorting
    if (priceVal === 'low-high') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (priceVal === 'high-low') {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
}

// Event Listeners for Filters
searchInput.addEventListener('input', filterAndSort);
priceFilter.addEventListener('change', filterAndSort);
catFilters.forEach(cb => cb.addEventListener('change', filterAndSort));

// Initial render
updateHeaderCounts();
renderProducts(jewelryDatabase);
