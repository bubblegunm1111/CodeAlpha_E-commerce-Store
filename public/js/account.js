import { 
    auth, 
    signOut, 
    onAuthStateChanged,
    googleProvider,
    signInWithPopup
} from './firebase-config.js';

function formatAccountPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function updateAccountCounts() {
    let wishlist = [];
    let cart = [];
    try { wishlist = JSON.parse(localStorage.getItem('sys_wishlist')) || []; } catch {}
    try { cart = JSON.parse(localStorage.getItem('sys_cart')) || []; } catch {}
    document.getElementById('nav-wishlist').textContent = wishlist.length;
    document.getElementById('nav-bag').textContent = cart.length;
}

onAuthStateChanged(auth, (user) => {
    const googleBtnText = document.getElementById('profile-google-btn-text');
    const emailInput = document.getElementById('profile-email');
    const nameInput = document.getElementById('profile-name');
    if (user) {
        if (emailInput && !emailInput.value) emailInput.value = user.email || '';
        if (nameInput && !nameInput.value && user.displayName) nameInput.value = user.displayName;
        if (googleBtnText) {
            googleBtnText.textContent = user.displayName ? `CONNECTED AS ${user.displayName.toUpperCase()}` : 'GOOGLE ACCOUNT CONNECTED';
        }
    } else {
        if (googleBtnText) googleBtnText.textContent = 'SIGN IN WITH GOOGLE';
    }
});

const profileGoogleBtn = document.getElementById('profile-google-btn');
if (profileGoogleBtn) {
    profileGoogleBtn.addEventListener('click', async () => {
        const statusEl = document.getElementById('profile-status');
        try {
            const res = await signInWithPopup(auth, googleProvider);
            const user = res.user;
            localStorage.setItem('sys_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                name: user.displayName || '',
                photoURL: user.photoURL || '',
                createdAt: user.metadata.creationTime || new Date().toISOString()
            }));
            const nameInput = document.getElementById('profile-name');
            const emailInput = document.getElementById('profile-email');
            if (nameInput && user.displayName) nameInput.value = user.displayName;
            if (emailInput && user.email) emailInput.value = user.email;
            if (statusEl) {
                statusEl.textContent = `Signed in successfully with Google (${user.email}).`;
                statusEl.style.color = 'var(--accent)';
            }
        } catch (err) {
            console.error('Profile Google Auth error:', err);
            if (statusEl) {
                statusEl.textContent = err.message || 'Google sign-in was cancelled or failed.';
                statusEl.style.color = '#e57373';
            }
        }
    });
}

document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const input = document.getElementById(toggle.dataset.passwordTarget);
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggle.textContent = isPassword ? '◉' : '○';
        toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
});

document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('input', () => {
        input.setCustomValidity(input.validity.typeMismatch ? 'Please enter a valid email address.' : '');
    });
});

const profileForm = document.getElementById('profile-form');
if (profileForm) {
    let savedProfile = {};
    try { savedProfile = JSON.parse(localStorage.getItem('sys_profile')) || {}; } catch {}
    ['name', 'email', 'phone', 'address'].forEach(field => {
        if (savedProfile[field]) profileForm.elements[field].value = savedProfile[field];
    });
    profileForm.addEventListener('submit', event => {
        event.preventDefault();
        if (!profileForm.checkValidity()) {
            profileForm.reportValidity();
            return;
        }
        const data = Object.fromEntries(new FormData(profileForm));
        
        // Save to backend database
        fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(result => {
            if (result.success) {
                localStorage.setItem('sys_profile', JSON.stringify(data));
                localStorage.setItem('sys_user', JSON.stringify({ email: data.email, createdAt: new Date().toISOString() }));
                document.getElementById('profile-status').textContent = 'Your profile has been saved to the database.';
            } else {
                document.getElementById('profile-status').textContent = 'Error saving profile: ' + result.error;
            }
        }).catch(err => {
            document.getElementById('profile-status').textContent = 'Network error saving profile.';
        });
    });
}

document.getElementById('account-signout')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (e) {
        console.error('Sign out error:', e);
    }
    localStorage.removeItem('sys_user');
    window.location.href = 'index.html';
});

updateAccountCounts();

