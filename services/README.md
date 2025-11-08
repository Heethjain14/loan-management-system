# Microservices

This directory contains microservices for the Loan Management System.

## Services

### 1. Notification Service (Port 3001)
Handles email, SMS, and push notifications with async processing.

**Features:**
- Email via SendGrid
- SMS via Twilio
- Async processing with Redis/Bull
- Payment reminder templates

**Documentation:** [notification-service/README.md](./notification-service/README.md)

### 2. Payment Service (Port 3002)
Handles payment processing and gateway integration.

**Features:**
- Stripe integration
- Payment validation
- Refund processing
- Support for multiple payment methods

**Documentation:** [payment-service/README.md](./payment-service/README.md)

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose (optional)
- Redis (for notification service async processing)

### Option 1: Docker Compose (Recommended)

1. Create a `.env` file in the `services` directory:
```env
SENDGRID_API_KEY=your_key
FROM_EMAIL=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
STRIPE_SECRET_KEY=sk_test_your_key
```

2. Start all services:
```bash
cd services
docker-compose up -d
```

3. Services will be available at:
- Notification Service: http://localhost:3001
- Payment Service: http://localhost:3002
- Redis: localhost:6379

### Option 2: Manual Setup

#### Notification Service
```bash
cd services/notification-service
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

#### Payment Service
```bash
cd services/payment-service
npm install
cp src/env.example.txt .env
# Edit .env with your Stripe key
npm run dev
```

#### Redis (for Notification Service)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
```

## Integration with Next.js App

The Next.js app has been updated to use these microservices via utility functions in `src/app/utils/microservices.ts`.

### Environment Variables (Next.js)

Add to your `.env.local`:
```env
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3002
```

### Usage Examples

#### Send Email
```typescript
import { sendEmailNotification } from '@/app/utils/microservices';

await sendEmailNotification({
  to: 'user@example.com',
  subject: 'Test',
  body: 'Hello!',
});
```

#### Send Payment Reminder
```typescript
import { sendPaymentReminder } from '@/app/utils/microservices';

await sendPaymentReminder({
  borrowerName: 'John Doe',
  borrowerEmail: 'john@example.com',
  dueAmount: 1500.00,
  dueDate: '2024-12-31',
});
```

#### Process Payment
```typescript
import { processPayment } from '@/app/utils/microservices';

await processPayment({
  borrowerId: 'borrower123',
  amount: 1500.00,
  paymentMethod: 'card',
  paymentMethodId: 'pm_1234567890',
});
```

## Health Checks

Check service health:
```bash
# Notification Service
curl http://localhost:3001/health

# Payment Service
curl http://localhost:3002/health
```

## Development

### Running Services Locally

Each service can be run independently:

```bash
# Terminal 1 - Notification Service
cd services/notification-service
npm run dev

# Terminal 2 - Payment Service
cd services/payment-service
npm run dev

# Terminal 3 - Redis (if not using Docker)
redis-server
```

### Testing

Each service has its own test suite:
```bash
cd services/notification-service
npm test

cd services/payment-service
npm test
```

## Production Deployment

### Environment Variables

Ensure all required environment variables are set:
- Notification Service: SENDGRID_API_KEY, FROM_EMAIL, REDIS_HOST, etc.
- Payment Service: STRIPE_SECRET_KEY

### Docker Deployment

Build and push images:
```bash
docker build -t notification-service:latest ./notification-service
docker build -t payment-service:latest ./payment-service
```

### Kubernetes (Optional)

Services can be deployed to Kubernetes with proper service discovery and load balancing.

## Architecture

```
Next.js App
    │
    ├───> Notification Service (Port 3001)
    │       ├───> SendGrid (Email)
    │       ├───> Twilio (SMS)
    │       └───> Redis Queue (Async)
    │
    └───> Payment Service (Port 3002)
            └───> Stripe API
```

## Next Steps

1. Add database persistence for notification history
2. Add authentication/authorization between services
3. Implement service discovery
4. Add monitoring and logging
5. Set up CI/CD pipelines



