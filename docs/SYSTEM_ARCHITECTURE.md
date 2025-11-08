# System Architecture and System Design

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │    │
│  │  (Next.js)   │  │   (Future)   │  │   (Future)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│              (Next.js API Routes / Nginx)                   │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Notification │  │   Payment    │  │  Calculation │
│   Service    │  │   Service    │  │   Service    │
│   (Port 3001)│  │  (Port 3002) │  │  (Port 3003) │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   SendGrid   │  │    Stripe    │  │   Business   │
│   Twilio     │  │     API      │  │    Logic     │
│   Redis      │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Firestore   │  │   Redis      │  │   Storage   │      │
│  │  (Primary)   │  │   (Queue)    │  │   (Files)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Microservices Architecture

#### Service Breakdown

1. **Frontend Service (Next.js)**
   - Port: 3000
   - Responsibilities:
     - User interface
     - Client-side routing
     - API orchestration
     - State management

2. **Notification Service**
   - Port: 3001
   - Responsibilities:
     - Email notifications (SendGrid)
     - SMS notifications (Twilio)
     - Push notifications (future)
     - Notification templates
   - Technology: Node.js, Express, Bull (Redis queue)

3. **Payment Service**
   - Port: 3002
   - Responsibilities:
     - Payment processing (Stripe)
     - Payment validation
     - Refund processing
     - Payment method management
   - Technology: Node.js, Express, Stripe SDK

4. **Calculation Service** (Future)
   - Port: 3003
   - Responsibilities:
     - Interest calculations
     - Total amount calculations
     - Payment schedules
   - Technology: Node.js, Express

### 1.3 Data Flow

#### Loan Application Flow
```
User → Next.js App → Firestore → Notification Service → Email
                              ↓
                         Borrower Record Created
```

#### Payment Flow
```
User → Next.js App → Payment Service → Stripe API
                    ↓
              Firestore (Update Payment)
                    ↓
         Notification Service (Receipt)
```

#### Notification Flow
```
Scheduler → Notification Service → Redis Queue
                                    ↓
                              Bull Worker
                                    ↓
                            SendGrid/Twilio
```

## 2. System Design

### 2.1 Database Design

#### Firestore Collections

**applications**
```
{
  id: string (auto-generated)
  snNo: number
  name: string
  loanAmount: number
  rateOfInterest: number
  startDate: string (ISO date)
  endDate: string (ISO date)
  daysBetween: number
  totalAmount: number
  status: "Pending" | "Approved" | "Rejected"
  createdAt: timestamp
  updatedAt: timestamp
}
```

**borrowers**
```
{
  id: string (auto-generated)
  applicationId: string (reference)
  snNo: number
  name: string
  email: string
  phone: string (optional)
  loanAmount: number
  rateOfInterest: number
  startDate: string
  endDate: string
  dueDate: string
  daysBetween: number
  totalAmount: number
  status: string
  payments: subcollection {
    id: string
    amount: number
    date: string (ISO date)
    method: string
    transactionId: string (optional)
  }
}
```

**users**
```
{
  id: string (Firebase Auth UID)
  email: string
  role: "admin" | "staff"
  createdAt: timestamp
  lastLogin: timestamp
}
```

### 2.2 API Design

#### RESTful API Endpoints

**Notification Service**
```
POST   /api/v1/notifications/email
POST   /api/v1/notifications/email/async
POST   /api/v1/notifications/sms
POST   /api/v1/notifications/sms/async
POST   /api/v1/notifications/payment-reminder
GET    /api/v1/notifications/history
GET    /health
```

**Payment Service**
```
POST   /api/v1/payments/process
POST   /api/v1/payments/validate
POST   /api/v1/payments/refund
POST   /api/v1/payments/create-intent
GET    /api/v1/payments/:paymentId
GET    /api/v1/payments/history/:borrowerId
GET    /health
```

**Next.js API Routes**
```
POST   /api/notify (legacy, proxies to Notification Service)
GET    /api/applications (via Firestore)
POST   /api/applications (via Firestore)
```

### 2.3 Component Architecture

#### Frontend Components

```
src/app/
├── components/
│   └── Navbar.tsx (Shared navigation)
├── context/
│   ├── AuthContext.tsx (Authentication)
│   └── LoanContext.tsx (Loan data)
├── utils/
│   ├── firestore.ts (Database operations)
│   └── microservices.ts (Service clients)
├── applications/
│   └── page.tsx (Application management)
├── dashboard/
│   └── page.tsx (Dashboard and analytics)
├── payments/
│   └── [id]/page.tsx (Payment management)
└── login/
    └── page.tsx (Authentication)
```

### 2.4 Security Design

#### Authentication
- Firebase Authentication
- JWT tokens
- Session management
- Role-based access control (RBAC)

#### Authorization
- Admin: Full access
- Staff: Limited access (no deletions)

#### Data Security
- Encrypted data in transit (HTTPS)
- Firestore security rules
- API key management
- Input validation and sanitization

### 2.5 Scalability Design

#### Horizontal Scaling
- Stateless microservices
- Load balancing
- Database sharding (future)
- CDN for static assets

#### Performance Optimization
- Redis caching
- Database indexing
- Lazy loading
- Code splitting
- Image optimization

### 2.6 Error Handling

#### Error Types
1. **Client Errors (4xx)**
   - Validation errors
   - Authentication errors
   - Authorization errors

2. **Server Errors (5xx)**
   - Database errors
   - Service unavailable
   - Internal errors

#### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### 2.7 Monitoring and Logging

#### Logging Levels
- ERROR: Critical issues
- WARN: Warning conditions
- INFO: Informational messages
- DEBUG: Debug information

#### Monitoring Metrics
- Request rate
- Response time
- Error rate
- Service health
- Database performance

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts

### Backend Services
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Queue**: Bull (Redis)

### Database
- **Primary**: Firebase Firestore
- **Cache/Queue**: Redis

### Third-Party Services
- **Authentication**: Firebase Auth
- **Email**: SendGrid
- **SMS**: Twilio
- **Payments**: Stripe

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions (future)

## 4. Deployment Architecture

### Development
```
Local Development
├── Next.js (localhost:3000)
├── Notification Service (localhost:3001)
├── Payment Service (localhost:3002)
└── Redis (localhost:6379)
```

### Production
```
Cloud Infrastructure
├── Next.js (Vercel/Cloud Run)
├── Notification Service (Cloud Run/Kubernetes)
├── Payment Service (Cloud Run/Kubernetes)
├── Redis (Cloud Memorystore/ElastiCache)
└── Firestore (Firebase)
```

## 5. Design Patterns

### Patterns Used
1. **Microservices Pattern**: Independent, scalable services
2. **API Gateway Pattern**: Centralized API routing
3. **Repository Pattern**: Data access abstraction
4. **Factory Pattern**: Service creation
5. **Observer Pattern**: Event-driven notifications
6. **Strategy Pattern**: Multiple payment methods

### SOLID Principles
- **Single Responsibility**: Each service has one purpose
- **Open/Closed**: Extensible without modification
- **Liskov Substitution**: Interchangeable implementations
- **Interface Segregation**: Focused interfaces
- **Dependency Inversion**: Depend on abstractions



