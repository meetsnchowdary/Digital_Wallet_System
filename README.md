# Digital_Wallet_System
A secure, modular, and production-ready backend for a digital wallet platform, built with **Node.js**, **Express**, and **MongoDB**.  
Supports user authentication, wallet operations, transaction processing, fraud detection, admin analytics, and more.

## 🚀 Features

- **User Authentication:** Register, login, JWT-based session management
- **Wallet Operations:** Deposit, withdraw, transfer funds, multi-currency support
- **Transaction History:** Per-user records, soft deletion
- **Atomic Transaction Processing:** Secure, reliable fund transfers
- **Basic Fraud Detection:** Rate limits, rule-based anomaly detection, daily scheduled scans
- **Mock Email Alerts:** For suspicious transactions
- **Admin APIs:** View flagged transactions, aggregate balances, top users
- **OpenAPI (Swagger) Docs:** Interactive API documentation at `/api-docs`

---

## 🗂️ Project Structure

```
wallet-system/
│
├── models/          # Mongoose data models (User, Wallet, Transaction)
├── middleware/      # Authentication, rate limiting
├── routes/          # Express route handlers (auth, wallet, transaction, admin)
├── utils/           # Fraud detection, mock mailer
├── jobs/            # Scheduled fraud scan job
├── app.js           # Main app entrypoint
├── swagger.json     # OpenAPI documentation
├── .env             # Environment variables
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. **Install Dependencies**

```bash
npm install
```

### 2. **Configure Environment Variables**

Create a `.env` file in the project root:

```
PORT=5050
MONGO_URI=mongodb://localhost:27017/wallet-system
JWT_SECRET=your_jwt_secret
```

- For MongoDB Atlas, use your connection string for `MONGO_URI`.

### 4. **Start MongoDB**

- **Locally:**  
  ```bash
  mongod
  ```
- **Atlas:**  
  No local process needed.

### 5. **Run the Server**

```bash
npm start
```

The server runs on [http://localhost:5050](http://localhost:5050).

---

## 📖 API Documentation

Interactive docs available at:  
[http://localhost:5050/api-docs](http://localhost:5050/api-docs)

- All endpoints, request/response formats, and schemas are documented via Swagger/OpenAPI.

---

## 🧑‍💻 Usage Examples

### Register a User

```bash
curl -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

### Login

```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

### Deposit Funds

```bash
curl -X POST http://localhost:5050/api/transaction/deposit \
  -H "Authorization: Bearer " \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"USD"}'
```

### Transfer Funds

```bash
curl -X POST http://localhost:5050/api/transaction/transfer \
  -H "Authorization: Bearer " \
  -H "Content-Type: application/json" \
  -d '{"toEmail":"bob@example.com","amount":50,"currency":"USD"}'
```

---

## 🔒 Security & Fraud Detection

- **Password Hashing:** bcrypt
- **JWT Authentication:** All sensitive endpoints protected
- **Rate Limiting:** Per-user, per-minute
- **Fraud Detection:**  
  - Rule-based checks (e.g., rapid transfers, large withdrawals)
  - Suspicious transactions flagged and logged
  - **Daily scheduled scan** (via `node-cron`)
  - **Mock email alerts** for flagged activity

---

## 🛠️ Admin & Reporting APIs

- `/api/admin/flagged` – List flagged transactions (admin only)
- `/api/admin/aggregate` – Aggregate total balances by currency (admin only)
- `/api/admin/top-users` – List top users by balance (admin only)

To make a user admin, set `isAdmin: true` in the user document.

---

## 🧹 Soft Delete

- Users and transactions can be soft-deleted (not removed from DB).
- All queries automatically filter out soft-deleted records.

---

## 🧑‍🔬 Testing

- Use Swagger UI or Postman to test all endpoints.
- See terminal logs for scheduled fraud scan and mock email alerts.
