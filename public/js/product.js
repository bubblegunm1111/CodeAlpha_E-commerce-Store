import { 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    googleProvider,
    signInWithPopup 
} from './firebase-config.js';

let cart = getCart();
let wishlist = getWishlist();

onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem('sys_user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            createdAt: user.metadata.creationTime || new Date().toISOString()
        }));
    }
});

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
    const deptName = product.department === 'exclusive' ? 'THE ROYAL ESSENCE' : product.department.toUpperCase();
    
    const isInWishlist = wishlist.some(item => item.id === product.id);

    // Build specs as grid
    let specsHtml = `<div style="display: grid; grid-template-columns: 100px 1fr; gap: 0.5rem; font-size: 0.75rem; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase;">`;
    specsHtml += `<span style="color: var(--text-muted);">CATEGORY:</span> <span style="color: var(--text-cream);">${product.category.replace('_', ' ')}</span>`;
    if (product.material) specsHtml += `<span style="color: var(--text-muted);">MATERIAL:</span> <span style="color: var(--text-cream);">${product.material}</span>`;
    if (product.gemstone) specsHtml += `<span style="color: var(--text-muted);">GEMSTONE:</span> <span style="color: var(--text-cream);">${product.gemstone}</span>`;
    if (product.size) specsHtml += `<span style="color: var(--text-muted);">SIZE:</span> <span style="color: var(--text-cream);">${product.size}</span>`;
    specsHtml += `</div>`;

    document.getElementById('detail-container').innerHTML = `
        <div class="detail-image-box">
            <img src="${product.imagePath}" alt="${product.name}" onerror="this.style.display='none'" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="detail-info-box">
            <div class="detail-breadcrumbs">
                <a href="index.html#categories">COLLECTIONS</a> &nbsp;/&nbsp; <a href="${product.department}.html">${deptName}</a> &nbsp;/&nbsp; ${product.name.toUpperCase()}
            </div>
            
            <div class="detail-star-separator">
                <span class="line"></span>
                <span class="star">✦</span>
                <span class="line"></span>
            </div>

            <div class="detail-kicker">THE ${product.category.toUpperCase().replace('_', ' ')} COLLECTION</div>
            
            <h1 class="detail-title">${product.name}</h1>
            
            <div class="detail-rating">
                &#9733; &#9733; &#9733; &#9733; ${product.rating >= 5.0 ? '&#9733;' : '&#9734;'} <span>(${product.rating.toFixed(1)})</span>
            </div>
            
            <p class="detail-price">${formatPrice(product.price)}</p>
            
            <p class="detail-desc">${product.description}</p>
            
            <div class="detail-divider"></div>
            
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
        if (!localStorage.getItem('sys_user')) {
            openAuthGate();
            return;
        }
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

function openAuthGate() {
    if (document.getElementById('auth-gate')) return;
    let isSignUpMode = false;
    const gate = document.createElement('div');
    gate.id = 'auth-gate';
    gate.className = 'auth-gate';
    gate.innerHTML = `
        <div class="auth-backdrop" data-auth-close></div>
        <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button class="auth-close" type="button" aria-label="Close sign in dialog" data-auth-close>&times;</button>
            <div class="detail-kicker">A PRIVATE COLLECTION AWAITS</div>
            <h2 id="auth-title">SIGN IN TO CONTINUE</h2>
            <p id="auth-subtitle">Create an account or sign in before adding pieces to your private selection.</p>
            <form id="auth-form" class="auth-form">
                <label for="auth-email">EMAIL ADDRESS <span class="required-mark">*</span></label>
                <input id="auth-email" type="email" autocomplete="email" placeholder="name@example.com" required>
                <label for="auth-password">PASSWORD <span class="required-mark">*</span></label>
                <div class="password-wrap">
                    <input id="auth-password" type="password" autocomplete="current-password" minlength="8" placeholder="••••••••" required>
                    <button class="password-toggle" type="button" id="auth-password-toggle" aria-label="Show password">◉</button>
                </div>
                <small class="password-help">At least 8 characters, including one number.</small>
                <p class="auth-error" id="auth-error" role="alert"></p>
                <button class="checkout-btn" id="auth-submit-btn" type="submit">SIGN IN & ADD TO CART <span>&rarr;</span></button>
            </form>

            <div class="auth-divider">
                <span>OR CONTINUE WITH</span>
            </div>

            <button class="auth-google-btn" type="button" id="auth-google-btn">
                <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
            </button>

            <button class="auth-signup" type="button" id="auth-signup">NEW TO SYS? CREATE AN ACCOUNT</button>
            <p class="auth-note" style="color: var(--accent); opacity: 0.85;">🔒 Secured by Google Firebase</p>
        </section>
    `;
    document.body.appendChild(gate);
    const closeGate = () => gate.remove();
    gate.querySelectorAll('[data-auth-close]').forEach(button => button.addEventListener('click', closeGate));
    
    const signupToggleBtn = gate.querySelector('#auth-signup');
    const submitBtn = gate.querySelector('#auth-submit-btn');
    const titleEl = gate.querySelector('#auth-title');
    const googleBtn = gate.querySelector('#auth-google-btn');

    signupToggleBtn.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        if (isSignUpMode) {
            titleEl.textContent = 'CREATE YOUR ACCOUNT';
            submitBtn.innerHTML = 'CREATE ACCOUNT & ADD TO CART <span>&rarr;</span>';
            signupToggleBtn.textContent = 'ALREADY A MEMBER? SIGN IN';
        } else {
            titleEl.textContent = 'SIGN IN TO CONTINUE';
            submitBtn.innerHTML = 'SIGN IN & ADD TO CART <span>&rarr;</span>';
            signupToggleBtn.textContent = 'NEW TO SYS? CREATE AN ACCOUNT';
        }
    });

    gate.querySelector('#auth-password-toggle').addEventListener('click', () => {
        const password = gate.querySelector('#auth-password');
        const visible = password.type === 'password';
        password.type = visible ? 'text' : 'password';
        gate.querySelector('#auth-password-toggle').textContent = visible ? '◉' : '○';
        gate.querySelector('#auth-password-toggle').setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    });

    // Google Sign-In Handler
    googleBtn.addEventListener('click', async () => {
        const error = gate.querySelector('#auth-error');
        error.textContent = '';
        googleBtn.disabled = true;
        googleBtn.style.opacity = '0.6';
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            localStorage.setItem('sys_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: user.displayName || '',
                photoURL: user.photoURL || '',
                createdAt: user.metadata.creationTime || new Date().toISOString()
            }));

            cart.push(product);
            localStorage.setItem('sys_cart', JSON.stringify(cart));
            updateHeaderCounts();
            closeGate();

            const button = document.getElementById('add-to-bag-btn');
            button.innerHTML = 'ADDED TO CART &check;';
            button.classList.add('auth-added');
        } catch (err) {
            console.error('Google Auth error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                error.textContent = 'Google sign-in popup closed before completing.';
            } else if (err.code === 'auth/operation-not-allowed') {
                error.textContent = 'Google sign-in is not enabled in Firebase Console. Please enable Google provider.';
            } else {
                error.textContent = err.message || 'Google sign-in failed.';
            }
        } finally {
            googleBtn.disabled = false;
            googleBtn.style.opacity = '1';
        }
    });

    gate.querySelector('#auth-form').addEventListener('submit', async event => {
        event.preventDefault();
        const emailInput = gate.querySelector('#auth-email');
        const passwordInput = gate.querySelector('#auth-password');
        const error = gate.querySelector('#auth-error');

        if (!emailInput.validity.valid) {
            error.textContent = 'Please enter a valid email address.';
            emailInput.focus();
            return;
        }
        if (passwordInput.value.length < 8 || !/\d/.test(passwordInput.value)) {
            error.textContent = 'Use at least 8 characters and include one number.';
            passwordInput.focus();
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        error.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = isSignUpMode ? 'CREATING ACCOUNT...' : 'SIGNING IN...';

        try {
            let userCredential;
            if (isSignUpMode) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            const user = userCredential.user;
            // Sync with backend API to issue JWT token & store in database
            try {
                const endpoint = isSignUpMode ? '/api/auth/register' : '/api/auth/login';
                const authRes = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const authData = await authRes.json();
                if (authData.token) {
                    localStorage.setItem('sys_jwt', authData.token);
                }
            } catch (backendAuthErr) {
                console.debug('Backend JWT sync note:', backendAuthErr);
            }

            cart.push(product);
            localStorage.setItem('sys_cart', JSON.stringify(cart));
            // Trigger persistent cart sync
            const token = localStorage.getItem('sys_jwt');
            if (token) {
                fetch('/api/cart/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: cart })
                }).catch(() => {});
            }
            updateHeaderCounts();
            closeGate();

            const button = document.getElementById('add-to-bag-btn');
            button.innerHTML = 'ADDED TO CART &check;';
            button.classList.add('auth-added');
        } catch (err) {
            console.error('Firebase Auth error:', err);
            let message = err.message || 'Authentication failed.';
            if (err.code === 'auth/email-already-in-use') {
                message = 'An account already exists with this email. Try signing in.';
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                message = 'Invalid email or password. Please try again.';
            } else if (err.code === 'auth/weak-password') {
                message = 'Password is too weak. Please use at least 6-8 characters.';
            }
            error.textContent = message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = (isSignUpMode ? 'CREATE ACCOUNT & ADD TO CART' : 'SIGN IN & ADD TO CART') + ' <span>&rarr;</span>';
        }
    });
    gate.querySelector('#auth-email').focus();
}

updateHeaderCounts();
