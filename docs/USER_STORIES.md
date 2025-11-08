# User Stories

## Epic 1: Loan Application Management

### US-1.1: Submit Loan Application
**As a** borrower  
**I want to** submit a loan application online  
**So that** I can apply for a loan without visiting the office

**Acceptance Criteria:**
- User can fill out application form with name, loan amount, interest rate, dates
- System calculates total amount and days automatically
- Application is saved with "Pending" status
- User receives confirmation

**Priority:** High  
**Story Points:** 5

---

### US-1.2: View Loan Applications
**As a** loan officer  
**I want to** view all loan applications  
**So that** I can review and process them

**Acceptance Criteria:**
- Display all applications in a table
- Show application status (Pending, Approved, Rejected)
- Filter by status and search by name
- Pagination for large datasets

**Priority:** High  
**Story Points:** 3

---

### US-1.3: Approve/Reject Application
**As a** loan officer  
**I want to** approve or reject loan applications  
**So that** I can manage the loan approval process

**Acceptance Criteria:**
- Only pending applications can be approved/rejected
- Approved applications automatically create borrower record
- Status change is logged
- Borrower is notified of decision

**Priority:** High  
**Story Points:** 5

---

### US-1.4: Edit Application
**As a** loan officer  
**I want to** edit pending applications  
**So that** I can correct errors or update information

**Acceptance Criteria:**
- Only pending applications can be edited
- Changes trigger recalculation of totals
- Edit history is maintained
- Validation prevents invalid data

**Priority:** Medium  
**Story Points:** 3

---

## Epic 2: Payment Management

### US-2.1: Record Payment
**As a** loan officer  
**I want to** record payments from borrowers  
**So that** I can track payment history

**Acceptance Criteria:**
- Enter payment amount and date
- Payment is validated against due amount
- Payment history is updated
- Remaining balance is recalculated

**Priority:** High  
**Story Points:** 5

---

### US-2.2: View Payment History
**As a** loan officer or borrower  
**I want to** view payment history for a borrower  
**So that** I can track payment status

**Acceptance Criteria:**
- Display all payments in chronological order
- Show payment amount, date, and status
- Sort by date or amount
- Export to CSV/Excel

**Priority:** High  
**Story Points:** 3

---

### US-2.3: Process Online Payment
**As a** borrower  
**I want to** make payments online using credit card or bank transfer  
**So that** I can pay conveniently

**Acceptance Criteria:**
- Support multiple payment methods (card, ACH)
- Secure payment processing via Stripe
- Real-time payment confirmation
- Automatic payment recording

**Priority:** High  
**Story Points:** 8

---

### US-2.4: Delete Payment
**As a** loan officer  
**I want to** delete incorrect payments  
**So that** I can maintain accurate records

**Acceptance Criteria:**
- Confirmation dialog before deletion
- Payment removal updates balance
- Deletion is logged for audit

**Priority:** Low  
**Story Points:** 2

---

## Epic 3: Notifications

### US-3.1: Payment Reminder
**As a** system  
**I want to** send automated payment reminders  
**So that** borrowers are notified of upcoming due dates

**Acceptance Criteria:**
- Send email reminder before due date
- Include payment amount and due date
- Support SMS reminders (optional)
- Track notification delivery

**Priority:** High  
**Story Points:** 5

---

### US-3.2: Overdue Notification
**As a** loan officer  
**I want to** send overdue notifications to borrowers  
**So that** I can encourage payment collection

**Acceptance Criteria:**
- Identify overdue loans automatically
- Send email/SMS notification
- Include overdue amount and days past due
- Track notification history

**Priority:** High  
**Story Points:** 5

---

### US-3.3: Application Status Update
**As a** system  
**I want to** notify borrowers of application status changes  
**So that** borrowers are informed of decisions

**Acceptance Criteria:**
- Send email on approval/rejection
- Include relevant details
- Professional email template
- Delivery confirmation

**Priority:** Medium  
**Story Points:** 3

---

## Epic 4: Dashboard and Analytics

### US-4.1: View Dashboard
**As a** loan officer  
**I want to** view a dashboard with key metrics  
**So that** I can quickly assess portfolio health

**Acceptance Criteria:**
- Display total loaned, paid, due amounts
- Show overdue count
- Visual charts for trends
- Real-time data updates

**Priority:** High  
**Story Points:** 5

---

### US-4.2: View Borrowers
**As a** loan officer  
**I want to** view all borrowers with their loan details  
**So that** I can manage the borrower portfolio

**Acceptance Criteria:**
- Display borrower list with loan information
- Show payment status and due amounts
- Search and filter functionality
- Quick actions (view payments, send reminder)

**Priority:** High  
**Story Points:** 5

---

### US-4.3: Payment Trends
**As a** financial analyst  
**I want to** view payment trends over time  
**So that** I can analyze payment patterns

**Acceptance Criteria:**
- Chart showing payments over last 30/90 days
- Compare paid vs due amounts
- Export data for analysis
- Interactive charts

**Priority:** Medium  
**Story Points:** 5

---

## Epic 5: Authentication and Security

### US-5.1: User Login
**As a** user  
**I want to** log in securely  
**So that** I can access the system

**Acceptance Criteria:**
- Email/password authentication
- Secure session management
- Role-based access control
- Password reset functionality

**Priority:** High  
**Story Points:** 5

---

### US-5.2: Role-Based Access
**As a** system administrator  
**I want to** assign roles to users  
**So that** I can control access to features

**Acceptance Criteria:**
- Admin and staff roles
- Admin can perform all actions
- Staff has limited permissions
- Role changes are logged

**Priority:** Medium  
**Story Points:** 5

---

## Epic 6: Data Export and Reporting

### US-6.1: Export Payment History
**As a** loan officer  
**I want to** export payment history to Excel/CSV  
**So that** I can use it for reporting

**Acceptance Criteria:**
- Export to CSV format
- Export to Excel format
- Include all payment details
- Properly formatted data

**Priority:** Medium  
**Story Points:** 3

---

### US-6.2: Generate Reports
**As a** financial analyst  
**I want to** generate financial reports  
**So that** I can analyze portfolio performance

**Acceptance Criteria:**
- Portfolio summary report
- Payment collection report
- Overdue loans report
- Export to PDF/Excel

**Priority:** Low  
**Story Points:** 8

---

## User Story Summary

| Epic | Stories | Total Points |
|------|---------|--------------|
| Loan Application Management | 4 | 16 |
| Payment Management | 4 | 18 |
| Notifications | 3 | 13 |
| Dashboard and Analytics | 3 | 15 |
| Authentication and Security | 2 | 10 |
| Data Export and Reporting | 2 | 11 |
| **Total** | **18** | **83** |

## Priority Distribution

- **High Priority**: 12 stories (67%)
- **Medium Priority**: 4 stories (22%)
- **Low Priority**: 2 stories (11%)


