# Design of Tests

## 1. Test Strategy

### 1.1 Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │  (Cypress)  │
                    └─────────────┘
                  ┌─────────────────┐
                  │ Integration     │  (30%)
                  │ Tests           │
                  │ (API, Services) │
                  └─────────────────┘
            ┌─────────────────────────────┐
            │      Unit Tests             │  (60%)
            │  (Components, Functions)    │
            └─────────────────────────────┘
```

### 1.2 Test Types

1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: API endpoints and service interactions
3. **End-to-End Tests**: Complete user workflows
4. **Regression Tests**: Ensure existing functionality works
5. **Mutation Tests**: Verify test quality

## 2. Unit Testing

### 2.1 Frontend Unit Tests

#### Test Framework: Jest + React Testing Library

**Test Files Structure:**
```
src/
├── __tests__/
│   ├── components/
│   │   └── Navbar.test.tsx
│   ├── utils/
│   │   ├── firestore.test.ts
│   │   └── microservices.test.ts
│   └── pages/
│       ├── applications.test.tsx
│       ├── dashboard.test.tsx
│       └── payments.test.tsx
```

**Example Test: Payment Calculation**
```typescript
// src/__tests__/utils/calculations.test.ts
import { calculateTotalAmount, calculateDaysBetween } from '../utils/calculations';

describe('Loan Calculations', () => {
  test('calculates days between dates correctly', () => {
    const start = '2024-01-01';
    const end = '2024-01-31';
    expect(calculateDaysBetween(start, end)).toBe(30);
  });

  test('calculates total amount with interest', () => {
    const principal = 10000;
    const rate = 5; // 5%
    const days = 30;
    const expected = 10000 + (10000 * 0.05 * (30/30));
    expect(calculateTotalAmount(principal, rate, days)).toBe(expected);
  });
});
```

**Example Test: Component Rendering**
```typescript
// src/__tests__/components/Navbar.test.tsx
import { render, screen } from '@testing-library/react';
import Navbar from '@/app/components/Navbar';

describe('Navbar Component', () => {
  test('renders navigation links', () => {
    render(<Navbar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
  });

  test('highlights active route', () => {
    // Test implementation
  });
});
```

### 2.2 Backend Unit Tests

#### Notification Service Tests
```typescript
// services/notification-service/src/__tests__/NotificationService.test.ts
import { NotificationService } from '../services/NotificationService';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  test('sends email successfully', async () => {
    const result = await service.sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test body',
    });
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  test('validates email address', async () => {
    await expect(
      service.sendEmail({
        to: 'invalid-email',
        subject: 'Test',
        body: 'Test',
      })
    ).rejects.toThrow();
  });
});
```

#### Payment Service Tests
```typescript
// services/payment-service/src/__tests__/PaymentService.test.ts
import { PaymentService } from '../services/PaymentService';

describe('PaymentService', () => {
  test('validates payment amount', async () => {
    const service = new PaymentService();
    const result = await service.validatePayment({
      borrowerId: 'borrower123',
      amount: 1500,
      dueAmount: 1500,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('rejects negative amounts', async () => {
    const service = new PaymentService();
    const result = await service.validatePayment({
      borrowerId: 'borrower123',
      amount: -100,
      dueAmount: 1500,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Payment amount must be greater than zero');
  });
});
```

## 3. Integration Testing

### 3.1 API Integration Tests

#### Test Framework: Jest + Supertest

**Notification Service API Tests**
```typescript
// services/notification-service/src/__tests__/api/notifications.test.ts
import request from 'supertest';
import app from '../../index';

describe('Notification API', () => {
  test('POST /api/v1/notifications/email - sends email', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email')
      .send({
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'Test body',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.messageId).toBeDefined();
  });

  test('POST /api/v1/notifications/email - validates input', async () => {
    const response = await request(app)
      .post('/api/v1/notifications/email')
      .send({
        to: 'invalid-email',
        subject: 'Test',
        body: 'Test',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

**Payment Service API Tests**
```typescript
// services/payment-service/src/__tests__/api/payments.test.ts
import request from 'supertest';
import app from '../../index';

describe('Payment API', () => {
  test('POST /api/v1/payments/validate - validates payment', async () => {
    const response = await request(app)
      .post('/api/v1/payments/validate')
      .send({
        borrowerId: 'borrower123',
        amount: 1500,
        dueAmount: 1500,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.isValid).toBe(true);
  });

  test('POST /api/v1/payments/process - processes offline payment', async () => {
    const response = await request(app)
      .post('/api/v1/payments/process')
      .send({
        borrowerId: 'borrower123',
        amount: 1500,
        paymentMethod: 'cash',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.paymentId).toBeDefined();
  });
});
```

### 3.2 Service Integration Tests

**Microservices Communication Tests**
```typescript
// src/__tests__/integration/microservices.test.ts
import { sendEmailNotification, processPayment } from '@/app/utils/microservices';

describe('Microservices Integration', () => {
  test('Notification Service integration', async () => {
    const result = await sendEmailNotification({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test body',
    });
    expect(result.success).toBe(true);
  });

  test('Payment Service integration', async () => {
    const result = await processPayment({
      borrowerId: 'borrower123',
      amount: 1500,
      paymentMethod: 'cash',
    });
    expect(result.success).toBe(true));
  });
});
});
```

## 4. End-to-End Testing

### 4.1 E2E Test Framework: Cypress

**Test Scenarios:**

1. **Complete Loan Application Flow**
```typescript
// cypress/e2e/loan-application.cy.ts
describe('Loan Application Flow', () => {
  it('submits a loan application successfully', () => {
    cy.visit('/applications');
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="loanAmount"]').type('10000');
    cy.get('input[name="rateOfInterest"]').type('5');
    cy.get('button[type="submit"]').click();
    cy.contains('Application submitted').should('be.visible');
  });

  it('approves a loan application', () => {
    cy.login('admin@example.com', 'password');
    cy.visit('/applications');
    cy.contains('Pending').first().parent().find('button').contains('Approve').click();
    cy.contains('Application approved').should('be.visible');
  });
});
```

2. **Payment Processing Flow**
```typescript
// cypress/e2e/payment.cy.ts
describe('Payment Flow', () => {
  it('records a payment', () => {
    cy.visit('/payments/borrower123');
    cy.get('input[placeholder="Enter amount"]').type('1500');
    cy.get('button[type="submit"]').click();
    cy.contains('Payment added successfully').should('be.visible');
    cy.contains('$1,500.00').should('be.visible');
  });

  it('exports payment history', () => {
    cy.visit('/payments/borrower123');
    cy.get('button').contains('Export Excel').click();
    // Verify file download
  });
});
```

3. **Dashboard Analytics Flow**
```typescript
// cypress/e2e/dashboard.cy.ts
describe('Dashboard', () => {
  it('displays KPI metrics', () => {
    cy.visit('/dashboard');
    cy.contains('Total Loaned').should('be.visible');
    cy.contains('Total Paid').should('be.visible');
    cy.contains('Total Due').should('be.visible');
  });

  it('sends payment reminder', () => {
    cy.visit('/dashboard');
    cy.get('button').contains('Send reminder').first().click();
    cy.contains('Reminder sent successfully').should('be.visible');
  });
});
```

## 5. Regression Testing

### 5.1 Test Suite Organization

**Regression Test Checklist:**

- [ ] User authentication and authorization
- [ ] Loan application CRUD operations
- [ ] Payment recording and validation
- [ ] Notification sending
- [ ] Dashboard metrics calculation
- [ ] Data export functionality
- [ ] Search and filter operations
- [ ] Responsive design on mobile devices

**Automated Regression Tests:**
```typescript
// cypress/e2e/regression.cy.ts
describe('Regression Tests', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password');
  });

  it('maintains backward compatibility with existing features', () => {
    // Test all existing features still work
  });

  it('preserves data integrity after updates', () => {
    // Test data consistency
  });
});
```

## 6. Mutation Testing

### 6.1 Mutation Testing Framework: Stryker

**Configuration:**
```json
// stryker.conf.json
{
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.ts",
    "!src/**/*.test.tsx"
  ],
  "mutator": {
    "excludedMutations": ["StringLiteral", "BooleanLiteral"]
  }
}
```

**Running Mutation Tests:**
```bash
npx stryker run
```

**Mutation Test Report:**
- Shows which mutations were killed (good tests)
- Shows which mutations survived (weak tests)
- Provides mutation score percentage

## 7. Test Coverage Goals

### 7.1 Coverage Targets

| Component | Target Coverage |
|-----------|----------------|
| Unit Tests | 80%+ |
| Integration Tests | 70%+ |
| E2E Tests | Critical paths only |
| Overall | 75%+ |

### 7.2 Coverage Reports

**Generate Coverage:**
```bash
# Frontend
npm run test:coverage

# Backend Services
cd services/notification-service && npm run test:coverage
cd services/payment-service && npm run test:coverage
```

## 8. Test Data Management

### 8.1 Test Fixtures

**Mock Data:**
```typescript
// src/__tests__/fixtures/borrowers.ts
export const mockBorrower = {
  id: 'borrower123',
  name: 'John Doe',
  loanAmount: 10000,
  totalAmount: 10500,
  status: 'Approved',
};

export const mockPayments = [
  { id: 'p1', amount: 500, date: '2024-01-01' },
  { id: 'p2', amount: 500, date: '2024-02-01' },
];
```

### 8.2 Test Database

- Use Firestore emulator for testing
- Seed test data before tests
- Clean up after tests

## 9. Continuous Testing

### 9.1 CI/CD Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:coverage
```

## 10. Test Execution Plan

### 10.1 Test Execution Order

1. **Unit Tests** (Fastest, run first)
2. **Integration Tests** (Medium speed)
3. **E2E Tests** (Slowest, run last)
4. **Mutation Tests** (Run periodically)

### 10.2 Test Maintenance

- Review and update tests with each feature
- Remove obsolete tests
- Refactor flaky tests
- Update test data regularly



