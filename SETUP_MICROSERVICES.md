# Microservices Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install dependencies for Notification Service
cd services/notification-service
npm install

# Install dependencies for Payment Service
cd ../payment-service
npm install
```

### 2. Configure Environment Variables

#### Notification Service
Create `services/notification-service/.env`:
```env
PORT=3001
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_token (optional)
TWILIO_PHONE_NUMBER=+1234567890 (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Payment Service
Create `services/payment-service/.env`:
```env
PORT=3002
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

#### Next.js App
Add to your `.env.local`:
```env
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3002
```

### 3. Start Redis (Required for Notification Service)

**Option A: Docker (Recommended)**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option B: Local Installation**
- macOS: `brew install redis && brew services start redis`
- Linux: `sudo apt-get install redis-server && sudo systemctl start redis`
- Windows: Download from https://redis.io/download

### 4. Start Services

**Terminal 1 - Notification Service:**
```bash
cd services/notification-service
npm run dev
```

**Terminal 2 - Payment Service:**
```bash
cd services/payment-service
npm run dev
```

**Terminal 3 - Next.js App:**
```bash
npm run dev
```

### 5. Verify Services

```bash
# Check Notification Service
curl http://localhost:3001/health

# Check Payment Service
curl http://localhost:3002/health
```

## Docker Compose (Alternative)

If you prefer Docker:

```bash
cd services
# Create .env file with all credentials
docker-compose up -d
```

## Testing the Integration

### Test Email Notification
```bash
curl -X POST http://localhost:3001/api/v1/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email"
  }'
```

### Test Payment Reminder
```bash
curl -X POST http://localhost:3001/api/v1/notifications/payment-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "borrowerName": "John Doe",
    "borrowerEmail": "john@example.com",
    "dueAmount": 1500.00,
    "dueDate": "2024-12-31",
    "sendEmail": true
  }'
```

### Test Payment Validation
```bash
curl -X POST http://localhost:3002/api/v1/payments/validate \
  -H "Content-Type: application/json" \
  -d '{
    "borrowerId": "borrower123",
    "amount": 1500.00,
    "dueAmount": 1500.00
  }'
```

## Troubleshooting

### Notification Service not starting
- Check Redis is running: `redis-cli ping` (should return `PONG`)
- Verify SendGrid API key is set
- Check port 3001 is not in use

### Payment Service not starting
- Verify Stripe secret key is set
- Check port 3002 is not in use

### Services can't communicate
- Ensure services are running on correct ports
- Check firewall settings
- Verify environment variables in Next.js app

## Production Deployment

1. Build services:
```bash
cd services/notification-service && npm run build
cd ../payment-service && npm run build
```

2. Set production environment variables

3. Use process manager (PM2, systemd, etc.):
```bash
pm2 start dist/index.js --name notification-service
pm2 start dist/index.js --name payment-service
```

4. Or use Docker containers in production

## Next Steps

- [ ] Add authentication between services
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Add logging (ELK stack)
- [ ] Implement service discovery
- [ ] Add database for notification history
- [ ] Set up CI/CD pipelines



