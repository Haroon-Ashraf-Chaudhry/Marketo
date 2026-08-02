<div align="center">

# 🛍️ Marketo — Full-Stack MERN Multi-Vendor Marketplace

A production-grade multi-vendor e-commerce platform built with MongoDB, Express, React, and Node.js.

</div>

---

## ✨ Features

### 🛒 Buyers
- Browse products with full-text search, category filters, price range & sort
- Product detail with image gallery, ratings & reviews
- Persistent cart (localStorage)
- Stripe checkout with real PaymentIntents
- Order tracking with step-by-step progress
- Dispute resolution
- Real-time chat with vendors (Socket.io)

### 🏪 Vendors
- Product management (CRUD with multi-image upload)
- Order management with status updates & tracking numbers
- Analytics dashboard — revenue charts, top products, low-stock alerts
- Real-time notifications

### ⚙️ Admins
- Full dashboard — users, orders, revenue, top vendors
- Ban/unban users
- Dispute resolution
- Vendor performance stats (MongoDB Aggregation Pipeline)

### 🔐 Auth & Security
- JWT authentication (Bearer tokens)
- Role-based access control (buyer / vendor / admin)
- Bcrypt password hashing
- Password reset via email token
- Helmet, CORS, rate-limiting

---

## 🗂️ Project Structure

```
marketplace/
├── server/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          # User, Product, Order, Message
│   │   ├── controllers/     # Auth, Product, Order, Admin, Chat
│   │   ├── routes/
│   │   ├── middleware/       # Auth, errorHandler, upload
│   │   ├── sockets/         # Socket.io handler
│   │   └── utils/           # JWT, email
│   ├── uploads/             # Local image storage (swap for S3 in prod)
│   ├── seed.js
│   └── .env.example
│
└── client/                  # React frontend
    ├── src/
    │   ├── api/             # Axios instance + service functions
    │   ├── components/      # Navbar, Footer, ProductCard, ProtectedRoute
    │   ├── pages/           # buyer/, vendor/, admin/, auth/
    │   ├── store/           # Zustand (auth, cart)
    │   ├── hooks/           # useSocket (Socket.io context)
    │   └── styles/          # global.css
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Stripe account (test mode)

---

### 1. Clone & Install

```bash
# Server
cd server
cp .env.example .env
npm install

# Client
cd ../client
cp .env.example .env
npm install
```

---

### 2. Configure Environment Variables

**`server/.env`**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your_super_secret_key_here
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@marketo.com
```

**`client/.env`**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_STRIPE_PK=pk_test_xxxx
```

---

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
| Role   | Email                  | Password    |
|--------|------------------------|-------------|
| Admin  | admin@marketo.com      | password123 |
| Vendor | vendor@marketo.com     | password123 |
| Vendor | vendor2@marketo.com    | password123 |
| Buyer  | buyer@marketo.com      | password123 |

---

### 4. Run the App

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — React frontend
cd client && npm start
```

Open **http://localhost:3000**

---

## 💳 Stripe Test Cards

| Card Number         | Result   |
|---------------------|----------|
| 4242 4242 4242 4242 | Success  |
| 4000 0000 0000 9995 | Declined |

Use any future expiry date and any 3-digit CVC.

---

## 🌐 API Reference

### Auth
| Method | Endpoint                    | Access |
|--------|-----------------------------|--------|
| POST   | /api/auth/register          | Public |
| POST   | /api/auth/login             | Public |
| GET    | /api/auth/me                | Auth   |
| PUT    | /api/auth/me                | Auth   |
| POST   | /api/auth/forgot-password   | Public |
| POST   | /api/auth/reset-password/:token | Public |

### Products
| Method | Endpoint                      | Access        |
|--------|-------------------------------|---------------|
| GET    | /api/products                 | Public        |
| GET    | /api/products/:id             | Public        |
| GET    | /api/products/vendor/me       | Vendor        |
| POST   | /api/products                 | Vendor        |
| PUT    | /api/products/:id             | Vendor/Admin  |
| DELETE | /api/products/:id             | Vendor/Admin  |
| POST   | /api/products/:id/reviews     | Buyer         |

### Orders
| Method | Endpoint                    | Access        |
|--------|-----------------------------|---------------|
| POST   | /api/orders                 | Buyer         |
| GET    | /api/orders/my              | Buyer         |
| GET    | /api/orders/vendor          | Vendor        |
| GET    | /api/orders/:id             | Auth          |
| PATCH  | /api/orders/:id/status      | Vendor/Admin  |
| POST   | /api/orders/:id/dispute     | Buyer         |
| POST   | /api/orders/webhook         | Stripe        |

### Admin
| Method | Endpoint                        | Access |
|--------|---------------------------------|--------|
| GET    | /api/admin/dashboard            | Admin  |
| GET    | /api/admin/users                | Admin  |
| PATCH  | /api/admin/users/:id/toggle     | Admin  |
| GET    | /api/admin/orders               | Admin  |
| PATCH  | /api/admin/orders/:id/dispute   | Admin  |
| GET    | /api/admin/vendor-stats         | Admin  |

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6         |
| State     | Zustand (auth + cart)             |
| Data      | TanStack Query (server state)     |
| Forms     | React Hook Form ready             |
| Payments  | Stripe Elements + Webhooks        |
| Realtime  | Socket.io (chat + notifications)  |
| Backend   | Node.js + Express                 |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT + bcryptjs                    |
| Uploads   | Multer (local → swap for S3)      |
| Email     | Nodemailer (Mailtrap for dev)     |
| Security  | Helmet, CORS, express-validator   |

---

## 🚢 Deployment

| Service  | What to deploy     |
|----------|--------------------|
| Railway / Render | Express API server |
| Vercel   | React frontend     |
| MongoDB Atlas | Production DB  |
| AWS S3 / Cloudinary | File uploads |

Don't forget to set up Stripe webhooks pointing to your deployed API URL (`/api/orders/webhook`).

---

## 📁 Summary

- **Role-based auth** — 3 separate user types with middleware guards
- **Stripe split payments** — PaymentIntents + webhook confirmation
- **Real-time chat** — Socket.io with typing indicators & online status
- **MongoDB Aggregation** — vendor stats, revenue calculations
- **Full-text search** — MongoDB Atlas text indexes
- **Dispute resolution** — structured workflow with admin resolution

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Haroon Ashraf Chaudhry**

[![GitHub](https://img.shields.io/badge/GitHub-Haroon--Ashraf--Chaudhry-181717?style=flat-square&logo=github)](https://github.com/Haroon-Ashraf-Chaudhry)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/haroon-ashraf-chaudhry)

---

<div align="center">

⭐ **If you find this repository useful, please consider giving it a star!** ⭐

</div>
