# Procurement System Technical Specification

## Table of Contents
- [1. System Architecture](#1-system-architecture)
  - [1.1. Monorepo Structure](#11-monorepo-structure)
  - [1.2. Service Architecture](#12-service-architecture)
  - [1.3. Data Flow](#13-data-flow)
- [2. Frontend Applications](#2-frontend-applications)
  - [2.1. Shared UI Components](#21-shared-ui-components)
  - [2.2. Application-Specific Features](#22-application-specific-features)
- [3. Backend Services](#3-backend-services)
  - [3.1. Service Definitions](#31-service-definitions)
  - [3.2. API Design](#32-api-design)
  - [3.3. Database Schema](#33-database-schema)
- [4. Authentication & Authorization](#4-authentication--authorization)
  - [4.1. Authentication Flow](#41-authentication-flow)
  - [4.2. RBAC Implementation](#42-rbac-implementation)
- [5. Payment Integration](#5-payment-integration)
  - [5.1. Stripe Implementation](#51-stripe-implementation)
  - [5.2. Commission Handling](#52-commission-handling)
- [6. Observability & Monitoring](#6-observability--monitoring)
- [7. Deployment Architecture](#7-deployment-architecture)
- [8. Technical Implementation Details](#8-technical-implementation-details)
- [9. Testing Strategy](#9-testing-strategy)
- [10. Security Considerations](#10-security-considerations)

## 1. System Architecture

### 1.1. Monorepo Structure

The procurement system will be implemented as a Turborepo monorepo with the following high-level structure:

```
procurement-platform/
├── apps/
│   ├── admin-ui/         # Admin frontend application
│   ├── client-ui/        # Client frontend application 
│   ├── supplier-ui/      # Supplier frontend application
│   └── auth-ui/          # Shared authentication UI components
├── services/
│   ├── auth-service/     # Authentication & user management
│   ├── user-service/     # User profiles and permissions
│   ├── procurement-service/ # Request creation and management
│   ├── bidding-service/  # Bid submission and management
│   ├── billing-service/  # Subscription and payment processing
│   ├── analytics-service/ # Reporting and analytics
│   ├── notification-service/ # Email and push notifications
│   └── geolocation-service/ # Map and location services
├── packages/
│   ├── ui/               # Shared UI components
│   ├── api-client/       # Generated API client
│   ├── tsconfig/         # Shared TypeScript configurations
│   ├── eslint-config/    # Shared ESLint configurations
│   └── utils/            # Shared utility functions
└── infrastructure/       # IaC templates and deployment scripts
```

### 1.2. Service Architecture

```mermaid
graph TD
    Client[Client UI] --> AS[Auth Service]
    Admin[Admin UI] --> AS
    Supplier[Supplier UI] --> AS
    
    Client --> PS[Procurement Service]
    Client --> BS[Bidding Service]
    Client --> GS[Geolocation Service]
    Client --> NS[Notification Service]
    Client --> BIS[Billing Service]
    
    Supplier --> PS
    Supplier --> BS
    Supplier --> GS
    Supplier --> NS
    Supplier --> BIS
    
    Admin --> US[User Service]
    Admin --> PS
    Admin --> BS
    Admin --> ANS[Analytics Service]
    Admin --> BIS
    
    AS --> US
    PS --> NS
    BS --> NS
    PS --> GS
    BS --> GS
    PS <--> BS
    BS --> BIS
    
    BIS --> Stripe[Stripe API]
    
    NS --> Email[Email Provider]
    NS --> Push[Push Notification Service]
    
    GS --> Maps[Maps Provider]
    
    subgraph "Azure Resources"
        AS
        US
        PS
        BS
        BIS
        NS
        GS
        ANS
    end
```

### 1.3. Data Flow

Below is a sequence diagram showing the flow for a typical procurement request lifecycle:

```mermaid
sequenceDiagram
    participant Client
    participant PS as Procurement Service
    participant BS as Bidding Service
    participant NS as Notification Service
    participant Supplier
    participant BIS as Billing Service
    participant Stripe
    
    Client->>PS: Create Procurement Request
    PS->>NS: Notify Relevant Suppliers
    NS-->>Supplier: Send Notification
    Supplier->>BS: Submit Bid/Quote
    BS->>NS: Notify Client of New Bid
    NS-->>Client: Send Notification
    Client->>BS: Review and Accept Bid
    BS->>BIS: Generate Invoice
    BIS->>Stripe: Create Payment Intent
    Stripe-->>Client: Payment Form
    Client->>Stripe: Pay Invoice
    Stripe-->>BIS: Payment Succeeded Webhook
    BIS->>BIS: Calculate Commission
    BIS->>Stripe: Transfer Funds to Supplier (minus commission)
    BIS->>NS: Send Payment Confirmation
    NS-->>Supplier: Payment Confirmation Notification
    NS-->>Client: Payment Confirmation Notification
```

## 2. Frontend Applications

The system consists of three distinct frontend applications targeting different user roles:

### 2.1. Shared UI Components

All frontend applications will use shadcn/ui for a consistent, glassmorphic UI with the following shared components:

- Design System
  - Typography system
  - Color system with light/dark mode support
  - Spacing system
  - Component library
- Authentication UI (shared via auth-ui app)
- Form components
- Data tables
- Charts and data visualization
- Notification system
- Chat components

### 2.2. Application-Specific Features

#### Admin UI

```mermaid
graph TD
    AdminDashboard[Admin Dashboard] --> UserManagement[User Management]
    AdminDashboard --> TeamManagement[Team Management]
    AdminDashboard --> BranchManagement[Branch Management]
    AdminDashboard --> TierManagement[Tier Management]
    AdminDashboard --> CommissionSettings[Commission Settings]
    AdminDashboard --> Analytics[Analytics Dashboard]
    
    UserManagement --> InviteUser[Invite User]
    UserManagement --> ManagePermissions[Manage Permissions]
    UserManagement --> VerifyUsers[Verify Users]
    
    Analytics --> RevenueReports[Revenue Reports]
    Analytics --> UserMetrics[User Metrics]
    Analytics --> ProcurementMetrics[Procurement Metrics]
```

Key features:
- User and team management
- Branch management
- Tier and subscription configuration
- Commission management
- Platform analytics
- Verification management

#### Client UI

```mermaid
graph TD
    ClientDashboard[Client Dashboard] --> ProcurementRequests[Procurement Requests]
    ClientDashboard --> TeamManagement[Team Management]
    ClientDashboard --> Analytics[Analytics]
    ClientDashboard --> Payments[Payments]
    
    ProcurementRequests --> CreateRequest[Create Request]
    ProcurementRequests --> ManageItems[Manage Items]
    ProcurementRequests --> ReviewBids[Review Bids]
    ProcurementRequests --> Chat[In-App Chat]
    
    ReviewBids --> MapView[Map View]
    ReviewBids --> AcceptBid[Accept Bid]
    
    Payments --> MakePayment[Make Payment]
    Payments --> PaymentHistory[Payment History]
```

Key features:
- Team and user management
- Procurement request creation and management
- Item management within requests
- Bid review and acceptance
- In-app chat with suppliers
- Map visualization of suppliers and delivery locations
- Direct payment to suppliers via Stripe

#### Supplier UI

```mermaid
graph TD
    SupplierDashboard[Supplier Dashboard] --> RequestBrowser[Request Browser]
    SupplierDashboard --> TeamManagement[Team Management]
    SupplierDashboard --> BidManagement[Bid Management]
    SupplierDashboard --> Analytics[Analytics]
    SupplierDashboard --> Payments[Payments]
    
    RequestBrowser --> FilterRequests[Filter Requests]
    RequestBrowser --> ViewDetails[View Request Details]
    RequestBrowser --> MapView[Map View]
    
    BidManagement --> CreateBid[Create Bid]
    BidManagement --> ManageItems[Item-Level Bidding]
    BidManagement --> Chat[In-App Chat]
    
    Payments --> PaymentHistory[Payment History]
    Payments --> BankAccounts[Bank Account Management]
```

Key features:
- Team and user management
- Request browsing and filtering
- Bid creation and management
- Item-level bidding
- In-app chat with clients
- Map visualization of delivery locations
- Payment reception and management

## 3. Backend Services

### 3.1. Service Definitions

#### Auth Service
- User authentication via email/password and SSO integrations
- MFA support
- Session management
- Integrates with Clerk for authentication flows

#### User Service
- User profile management
- Company profile management
- Role-based access control
- Team and branch management

#### Procurement Service
- Procurement request creation and management
- Item management within requests
- Request workflow (draft, published, in-progress, completed)
- Request metadata management

#### Bidding Service
- Bid submission and management
- Item-level bid management
- Bid status tracking
- Bid acceptance flow
- Bid-credit consumption tracking

#### Billing Service
- Subscription management
- Invoice generation
- Payment processing
- Commission calculation and distribution
- Subscription tier enforcement
- Bid-credit management

#### Analytics Service
- Reporting and dashboards
- User activity tracking
- Spend analytics
- Supplier performance metrics
- Platform health metrics

#### Notification Service
- Email notifications
- In-app notifications
- Push notifications
- Notification preferences
- Scheduled notifications

#### Geolocation Service
- Address validation and geocoding
- Distance calculation
- Map data management
- Location-based supplier recommendations

### 3.2. API Design

All services will expose REST APIs following these conventions:

- Resource-oriented endpoints
- JSON request/response bodies
- JWT authentication
- Versioned API paths (e.g., `/api/v1/resource`)
- Consistent error responses
- OpenAPI/Swagger documentation

Example API structure for Procurement Service:
```
GET    /api/v1/procurement/requests
POST   /api/v1/procurement/requests
GET    /api/v1/procurement/requests/{id}
PUT    /api/v1/procurement/requests/{id}
DELETE /api/v1/procurement/requests/{id}
GET    /api/v1/procurement/requests/{id}/items
POST   /api/v1/procurement/requests/{id}/items
```

### 3.3. Database Schema

The system will use PostgreSQL for relational data. Key entities include:

```mermaid
erDiagram
    ORGANIZATION {
        uuid id
        string name
        string legal_registration
        string tax_id
        jsonb address
        float latitude
        float longitude
        string[] industry_codes
        string company_size
        string years_in_business
        string logo_url
        string website_url
        jsonb social_links
        string payment_terms
        string[] supported_currencies
        string credit_rating
        string[] certifications
        boolean is_verified
        timestamp created_at
        timestamp updated_at
    }
    
    USER {
        uuid id
        uuid organization_id
        string email
        string name
        string title
        string phone
        string timezone
        string role
        jsonb permissions
        boolean is_active
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }
    
    BRANCH {
        uuid id
        uuid organization_id
        string name
        jsonb address
        float latitude
        float longitude
        timestamp created_at
        timestamp updated_at
    }
    
    SUBSCRIPTION {
        uuid id
        uuid organization_id
        string tier
        int seats_limit
        int branches_limit
        int bid_credits_limit
        int bid_credits_used
        timestamp current_period_start
        timestamp current_period_end
        string stripe_subscription_id
        string status 
        timestamp created_at
        timestamp updated_at
    }
    
    REQUEST {
        uuid id
        uuid client_id
        uuid branch_id
        string requisition_number
        string title
        text description
        uuid requestor_id
        jsonb delivery_address
        float delivery_latitude
        float delivery_longitude
        decimal total_budget
        string cost_center
        string urgency
        string status
        timestamp desired_delivery_date
        timestamp created_at
        timestamp updated_at
    }
    
    ITEM {
        uuid id
        uuid request_id
        string name
        text description
        string category
        string unit_of_measure
        int quantity
        decimal budget
        string manufacturer
        string part_number
        int lead_time
        jsonb dimensions
        boolean supplier_can_attach
        timestamp created_at
        timestamp updated_at
    }
    
    BID {
        uuid id
        uuid request_id
        uuid supplier_id
        uuid branch_id
        decimal total_amount
        string status
        text notes
        timestamp created_at
        timestamp updated_at
    }
    
    ITEM_BID {
        uuid id
        uuid bid_id
        uuid item_id
        decimal unit_price
        decimal total_price
        int quantity
        text notes
        uuid[] attachment_ids
        timestamp created_at
        timestamp updated_at
    }
    
    INVOICE {
        uuid id
        uuid bid_id
        uuid client_id
        uuid supplier_id
        string invoice_number
        decimal amount
        decimal commission_amount
        decimal commission_rate
        string stripe_invoice_id
        string payment_status
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }
    
    MESSAGE {
        uuid id
        uuid request_id
        uuid item_id
        uuid sender_id
        text content
        uuid[] attachment_ids
        timestamp created_at
        timestamp updated_at
    }
    
    ATTACHMENT {
        uuid id
        string filename
        string content_type
        string storage_path
        bigint size
        timestamp created_at
    }
    
    ORGANIZATION ||--o{ USER : "has"
    ORGANIZATION ||--o{ BRANCH : "has"
    ORGANIZATION ||--o{ REQUEST : "creates"
    ORGANIZATION ||--o{ BID : "submits"
    ORGANIZATION ||--o{ INVOICE : "is billed"
    ORGANIZATION ||--|| SUBSCRIPTION : "has"
    
    REQUEST ||--o{ ITEM : "contains"
    REQUEST ||--o{ BID : "receives"
    REQUEST ||--o{ MESSAGE : "has"
    
    BID ||--o{ ITEM_BID : "contains"
    BID ||--o{ INVOICE : "generates"
    
    ITEM ||--o{ ITEM_BID : "receives"
    ITEM ||--o{ MESSAGE : "has"
    
    MESSAGE ||--o{ ATTACHMENT : "has"
    ITEM_BID ||--o{ ATTACHMENT : "has"
```

## 4. Authentication & Authorization

### 4.1. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant ClientApp as Frontend App
    participant Clerk as Clerk Auth
    participant AuthService as Auth Service
    participant UserService as User Service
    
    User->>ClientApp: Initiate Login
    ClientApp->>Clerk: Redirect to Auth UI
    Clerk-->>User: Display Login Form
    User->>Clerk: Enter Credentials
    Clerk->>Clerk: Validate Credentials
    alt Invalid Credentials
        Clerk-->>User: Display Error
    else Valid Credentials
        Clerk->>AuthService: Generate JWT
        AuthService->>UserService: Get User Permissions
        UserService-->>AuthService: Return Permissions
        AuthService-->>Clerk: Return JWT with Claims
        Clerk-->>ClientApp: Return JWT
        ClientApp->>ClientApp: Store JWT
        ClientApp-->>User: Redirect to Dashboard
    end
```

### 4.2. RBAC Implementation

Role-based access control will be implemented at multiple levels:

1. **JWT Claims**: User roles and high-level permissions encoded in JWT
2. **API Gateway**: Basic role validation at the gateway level
3. **Service-Level**: Fine-grained permission checks within each service
4. **UI Components**: Conditional rendering based on permissions

Permission structure will be hierarchical:
```
{
  "organization_id": "org_123",
  "role": "admin",
  "permissions": {
    "users": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    },
    "requests": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true,
      "approve": true
    },
    ...
  },
  "branches": ["branch_1", "branch_2"]
}
```

## 5. Payment Integration

### 5.1. Stripe Implementation

```mermaid
sequenceDiagram
    participant Client
    participant Supplier
    participant BillingService as Billing Service
    participant Stripe
    
    Client->>BillingService: Accept Bid/Quote
    BillingService->>Stripe: Create Invoice
    Stripe-->>BillingService: Return Invoice ID
    BillingService->>BillingService: Store Invoice in DB
    BillingService-->>Client: Send Invoice Link
    Client->>Stripe: Pay Invoice
    Stripe->>BillingService: Payment Succeeded Webhook
    BillingService->>BillingService: Calculate Commission
    BillingService->>Stripe: Create Transfer to Supplier (minus commission)
    Stripe-->>Supplier: Funds Transferred
    BillingService-->>Client: Payment Confirmation
    BillingService-->>Supplier: Payment Confirmation
```

### 5.2. Commission Handling

Commission calculation logic:
1. Base commission rate: 5%
2. Tiered volume discounts based on transaction history
3. Commission is deducted automatically before transferring funds to supplier
4. Commission reports available to both suppliers and platform admins

## 6. Observability & Monitoring

The system will implement a comprehensive observability stack:

```mermaid
graph TD
    Services[Microservices] -- Errors --> Sentry[Sentry]
    Services -- Logs --> BetterStack[BetterStack Telemetry]
    Services -- Metrics --> BetterStack
    Services -- User Events --> PostHog[PostHog Analytics]
    
    FrontendApps[Frontend Apps] -- Errors --> Sentry
    FrontendApps -- Performance --> Sentry
    FrontendApps -- User Events --> PostHog
    
    Infrastructure[Azure Resources] -- Resource Metrics --> AzureMonitor[Azure Monitor]
    
    Sentry --> Alerts[Alert System]
    BetterStack --> Alerts
    AzureMonitor --> Alerts
    
    Alerts --> Email[Email Notifications]
    Alerts --> Slack[Slack Notifications]
    
    Sentry --> Dashboards[Observability Dashboards]
    BetterStack --> Dashboards
    PostHog --> Dashboards
    AzureMonitor --> Dashboards
```

Key metrics to monitor:
- Error rates by service and endpoint
- API latency and throughput
- Database query performance
- Message queue length and processing time
- User engagement and conversion metrics
- Subscription and revenue metrics
- Infrastructure resource utilization

## 7. Deployment Architecture

The system will be deployed on Azure using the following components:

```mermaid
graph TD
    GitHub[GitHub Repository] --> Actions[GitHub Actions]
    Actions --> ACR[Azure Container Registry]
    
    ACR --> AKS[Azure Kubernetes Service]
    AKS --> FrontendServices[Frontend Applications]
    AKS --> BackendServices[Backend Services]
    
    BackendServices --> CosmosDB[Azure Cosmos DB]
    BackendServices --> PostgreSQL[Azure PostgreSQL]
    BackendServices --> ServiceBus[Azure Service Bus]
    BackendServices --> BlobStorage[Azure Blob Storage]
    
    AKS --> APIM[Azure API Management]
    APIM --> Internet[Internet]
    
    FrontendApps[Users] --> CDN[Azure CDN]
    CDN --> FrontendServices
    
    Terraform[Terraform] --> AzureResources[Azure Resources]
```

Deployment strategy:
- Containerized services deployed to AKS
- Blue/Green deployment for zero-downtime updates
- Infrastructure as Code using Terraform
- Automated CI/CD pipeline via GitHub Actions
- Environment promotion: Dev → Staging → Production

## 8. Technical Implementation Details

### Next.js & React Implementation

For frontend applications using Next.js 14 and React 19:

```mermaid
graph TD
    NextJSApp[Next.js App] --> AppRouter[App Router]
    NextJSApp --> ServerComponents[Server Components]
    NextJSApp --> ClientComponents[Client Components]
    
    AppRouter --> Routes[Routes & Layouts]
    ServerComponents --> DataFetching[Server-side Data Fetching]
    ServerComponents --> Rendering[Server-side Rendering]
    
    ClientComponents --> ClientState[Client-side State]
    ClientComponents --> Interactivity[Interactive UI Elements]
    
    DataFetching --> APIClient[API Client]
    ClientState --> Zustand[Zustand Store]
    
    APIClient --> TanStack[TanStack Query]
    TanStack --> BackendAPI[Backend API]
```

Key implementation details:
- Use React Server Components for data-fetching and initial rendering
- Use Client Components for interactive elements
- Implement Zustand for client-side state management
- Use TanStack Query for data fetching and caching
- Implement partial prerendering for optimal performance

### Microservice Implementation

Each microservice will follow this structure:

```
service-name/
├── src/
│   ├── api/             # API routes and handlers
│   ├── domain/          # Domain logic and models
│   ├── infrastructure/  # External dependencies and adapters
│   ├── repositories/    # Data access layer
│   └── services/        # Business logic
├── test/                # Test files
├── Dockerfile           # Container definition
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

Implementation guidelines:
- Use TypeScript for type safety
- Implement dependency injection for testability
- Use repository pattern for data access
- Implement circuit breakers for external dependencies
- Use structured logging
- Implement proper error handling and status codes

## 9. Testing Strategy

```mermaid
graph TD
    UnitTests[Unit Tests] --> Components[Components]
    UnitTests --> Services[Services]
    UnitTests --> Repositories[Repositories]
    
    IntegrationTests[Integration Tests] --> APIs[API Endpoints]
    IntegrationTests --> DBInteractions[Database Interactions]
    IntegrationTests --> ExternalServices[External Service Interactions]
    
    E2ETests[E2E Tests] --> UserFlows[User Flows]
    
    PerformanceTests[Performance Tests] --> LoadTesting[Load Testing]
    PerformanceTests --> StressTesting[Stress Testing]
    
    SecurityTests[Security Tests] --> Vulnerabilities[Vulnerability Scanning]
    SecurityTests --> PenTesting[Penetration Testing]
```

Test coverage requirements:
- Unit test coverage: 80%+ for critical business logic
- Integration test coverage: 70%+ for API endpoints
- E2E test coverage: All critical user flows
- Performance tests: Regular load and stress testing
- Security tests: Regular vulnerability scanning and penetration testing

## 10. Security Considerations

Security measures to implement:

1. **Authentication & Authorization**
   - JWT-based authentication with short expiry
   - Role-based access control
   - Multi-factor authentication
   - IP-based restrictions for admin access

2. **Data Protection**
   - Encryption at rest and in transit
   - PII data masking in logs
   - Data classification and access controls
   - Regular security audits

3. **API Security**
   - Rate limiting
   - CORS policies
   - Input validation
   - Output sanitization
   - API key management

4. **Infrastructure Security**
   - Network security groups
   - Private VNets for sensitive services
   - Regular security patching
   - Immutable infrastructure
   - Infrastructure as Code security scanning

5. **Compliance**
   - GDPR compliance
   - SOC 2 compliance
   - Regular security training for developers
   - Security incident response plan
