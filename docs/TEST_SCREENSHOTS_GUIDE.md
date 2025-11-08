# How to Generate Test Screenshots

## 1. Integration Testing Screenshots

### 1.1 Setup Test Environment

**Prerequisites:**
- Node.js installed
- Test framework installed (Jest, Cypress)
- Services running locally

### 1.2 Running Integration Tests

#### Step 1: Start Services
```bash
# Terminal 1 - Notification Service
cd services/notification-service
npm run dev

# Terminal 2 - Payment Service
cd services/payment-service
npm run dev

# Terminal 3 - Next.js App
npm run dev
```

#### Step 2: Run Integration Tests
```bash
# Run API integration tests
cd services/notification-service
npm test -- --testPathPattern=integration

# Or run all tests with coverage
npm test -- --coverage
```

#### Step 3: Capture Screenshots

**Using Jest with Screenshot Support:**
```typescript
// Add to test file
import { toMatchImageSnapshot } from 'jest-image-snapshot';
expect.extend({ toMatchImageSnapshot });

test('API endpoint returns correct response', async () => {
  const response = await request(app)
    .post('/api/v1/notifications/email')
    .send({ to: 'test@example.com', subject: 'Test', body: 'Test' });
  
  // Screenshot of response
  expect(response.body).toMatchSnapshot();
});
```

**Screenshots to Capture:**
1. ✅ Test execution results in terminal
2. ✅ API response in Postman/Insomnia
3. ✅ Service logs showing successful processing
4. ✅ Database state after test execution
5. ✅ Network requests in browser DevTools

### 1.3 Using Postman for API Testing

**Steps:**
1. Open Postman
2. Create collection: "Loan Management API Tests"
3. Add requests for each endpoint
4. Run collection
5. Take screenshots of:
   - Request configuration
   - Response body
   - Test results
   - Collection runner results

**Example Postman Collection:**
```
Loan Management API Tests
├── Notification Service
│   ├── Send Email (POST)
│   ├── Send SMS (POST)
│   └── Payment Reminder (POST)
└── Payment Service
    ├── Process Payment (POST)
    ├── Validate Payment (POST)
    └── Create Intent (POST)
```

## 2. Regression Testing Screenshots

### 2.1 Running Regression Tests

#### Using Cypress for E2E Regression Tests

**Step 1: Install Cypress**
```bash
npm install --save-dev cypress
```

**Step 2: Configure Cypress**
```json
// cypress.config.ts
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('after:screenshot', (details) => {
        // Custom screenshot handling
      });
    },
    screenshotOnRunFailure: true,
  },
});
```

**Step 3: Run Tests with Screenshots**
```bash
# Run tests and capture screenshots
npx cypress run --headed

# Screenshots saved to: cypress/screenshots/
```

**Screenshots to Capture:**
1. ✅ Test execution in Cypress UI
2. ✅ Browser during test execution
3. ✅ Test results summary
4. ✅ Failed test screenshots (if any)
5. ✅ Video recordings of test runs

### 2.2 Manual Regression Testing

**Test Checklist with Screenshots:**

1. **Login Functionality**
   - Screenshot: Login page
   - Screenshot: Successful login
   - Screenshot: Failed login error

2. **Loan Application**
   - Screenshot: Application form
   - Screenshot: Submitted application
   - Screenshot: Application in list

3. **Payment Processing**
   - Screenshot: Payment form
   - Screenshot: Payment success message
   - Screenshot: Payment in history

4. **Dashboard**
   - Screenshot: Dashboard with metrics
   - Screenshot: Charts and graphs
   - Screenshot: Borrower list

## 3. Mutation Testing Screenshots

### 3.1 Setup Stryker Mutation Testing

**Step 1: Install Stryker**
```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/jest-runner
```

**Step 2: Configure Stryker**
```json
// stryker.conf.json
{
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest"
}
```

**Step 3: Run Mutation Tests**
```bash
npx stryker run
```

**Step 4: View Results**
- Open `reports/mutation/html/index.html` in browser
- Take screenshots of:
  1. ✅ Mutation score dashboard
  2. ✅ Survived mutations list
  3. ✅ Killed mutations list
  4. ✅ Coverage analysis
  5. ✅ Test effectiveness metrics

**Screenshots to Capture:**
1. Terminal output showing mutation score
2. HTML report showing mutation details
3. Coverage report
4. Test execution summary

## 4. Screenshot Tools and Tips

### 4.1 Recommended Tools

1. **Snipping Tool** (Windows)
   - Built-in screenshot tool
   - Shortcut: `Win + Shift + S`

2. **Greenshot** (Windows/Mac/Linux)
   - Free screenshot tool
   - Annotation features

3. **ShareX** (Windows)
   - Advanced screenshot tool
   - Auto-upload capabilities

4. **Browser Extensions**
   - Full Page Screen Capture (Chrome)
   - Awesome Screenshot (Chrome/Firefox)

### 4.2 Screenshot Best Practices

1. **Naming Convention:**
   ```
   test-type_feature_date.png
   Example: integration_notification-service_2024-12-07.png
   ```

2. **Organization:**
   ```
   docs/screenshots/
   ├── integration/
   ├── regression/
   ├── mutation/
   └── version-management/
   ```

3. **Annotations:**
   - Highlight important areas
   - Add labels and arrows
   - Include timestamps

4. **Quality:**
   - Use high resolution
   - Ensure text is readable
   - Include relevant context

## 5. Specific Screenshot Scenarios

### 5.1 Integration Test Screenshots

**Scenario 1: Notification Service Integration**
```
1. Terminal showing service startup
2. Postman request to /api/v1/notifications/email
3. Postman response showing success
4. Email received in inbox
5. Service logs showing processing
```

**Scenario 2: Payment Service Integration**
```
1. Payment service running
2. API request to process payment
3. Response with payment ID
4. Stripe dashboard showing transaction
5. Database record updated
```

### 5.2 Regression Test Screenshots

**Before and After Comparison:**
```
1. Feature working before change
2. Code change made
3. Tests run successfully
4. Feature still working after change
4. Test results showing no regressions
```

### 5.3 Mutation Test Screenshots

**Mutation Test Report:**
```
1. Stryker command execution
2. Mutation score (e.g., 85%)
3. Survived mutations list
4. Killed mutations list
5. HTML report dashboard
```

## 6. Automated Screenshot Capture

### 6.1 Using Cypress

```typescript
// cypress/support/commands.ts
Cypress.Commands.add('takeScreenshot', (name: string) => {
  cy.screenshot(name, { capture: 'fullPage' });
});

// In test
cy.takeScreenshot('dashboard-before-test');
// ... perform actions
cy.takeScreenshot('dashboard-after-test');
```

### 6.2 Using Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## 7. Documentation Template

### Screenshot Documentation Format

```markdown
## Test: Notification Service Integration

**Date:** 2024-12-07  
**Tester:** [Your Name]  
**Environment:** Development

### Test Steps:
1. Started Notification Service
2. Sent POST request to /api/v1/notifications/email
3. Verified email received

### Screenshots:
![Service Running](screenshots/integration/service-running.png)
![API Request](screenshots/integration/api-request.png)
![Email Received](screenshots/integration/email-received.png)

### Results:
✅ All tests passed
✅ Email delivered successfully
✅ Response time: 250ms
```

## 8. Quick Reference Commands

```bash
# Run integration tests
npm test -- --testPathPattern=integration

# Run with coverage
npm test -- --coverage

# Run Cypress tests
npx cypress run

# Run mutation tests
npx stryker run

# Generate test report
npm run test:report
```



