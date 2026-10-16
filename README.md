# 👑 SYS | Royal Essence — Luxury E-Commerce Platform

> **Live Deployment:** [https://code-alpha-e-commerce-store-mu.vercel.app/](https://code-alpha-e-commerce-store-mu.vercel.app/)

A full-stack, high-end luxury e-commerce platform crafted with rich dark aesthetics, velvet burgundy textures, and royal gold accents. Features real-time Firebase authentication, secure JWT and bcrypt user management, a persistent multi-device shopping cart state engine, Stripe sandbox payment processing, and transaction-safe backend inventory adjustments.

---

## 🌟 Key Features

### 🛍️ Luxury Storefront & Experience
- **Curated Collections:** Handbags & Leather Goods, Fine Jewelry, Haute Perfumery, and The Royal Vault (Exclusive masterpieces).
- **Interactive Product Showcase:** High-resolution product zooms, luxury specifications tables, related recommendations, and instant wishlist toggles.
- **Micro-Animations & Visual Excellence:** Velvet burgundy ambient backdrop, gold shimmer states, smooth accordion transitions, and interactive 3D card tilt.

### 🔐 Multi-Tier Authentication & Security
- **Google 1-Click Sign-In:** Integrated Google Firebase Auth popup for frictionless access.
- **Email & Password Authentication:** Powered by Firebase client SDK with real-time field validation and friendly error handling.
- **Secure Backend API (JWT + Bcrypt):**
  - Passwords salted and hashed with `bcryptjs` before SQLite persistence (no plaintext credentials).
  - Cryptographically signed JSON Web Tokens (JWT) issued with 7-day expiration.
  - Protected endpoints guarded via `authenticateToken` HTTP Authorization headers.

### 🛒 Persistent Shopping Cart State Engine
- **Cross-Device Persistence:** Synchronizes guest localStorage with the remote SQLite database (`cart_items` table).
- **Real-Time Header Badges:** Reactive cart counter and wishlist tracker updated across all collection routes.

### 💳 Stripe Sandbox Payment Pipeline
- **Secure Payment Authorization:** Backend integration utilizing the official Stripe SDK (`POST /api/payment/create-payment-intent`).
- **Interactive Credit Card Interface:** Dynamic live card preview displaying cardholder name, masked card number, and expiration date in real time.
- **Sandbox Test Fallback:** Seamless simulation pipeline for rapid local testing and development.

### 📦 Transaction-Safe Inventory Decrement
- **Real-Time Stock Checking:** Verifies stock availability for every cart item before order confirmation.
- **Atomic Stock Adjustments:** Automatically decrements stock levels (`UPDATE products SET stock = stock - ? WHERE id = ?`).
- **Out-of-Stock Protection:** Rejects orders with clear notifications if item quantity exceeds available stock.

### 📜 Order Confirmation & Digital Receipt
- **Pulsing Gold Seal:** Confirmation badge after successful payment.
- **Dynamic Receipt Breakdown:** Full itemized breakdown, customer details, Stripe Payment Intent reference, subtotal, and complimentary insured courier notes.
- **REST Order Endpoint:** `GET /api/orders/:id` for historical order lookups.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Vanilla HTML5, Modern CSS3 (Custom Design System, Glassmorphism), Vanilla ES Modules |
| **Authentication** | Google Firebase Authentication (Client SDK v10), JWT (`jsonwebtoken`) |
| **Backend** | Node.js, Express.js |
| **Security** | `bcryptjs` (Password Hashing), Signed Bearer Tokens |
| **Database** | SQLite3 (Persistent local storage & serverless fallback) |
| **Payments** | Stripe API Sandbox Pipeline |
| **Hosting & CI/CD** | Vercel (Edge CDN & Serverless Node.js Functions) |

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/bubblegunm1111/CodeAlpha_E-commerce-Store.git
cd CodeAlpha_E-commerce-Store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm start
```
The application will launch at [http://localhost:4500](http://localhost:4500).

---

## 📂 Project Architecture

```
CodeAlpha_E-commerce-Store/
├── public/                     # Static frontend client assets
│   ├── index.html              # Main landing & hero showcase
│   ├── bags.html               # Luxury bags catalog
│   ├── jewelry.html            # Fine jewelry catalog
│   ├── perfumes.html           # Fragrance catalog
│   ├── exclusive.html          # Royal Vault exclusive collection
│   ├── product.html            # Product detail view & auth modal
│   ├── cart.html               # Cart & 3D luxury payment checkout
│   ├── confirmation.html       # Order receipt & confirmation page
│   ├── profile.html            # User account & linked profiles
│   ├── favorites.html          # Wishlist collection
│   ├── story.html              # Brand heritage & craftsmanship
│   ├── style.css               # Central luxury design tokens & styles
│   ├── js/
│   │   ├── firebase-config.js  # Firebase SDK configuration
│   │   ├── product.js          # Product details & auth gate logic
│   │   ├── cart.js             # Cart management & payment flow
│   │   ├── account.js          # Profile & Google account connection
│   │   └── db.js               # Frontend product catalog database
│   └── images/                 # Product photography & texture assets
├── server.js                   # Express server, SQLite DB & REST APIs
├── vercel.json                 # Vercel serverless routing configuration
├── package.json                # Project dependencies and scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
