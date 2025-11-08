# Payment Service

Microservice for payment processing and gateway integration.

## Features

- ✅ Stripe integration for card and ACH payments
- ✅ Payment validation
- ✅ Refund processing
- ✅ Payment intent creation
- ✅ Support for offline payments (cash, check)
- ✅ Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the service:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Process Payment
```
POST /api/v1/payments/process
Body: {
  "borrowerId": "borrower123",
  "amount": 1500.00,
  "currency": "usd",
  "paymentMethod": "card", // or "ach", "cash", "check"
  "paymentMethodId": "pm_1234567890", // required for card/ACH
  "description": "Loan payment",
  "metadata": {
    "loanId": "loan123"
  }
}
```

### Validate Payment
```
POST /api/v1/payments/validate
Body: {
  "borrowerId": "borrower123",
  "amount": 1500.00,
  "dueAmount": 1500.00,
  "paymentDate": "2024-12-31" // optional
}
```

### Process Refund
```
POST /api/v1/payments/refund
Body: {
  "paymentId": "pi_1234567890",
  "amount": 500.00, // optional for partial refund
  "reason": "requested_by_customer" // optional
}
```

### Create Payment Intent
```
POST /api/v1/payments/create-intent
Body: {
  "amount": 1500.00,
  "currency": "usd",
  "borrowerId": "borrower123",
  "metadata": {
    "loanId": "loan123"
  }
}
```

### Get Payment
```
GET /api/v1/payments/:paymentId
```

## Environment Variables

- `PORT` - Server port (default: 3002)
- `STRIPE_SECRET_KEY` - Stripe secret key (required for Stripe payments)

## Payment Methods

### Card/ACH (Stripe)
- Requires `paymentMethodId` from Stripe
- Supports credit cards, debit cards, and ACH transfers
- Real-time processing

### Cash/Check (Offline)
- No gateway integration required
- Payment is recorded immediately
- Manual reconciliation required

## Integration with Next.js App

Update your payment processing to call this service:

```typescript
const response = await fetch('http://localhost:3002/api/v1/payments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    borrowerId: 'borrower123',
    amount: 1500.00,
    paymentMethod: 'card',
    paymentMethodId: 'pm_1234567890',
  }),
});
```



