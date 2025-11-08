# Notification Service

Microservice for handling notifications (email, SMS, push notifications).

## Features

- ✅ Email notifications via SendGrid
- ✅ SMS notifications via Twilio
- ✅ Async processing with Redis/Bull queue
- ✅ Payment reminder templates
- ✅ Retry logic for failed notifications
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

3. Start Redis (required for async processing):
```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
```

4. Run the service:
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

### Send Email (Synchronous)
```
POST /api/v1/notifications/email
Body: {
  "to": "user@example.com",
  "subject": "Test Email",
  "body": "Email content",
  "html": "<p>HTML content</p>" // optional
}
```

### Send Email (Asynchronous)
```
POST /api/v1/notifications/email/async
Body: {
  "to": "user@example.com",
  "subject": "Test Email",
  "body": "Email content"
}
```

### Send SMS (Synchronous)
```
POST /api/v1/notifications/sms
Body: {
  "to": "+1234567890",
  "message": "SMS message"
}
```

### Send SMS (Asynchronous)
```
POST /api/v1/notifications/sms/async
Body: {
  "to": "+1234567890",
  "message": "SMS message"
}
```

### Send Payment Reminder
```
POST /api/v1/notifications/payment-reminder
Body: {
  "borrowerName": "John Doe",
  "borrowerEmail": "john@example.com",
  "borrowerPhone": "+1234567890", // optional
  "dueAmount": 1500.00,
  "dueDate": "2024-12-31",
  "sendEmail": true,
  "sendSMS": false
}
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `SENDGRID_API_KEY` - SendGrid API key (required for email)
- `FROM_EMAIL` - Default sender email
- `TWILIO_ACCOUNT_SID` - Twilio account SID (optional)
- `TWILIO_AUTH_TOKEN` - Twilio auth token (optional)
- `TWILIO_PHONE_NUMBER` - Twilio phone number (optional)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)



