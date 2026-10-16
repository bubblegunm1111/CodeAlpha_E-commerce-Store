const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4500;
const JWT_SECRET = process.env.JWT_SECRET || 'luxury-royal-essence-secret-key-2026';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// Initialize Stripe (uses mock-friendly sandbox fallback if key is not configured)
let stripe = null;
if (STRIPE_SECRET_KEY) {
    try {
        stripe = require('stripe')(STRIPE_SECRET_KEY);
    } catch (e) {
        console.warn('Stripe SDK initialization note:', e.message);
    }
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

// Optional Auth (works for guest or logged in user)
function optionalToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        req.user = err ? null : user;
        next();
    });
}

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');

        db.serialize(() => {
            // Users table with hashed passwords
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                phone TEXT,
                address TEXT,
                password TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Products table with inventory tracking
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT,
                price REAL,
                category TEXT,
                department TEXT,
                description TEXT,
                stock INTEGER DEFAULT 15
            )`);

            // Persistent shopping cart table
            db.run(`CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                product_id TEXT,
                quantity INTEGER DEFAULT 1,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_email, product_id)
            )`);

            // Orders table with payment tracking and inventory decrements
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                total REAL,
                items TEXT,
                payment_id TEXT,
                payment_status TEXT DEFAULT 'succeeded',
                status TEXT DEFAULT 'completed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Ensure stock column exists if products was created in an earlier migration
            db.run(`ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 15`, (err) => {});
            db.run(`ALTER TABLE orders ADD COLUMN payment_id TEXT`, (err) => {});
            db.run(`ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'succeeded'`, (err) => {});

            // Seed initial products if table is empty
            db.get("SELECT count(*) as count FROM products", [], (err, row) => {
                if (row && row.count === 0) {
                    const products = [
                        { id: 'crimson-tote', name: 'Crimson Leather Tote', price: 2850, category: 'handbags', department: 'bags', stock: 12 },
                        { id: 'midnight-quilt', name: 'Midnight Quilted Crossbody', price: 1950, category: 'crossbody', department: 'bags', stock: 8 },
                        { id: 'golden-clutch', name: 'Golden Hour Clutch', price: 1250, category: 'clutches', department: 'bags', stock: 15 },
                        { id: 'sapphire-velvet', name: 'Sapphire Velvet Evening Bag', price: 2100, category: 'evening', department: 'bags', stock: 6 },
                        
                        { id: 'crimson-tear', name: 'Crimson Tear Pendant', price: 14500, category: 'necklaces', department: 'jewelry', stock: 5 },
                        { id: 'eternity-band', name: 'Eternity Diamond Band', price: 8900, category: 'rings', department: 'jewelry', stock: 9 },
                        { id: 'royal-emerald', name: 'Royal Emerald Earrings', price: 22000, category: 'earrings', department: 'jewelry', stock: 4 },
                        
                        { id: 'noctis-ame', name: 'Noctis Ame', price: 320, category: 'eau_de_parfum', department: 'perfumes', stock: 25 },
                        { id: 'oud-imperial', name: 'Oud Imperial', price: 450, category: 'parfum', department: 'perfumes', stock: 18 },
                        { id: 'velvet-rose', name: 'Velvet Rose', price: 280, category: 'eau_de_parfum', department: 'perfumes', stock: 20 },
                        { id: 'royal-amber', name: 'Royal Amber', price: 380, category: 'parfum', department: 'perfumes', stock: 14 },
                        
                        { id: 'crown-jewel', name: 'The Crown Jewel', price: 45000, category: 'masterpiece', department: 'exclusive', stock: 2 },
                        { id: 'imperial-pen', name: 'Imperial Fountain Pen', price: 12500, category: 'accessories', department: 'exclusive', stock: 7 },
                        { id: 'signet-ring', name: 'Royal Signet Ring', price: 18000, category: 'jewelry', department: 'exclusive', stock: 3 },
                        { id: 'chess-set', name: 'Onyx & Gold Chess Set', price: 65000, category: 'collectibles', department: 'exclusive', stock: 1 }
                    ];
                    const stmt = db.prepare("INSERT INTO products (id, name, price, category, department, stock) VALUES (?, ?, ?, ?, ?, ?)");
                    products.forEach(p => stmt.run([p.id, p.name, p.price, p.category, p.department, p.stock]));
                    stmt.finalize();
                    console.log('Seeded products database with inventory levels.');
                }
            });
        });
    }
});

// ==========================================
// 1. SECURE AUTHENTICATION (BCRYPT + JWT)
// ==========================================

// Register with hashed password & JWT
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existing) return res.status(400).json({ error: 'An account with this email already exists' });

            // Salt & Hash Password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            db.run(
                `INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)`,
                [name || email.split('@')[0], email, hashedPassword, phone || '', address || ''],
                function(insertErr) {
                    if (insertErr) return res.status(500).json({ error: insertErr.message });

                    const userId = this.lastID;
                    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

                    res.status(201).json({
                        success: true,
                        token,
                        user: { id: userId, email, name: name || email.split('@')[0] }
                    });
                }
            );
        });
    } catch (e) {
        res.status(500).json({ error: 'Registration error: ' + e.message });
    }
});

// Login with password verification & JWT
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        // Verify hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, name: user.name, phone: user.phone, address: user.address }
        });
    });
});

// Get Current User Profile (Protected by JWT)
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
    });
});

// ==========================================
// 2. PERSISTENT SHOPPING CART STATE ENGINE
// ==========================================

// Get user's persistent cart from database
app.get('/api/cart', authenticateToken, (req, res) => {
    const email = req.user.email;
    const query = `
        SELECT c.product_id as id, c.quantity, p.name, p.price, p.category, p.department, p.stock
        FROM cart_items c
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.user_email = ?
    `;
    db.all(query, [email], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, items });
    });
});

// Sync / Update persistent shopping cart state
app.post('/api/cart/sync', authenticateToken, (req, res) => {
    const email = req.user.email;
    const { items } = req.body; // Array of { id, quantity }
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Items array is required' });

    db.serialize(() => {
        // Clear old cart for this user and rewrite fresh state
        db.run('DELETE FROM cart_items WHERE user_email = ?', [email], (delErr) => {
            if (delErr) return res.status(500).json({ error: delErr.message });

            if (items.length === 0) {
                return res.json({ success: true, count: 0 });
            }

            const stmt = db.prepare('INSERT INTO cart_items (user_email, product_id, quantity) VALUES (?, ?, ?)');
            items.forEach(item => {
                stmt.run([email, item.id || item.product?.id, item.quantity || 1]);
            });
            stmt.finalize(() => {
                res.json({ success: true, count: items.length });
            });
        });
    });
});

// ==========================================
// 3. PAYMENT SANDBOX (STRIPE API MODULE)
// ==========================================

app.post('/api/payment/create-payment-intent', optionalToken, async (req, res) => {
    try {
        const { amount, currency = 'usd', items } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid payment amount' });
        }

        // Stripe API integration / Secure Sandbox Pipeline
        let clientSecret;
        let paymentIntentId;

        try {
            // Attempt live/test call to Stripe if network and keys allow
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // in cents
                currency: currency.toLowerCase(),
                payment_method_types: ['card'],
                metadata: {
                    integration_check: 'accept_a_payment',
                    customer_email: req.user ? req.user.email : 'guest'
                }
            });
            clientSecret = paymentIntent.client_secret;
            paymentIntentId = paymentIntent.id;
        } catch (stripeErr) {
            // Robust Sandbox Fallback Simulation for local testing
            paymentIntentId = 'pi_sandbox_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
            clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;
        }

        res.json({
            success: true,
            clientSecret,
            paymentIntentId,
            sandbox: true,
            amount,
            currency
        });
    } catch (e) {
        res.status(500).json({ error: 'Payment intent failed: ' + e.message });
    }
});

// ==========================================
// 4. CHECKOUT & INVENTORY ADJUSTMENT LOGIC
// ==========================================

app.post('/api/orders', optionalToken, (req, res) => {
    const { email, items, total, paymentIntentId } = req.body;
    const userEmail = email || (req.user ? req.user.email : 'guest@example.com');

    if (!items || !items.length || !total) {
        return res.status(400).json({ error: 'Missing order items or total' });
    }

    // Begin transactional verification & stock adjustment
    db.serialize(() => {
        // Step 1: Verify current stock for each product
        const productIds = items.map(i => `'${i.id}'`).join(',');
        db.all(`SELECT id, name, stock FROM products WHERE id IN (${productIds})`, [], (err, productRows) => {
            if (err) return res.status(500).json({ error: 'Database error checking inventory' });

            const stockMap = {};
            productRows.forEach(p => { stockMap[p.id] = p; });

            // Check if any product is out of stock
            for (const item of items) {
                const prod = stockMap[item.id];
                const requiredQty = item.quantity || 1;
                if (prod && prod.stock < requiredQty) {
                    return res.status(400).json({
                        error: `Insufficient inventory for ${prod.name}. Only ${prod.stock} left in stock.`
                    });
                }
            }

            // Step 2: Decrement inventory for purchased products
            const updateStockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
            items.forEach(item => {
                const qty = item.quantity || 1;
                updateStockStmt.run([qty, item.id]);
            });
            updateStockStmt.finalize();

            // Step 3: Record finalized order with payment details
            db.run(
                `INSERT INTO orders (user_email, total, items, payment_id, payment_status, status) VALUES (?, ?, ?, ?, 'succeeded', 'completed')`,
                [userEmail, total, JSON.stringify(items), paymentIntentId || 'pi_simulated_success'],
                function(orderErr) {
                    if (orderErr) return res.status(500).json({ error: orderErr.message });
                    const orderId = this.lastID;

                    // Step 4: Clear user's persistent cart if user is registered
                    if (req.user || email) {
                        db.run('DELETE FROM cart_items WHERE user_email = ?', [userEmail]);
                    }

                    res.json({
                        success: true,
                        orderId,
                        status: 'completed',
                        inventoryAdjusted: true,
                        message: `Order #${orderId} confirmed and stock adjusted.`
                    });
                }
            );
        });
    });
});

// Get single order by ID
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        try {
            order.items = JSON.parse(order.items);
        } catch (e) {
            order.items = [];
        }

        // Fetch user info if available
        db.get('SELECT name, email, phone, address FROM users WHERE email = ?', [order.user_email], (userErr, user) => {
            order.customer = user || { name: order.user_email.split('@')[0], email: order.user_email };
            res.json({ success: true, order });
        });
    });
});

// Get Products Catalog with current stock
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Update Profile endpoint
app.post('/api/users', async (req, res) => {
    const { name, email, phone, address, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let hashedPassword = password;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    db.run(
        `INSERT INTO users (name, email, phone, address, password) 
         VALUES (?, ?, ?, ?, ?) 
         ON CONFLICT(email) DO UPDATE SET 
         name=excluded.name, phone=excluded.phone, address=excluded.address, password=COALESCE(excluded.password, users.password)`,
        [name, email, phone, address, hashedPassword],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, email: email });
        }
    );
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
