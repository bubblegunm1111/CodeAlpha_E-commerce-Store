# SYS | Royal Essence — Luxury E-Commerce Platform

Live Preview: https://code-alpha-e-commerce-store-mu.vercel.app/

A full-stack luxury e-commerce web application designed with a bespoke royal burgundy and gold visual identity. Built from scratch with vanilla frontend web technologies, an Express.js backend, SQLite database persistence, secure JWT and bcrypt authentication, a persistent shopping cart state engine, Stripe sandbox checkout, and backend inventory tracking.

---

## Features

### Storefront & Catalog
- **Collections:** Dedicated catalogs for Handbags, Fine Jewelry, Perfumes, and Exclusive Royal Vault pieces.
- **Product Details:** Rich product specifications, interactive gallery, real-time wishlist toggling, and related items.
- **Responsive Layout:** Tailored typography with Google Fonts, custom CSS variables, and fluid mobile/desktop navigation.

### Authentication & User Management
- **Google Sign-In:** 1-click authentication using Google Firebase Client SDK.
- **Email & Password Registration:** Client-side input validation and error feedback.
- **JWT & Password Hashing:** Backend encryption using `bcryptjs` for secure password storage in SQLite and signed JSON Web Tokens for API requests.

### Shopping Cart & Inventory
- **Persistent State Engine:** Multi-device cart persistence syncing client state with the backend `cart_items` table.
- **Inventory Protection:** Dynamic stock verification before payment and transaction-safe stock decrements upon order completion.

### Checkout & Payment
- **Stripe Sandbox Pipeline:** Payment intent generation via the Stripe API with sandbox fallback testing.
- **Interactive Credit Card:** Dynamic card preview that updates in real time with the cardholder's input.
- **Order Confirmation:** Dedicated post-checkout receipt page (`confirmation.html`) displaying order number, transaction ID, and itemized totals.

---

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** Firebase Auth SDK, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Payment Processing:** Stripe API (Sandbox)
- **Deployment:** Vercel

---

## Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Run the application
```bash
npm start
```
Open your browser and navigate to `http://localhost:4500`.

---

## Project Structure

```
├── public/                     # Frontend client files
│   ├── index.html              # Main storefront home
│   ├── bags.html               # Handbags collection
│   ├── jewelry.html            # Fine jewelry collection
│   ├── perfumes.html           # Fragrances collection
│   ├── exclusive.html          # Exclusive vault collection
│   ├── product.html            # Product detail & auth modal
│   ├── cart.html               # Cart & checkout
│   ├── confirmation.html       # Order confirmation receipt
│   ├── profile.html            # User account settings
│   ├── favorites.html          # Saved wishlist items
│   ├── story.html              # Brand heritage page
│   ├── style.css               # Main styling rules
│   └── js/                     # Client scripts & Firebase config
├── server.js                   # Express server, SQLite & REST API routes
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Project dependencies
└── .gitignore                  # Git ignore rules
```

---

## Author

Developed by **Shahd Yousry** for the CodeAlpha Web Development Internship.
