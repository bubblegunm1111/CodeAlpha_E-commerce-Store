const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 4500;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                phone TEXT,
                address TEXT,
                password TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT,
                price REAL,
                category TEXT,
                department TEXT,
                description TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT,
                total REAL,
                items TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Seed initial products if table is empty
            db.get("SELECT count(*) as count FROM products", [], (err, row) => {
                if (row && row.count === 0) {
                    const products = [
                        { id: 'crimson-tote', name: 'Crimson Leather Tote', price: 2850, category: 'handbags', department: 'bags' },
                        { id: 'midnight-quilt', name: 'Midnight Quilted Crossbody', price: 1950, category: 'crossbody', department: 'bags' },
                        { id: 'golden-clutch', name: 'Golden Hour Clutch', price: 1250, category: 'clutches', department: 'bags' },
                        { id: 'sapphire-velvet', name: 'Sapphire Velvet Evening Bag', price: 2100, category: 'evening', department: 'bags' },
                        
                        { id: 'crimson-tear', name: 'Crimson Tear Pendant', price: 14500, category: 'necklaces', department: 'jewelry' },
                        { id: 'eternity-band', name: 'Eternity Diamond Band', price: 8900, category: 'rings', department: 'jewelry' },
                        { id: 'royal-emerald', name: 'Royal Emerald Earrings', price: 22000, category: 'earrings', department: 'jewelry' },
                        
                        { id: 'noctis-ame', name: 'Noctis Ame', price: 320, category: 'eau_de_parfum', department: 'perfumes' },
                        { id: 'oud-imperial', name: 'Oud Imperial', price: 450, category: 'parfum', department: 'perfumes' },
                        { id: 'velvet-rose', name: 'Velvet Rose', price: 280, category: 'eau_de_parfum', department: 'perfumes' },
                        { id: 'royal-amber', name: 'Royal Amber', price: 380, category: 'parfum', department: 'perfumes' },
                        
                        { id: 'crown-jewel', name: 'The Crown Jewel', price: 45000, category: 'masterpiece', department: 'exclusive' },
                        { id: 'imperial-pen', name: 'Imperial Fountain Pen', price: 12500, category: 'accessories', department: 'exclusive' },
                        { id: 'signet-ring', name: 'Royal Signet Ring', price: 18000, category: 'jewelry', department: 'exclusive' },
                        { id: 'chess-set', name: 'Onyx & Gold Chess Set', price: 65000, category: 'collectibles', department: 'exclusive' }
                    ];
                    const stmt = db.prepare("INSERT INTO products (id, name, price, category, department) VALUES (?, ?, ?, ?, ?)");
                    products.forEach(p => stmt.run([p.id, p.name, p.price, p.category, p.department]));
                    stmt.finalize();
                    console.log('Seeded products database');
                }
            });
        });
    }
});

// APIs

// Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// User Registration/Update Profile
app.post('/api/users', (req, res) => {
    const { name, email, phone, address, password } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    db.run(
        `INSERT INTO users (name, email, phone, address, password) 
         VALUES (?, ?, ?, ?, ?) 
         ON CONFLICT(email) DO UPDATE SET 
         name=excluded.name, phone=excluded.phone, address=excluded.address, password=excluded.password`,
        [name, email, phone, address, password],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, email: email });
        }
    );
});

// Create Order
app.post('/api/orders', (req, res) => {
    const { email, items, total } = req.body;
    if (!email || !items || !total) return res.status(400).json({ error: "Missing order details" });
    
    db.run(
        `INSERT INTO orders (user_email, total, items) VALUES (?, ?, ?)`,
        [email, total, JSON.stringify(items)],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, orderId: this.lastID });
        }
    );
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
