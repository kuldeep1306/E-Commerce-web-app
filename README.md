# Shopwave — Full Stack E-commerce Store

React + Node.js + Express + MongoDB e-commerce app with JWT authentication,
Razorpay payments, and a full admin panel.

## What's included

- **Storefront**: product browsing, search, category/price filters, cart, checkout, order history, reviews
- **Auth**: JWT-based register/login, protected routes, role-based access (user/admin)
- **Payments**: Razorpay integration (order creation + signature verification)
- **Admin panel**: dashboard with sales analytics, full CRUD for products, order status management, user management
- **Mobile-friendly**: fully responsive, works down to small phone screens

## Tech stack

| Layer    | Stack |
|----------|-------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios |
| Backend  | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt |
| Payments | Razorpay |

---

## 1. Prerequisites

- Node.js 18+ installed
- A MongoDB database — either:
  - Local MongoDB (`mongodb://127.0.0.1:27017`), or
  - Free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- A Razorpay account — sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com/signup) and grab your **Test Mode** API keys from Settings → API Keys

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce        # or your Atlas URI
JWT_SECRET=some_long_random_string                     # any long random string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx                  # from Razorpay dashboard
RAZORPAY_KEY_SECRET=your_key_secret                    # from Razorpay dashboard
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com                          # auto-creates this admin on first run
ADMIN_PASSWORD=Admin@12345
```

Start the server:

```bash
npm run dev        # uses nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000`. On first run it automatically creates
an admin account using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` —
use these to log in to `/admin`.

### (Optional) Seed sample products

```bash
node seed/seedProducts.js
```

This wipes and repopulates the `products` collection with 6 sample items so
you have something to browse immediately.

## 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx    # same key ID as backend
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`.

## 4. Testing a payment (Razorpay test mode)

Razorpay test mode never charges real money. Use these test card details at checkout:

- Card number: `4111 1111 1111 1111`
- Expiry: any future date
- CVV: any 3 digits
- OTP (if prompted): `1234` / `123456`

For UPI test payments, use `success@razorpay` as the UPI ID.

## 5. Going to production

- Set `NODE_ENV=production` in the backend `.env`
- Switch Razorpay keys from test (`rzp_test_...`) to live (`rzp_live_...`) once your Razorpay account is activated for live payments
- Update `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) to your real domains
- Deploy backend to any Node host (Render, Railway, a VPS, etc.) and frontend as a static build:
  ```bash
  cd frontend && npm run build
  ```
  This outputs a `dist/` folder you can deploy to Vercel, Netlify, or any static host.
- Use a managed MongoDB (Atlas) in production, and restrict its network access to your server's IP
- Never commit your `.env` files — they're already in `.gitignore`

## Project structure

```
ecommerce-app/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/      # Route logic
│   ├── middleware/        # Auth guards, error handling
│   ├── models/            # Mongoose schemas (User, Product, Order)
│   ├── routes/             # Express routers
│   ├── seed/               # Sample data script
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # Axios instance
        ├── components/     # Navbar, ProductCard, route guards, etc.
        ├── context/         # Auth + Cart state
        └── pages/
            ├── admin/       # Dashboard, product/order/user management
            └── *.jsx        # Storefront pages
```

## Notes on security

- Passwords are hashed with bcrypt, never stored in plain text
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRE`)
- Razorpay payment signatures are verified server-side using HMAC-SHA256 before an order is marked paid — the frontend can never fake a successful payment
- Product prices are always re-validated server-side from the database at order time, never trusted from the client
- Basic rate limiting is applied to login/register endpoints
