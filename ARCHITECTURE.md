# Loan Management Web App: Architecture & Dataflow Documentation

## Overview
This project is a Loan Management Web Application built with Next.js (React), Firebase Firestore, and Tailwind CSS. It enables users to manage loan applications, borrowers, and payments with CRUD operations, calculated fields, and status-based UI logic.

---

## 1. Architecture

### 1.1. Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS (dark theme)
- **Pages:**
  - `Applications`: Manage loan applications (add, edit, approve/reject, delete)
  - `Dashboard`: View borrowers, loan summaries, due amounts
  - `Payments`: View and record payment history per borrower
- **Routing:** File-based routing under `src/app/`
- **State Management:** React hooks (`useState`, `useEffect`)
- **UI Logic:**
  - Inline editing for applications
  - Status-based controls (edit/save/approve/reject only for pending)
  - Search/filter by name
  - "See More" dropdown for recent records

### 1.2. Backend
- **Database:** Firebase Firestore
- **Data Structure:**
  - **Applications Collection:** Stores loan applications with fields: `id`, `snNo`, `name`, `loanAmount`, `rateOfInterest`, `startDate`, `endDate`, `daysBetween`, `totalAmount`, `status`
  - **Borrowers Collection:** Stores borrower info (linked to applications)
  - **Payments Subcollection:** Each borrower has a subcollection for payment history
- **CRUD Utilities:**
  - Located in `src/app/utils/firestore.ts`
  - Functions: `fetchApplications`, `saveApplication`, `updateApplication`, `updateApplicationStatus`, `deleteApplication`, `fetchBorrowers`, `deleteBorrower`, `savePayment`, `fetchPayments`

---

## 2. Dataflow

### 2.1. Loan Application Lifecycle
1. **Create:** User fills form, submits. Data is validated, calculated (days, total amount), and saved to Firestore.
2. **Edit:** Inline editing allowed only for pending applications. Changes are saved and recalculated.
3. **Approve/Reject:** Status updated in Firestore. UI hides edit/save/approve/reject for non-pending.
4. **Delete:** Application removed from Firestore.

### 2.2. Borrower Dashboard
- Fetches borrowers and their applications.
- Calculates due amount by subtracting total payments from total loan amount.
- Displays recent records, supports search/filter.

### 2.3. Payments Page
- Fetches payment history for each borrower from their subcollection.
- Allows adding new payments, updates due amount.
- Shows concise loan summary and payment history.

---

## 3. UI/UX Features
- **Controlled Inputs:** All forms use controlled React state to avoid errors.
- **Status-Based Controls:** Only show edit/save/approve/reject for pending applications.
- **Concise Summaries:** Dashboard and payments page show compact loan info.
- **Search/Filter:** By name, in both dashboard and applications.
- **Recent Records:** Only 5 most recent shown by default, with "See More" option.

---

## 4. Firestore Data Model
```plaintext
applications (collection)
  └─ {id}
      ├─ snNo
      ├─ name
      ├─ loanAmount
      ├─ rateOfInterest
      ├─ startDate
      ├─ endDate
      ├─ daysBetween
      ├─ totalAmount
      ├─ status
borrowers (collection)
  └─ {id}
      ├─ ...borrower fields
      └─ payments (subcollection)
          └─ {paymentId}
              ├─ amount
              ├─ date
              └─ ...other fields
```

---

## 5. Data & UI Flow Example
1. **User adds application:**
   - Form data → calculated fields → Firestore → UI updates
2. **User edits application:**
   - Inline form → update Firestore → UI updates
3. **User approves/rejects:**
   - Status change → Firestore → UI hides controls
4. **User views dashboard:**
   - Fetch borrowers/applications/payments → calculate due → display
5. **User records payment:**
   - Add payment → update borrower's subcollection → recalculate due

---

## 6. Security & Validation
- All destructive actions (delete) require confirmation.
- Controlled inputs prevent runtime errors.
- Only valid actions shown based on status.

---

## 7. Extensibility
- Easily add new fields to applications/borrowers/payments.
- UI logic can be extended for more statuses or roles.
- Firestore structure supports scalable subcollections.

---

## 8. File Structure Reference
```
eslint.config.mjs
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
README.md
public/
src/
  app/
    applications/
      page.tsx
    dashboard/
      page.tsx
    payments/[id]/
      page.tsx
    utils/
      firestore.ts
```

---

## 9. Summary
This app provides a robust, scalable, and user-friendly platform for managing loans, borrowers, and payments, leveraging Next.js for UI and Firestore for real-time data storage and retrieval.
