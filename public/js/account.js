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
    const loggedInView = document.getElementById('profile-logged-in-view');
    const loggedOutView = document.getElementById('profile-logged-out-view');
    const displayNameEl = document.getElementById('profile-display-name');
    const displayEmailEl = document.getElementById('profile-display-email');
    const cardName = document.getElementById('card-name');
    const cardEmail = document.getElementById('card-email');
    const cardPhone = document.getElementById('card-phone');
    const cardAddress = document.getElementById('card-address');
    const editPhone = document.getElementById('edit-phone');
    const editAddress = document.getElementById('edit-address');
    const avatarInitials = document.getElementById('profile-avatar-initials');
    const avatarImg = document.getElementById('profile-avatar-img');

    if (user) {
        if (loggedInView) loggedInView.style.display = 'block';
        if (loggedOutView) loggedOutView.style.display = 'none';

        const name = user.displayName || user.email.split('@')[0];
        if (displayNameEl) displayNameEl.textContent = name;
        if (displayEmailEl) displayEmailEl.textContent = user.email || '';
        if (cardName) cardName.textContent = name;
        if (cardEmail) cardEmail.textContent = user.email || '';

        // Avatar
        if (user.photoURL && avatarImg) {
            avatarImg.src = user.photoURL;
            avatarImg.style.display = 'block';
            if (avatarInitials) avatarInitials.style.display = 'none';
        } else if (avatarInitials) {
            avatarInitials.textContent = name.charAt(0).toUpperCase();
            avatarInitials.style.display = 'inline';
            if (avatarImg) avatarImg.style.display = 'none';
        }

        // Load saved shipping preferences if available
        let savedProfile = {};
        try { savedProfile = JSON.parse(localStorage.getItem('sys_profile_' + user.uid)) || JSON.parse(localStorage.getItem('sys_profile')) || {}; } catch {}
        if (cardPhone) cardPhone.textContent = savedProfile.phone || 'Not specified';
        if (cardAddress) cardAddress.textContent = savedProfile.address || 'Provided during checkout';
        if (editPhone) editPhone.value = savedProfile.phone || '';
        if (editAddress) editAddress.value = savedProfile.address || '';
    } else {
        if (loggedInView) loggedInView.style.display = 'none';
        if (loggedOutView) loggedOutView.style.display = 'block';
    }
});

async function handleSignOut() {
    try {
        await signOut(auth);
    } catch (e) {
        console.error('Sign out error:', e);
    }
    localStorage.removeItem('sys_user');

    const statusEl = document.getElementById('profile-status');
    if (statusEl) {
        statusEl.textContent = 'You have signed out. Sign in anytime to access your account.';
        statusEl.style.color = 'var(--accent)';
    }
}

const profileSwitchBtn = document.getElementById('profile-switch-account-btn');
if (profileSwitchBtn) {
    profileSwitchBtn.addEventListener('click', async () => {
        await handleSignOut();
    });
}

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

// Shipping Preferences Edit Toggle
const editShippingBtn = document.getElementById('edit-shipping-btn');
const cancelShippingBtn = document.getElementById('cancel-shipping-btn');
const shippingDisplay = document.getElementById('shipping-display');
const shippingForm = document.getElementById('shipping-form');

editShippingBtn?.addEventListener('click', () => {
    shippingDisplay.style.display = 'none';
    shippingForm.style.display = 'flex';
});

cancelShippingBtn?.addEventListener('click', () => {
    shippingForm.style.display = 'none';
    shippingDisplay.style.display = 'flex';
});

shippingForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(shippingForm));
    const currentUser = auth.currentUser;
    const key = currentUser ? ('sys_profile_' + currentUser.uid) : 'sys_profile';
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem('sys_profile', JSON.stringify(data));

    const cardPhone = document.getElementById('card-phone');
    const cardAddress = document.getElementById('card-address');
    if (cardPhone) cardPhone.textContent = data.phone || 'Not specified';
    if (cardAddress) cardAddress.textContent = data.address || 'Provided during checkout';

    shippingForm.style.display = 'none';
    shippingDisplay.style.display = 'flex';

    const statusEl = document.getElementById('profile-status');
    if (statusEl) {
        statusEl.textContent = 'Shipping preferences updated.';
        statusEl.style.color = 'var(--accent)';
    }
});

document.getElementById('account-signout')?.addEventListener('click', async () => {
    await handleSignOut();
});

updateAccountCounts();

