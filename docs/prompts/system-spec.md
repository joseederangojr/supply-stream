## Procurement System Specification

A modern procurement platform built as a **microservices** Turborepo monorepo, with separate Next.js 14 + React 19 front-ends for Admin, Client, and Supplier. It supports rich procurement requests, item-level bidding and comments, in-app chat, map visualizations, seat-based subscriptions, bid-credit limits, Stripe-powered invoicing/payment with automatic commission capture, and robust observability (Sentry, BetterStack telemetry, PostHog). Clients and Suppliers can invite users via email and manage branches. Commission is set at 5% starting rate with volume tiers. Bid-credits per plan ensure balanced usage and additional revenue. Invoices generated through the billing-service use Stripe Invoicing and Connect for automatic fund splits. All services deploy on Azure with Docker, AKS, and IaC.

---

## 1. Platform Overview  
Build a **multi-tenant, microservices-based** procurement SaaS with three distinct front-end apps (Admin / Client / Supplier) and a set of back-end services, all coordinated via a **Turborepo** monorepo.

---

## 2. User Roles & Key Features  

### 2.1 Admin  
- **User & Team Management**: Invite/remove users via email; assign fine-grained roles and permissions across companies and branches.  
- Manage branches, tiers, seat limits, bid-credit allowances, and commission rates.  
- Approve or suspend Clients & Suppliers; grant “verified” badge.  
- View global dashboards for analytics, revenue, and supplier commissions.  
- Configure subscription tiers, overage fees, and bid-credit packs.

### 2.2 Client (Company)  
- **Team & User Management**:  
  - Invite colleagues by email; roles include Request-Creator, Approver, Viewer.  
- **Procurement Requests**:  
  - Create requests with multiple **items**: name, unit, quantity, budget, special instructions, and a “supplier-can-attach” toggle per item.  
  - Metadata: title, description, total budget, urgency, delivery address (street, city, postal code, country + geo-coordinates).  
- **Branches**:  
  - Tiered limits: Basic = 1, Professional = 5, Business = unlimited.  
- **Bidding Workflow**:  
  - View supplier bids, item-level Q&A threads, comments, and real-time in-app chat.  
- **Maps**:  
  - Display delivery location and overlay supplier branch pins on an embedded map.  
- **Verification**:  
  - Optional “verified” status for higher search placement.  
- **Payment to Suppliers**:  
  - Clients can pay suppliers/vendors directly via Stripe after agreeing to a bid/quote.  
  - Payments are processed using Stripe's payment gateway, and clients can pay in full or in installments.

### 2.3 Supplier (Vendor)  
- **Team & User Management**:  
  - Invite teammates via email; roles: Bidder, Negotiator, Viewer.  
- Browse/filter open requests by urgency, budget, industry, proximity.  
- Submit bids on entire requests or individual items; post comments and use in-app chat.  
- Upload files per item if client allows via toggle.  
- **Branches**:  
  - Same tier limits as clients.  
- **Maps**:  
  - View delivery location versus your branch locations.  
- **Verification**:  
  - Earn “verified” badge for priority listing.

---

## 3. Data Models & Additional Data Fields  

### 3.1 Common Profile Data (Client & Supplier)  
- Company name, legal registration number, Tax/VAT ID  
- Headquarters address + geo-coordinates (lat/long)  
- Industry vertical(s) + NAICS/SIC codes  
- Company size (# employees, revenue band), years in business  
- Corporate logo, website URL, social links  
- Primary contacts: name, title, email, phone, timezone  
- Payment terms (Net 30, Net 60), supported currencies  
- Credit rating (3rd-party integration), certifications & compliance

### 3.2 Procurement Item Data Fields  
- Item ID / SKU (unique)  
- Description (text)  
- Product Category (e.g. Electronics, Office Supplies)  
- Unit of Measure (pcs, kg, liter)  
- Manufacturer / Brand + Part Number  
- Lead Time (days), weight & dimensions  
- Bill of Materials (if assembly)  
- Unit Cost / Price; available inventory; MOQ; reorder point  
- Approved suppliers list; substitute items  
- Custom attributes (regulatory codes, safety standards)

### 3.3 Procurement Request Data Fields  
- Requisition Number (system-generated)  
- Title / Subject; Description / Purpose  
- Requestor details (name, department, contact)  
- Date created; desired delivery / due date  
- Delivery address + geo-coordinates  
- Total budget / estimated cost; cost center / project code  
- Urgency level (Low/Medium/High)  
- Approval hierarchy (approvers, sign-off order)  
- Status (Draft, Pending, Approved, Rejected)  
- Supporting documents (attachments at request level)  
- Comments / internal notes; map data (pins for delivery + bids)

---

## 4. Procurement Request & Mapping  
1. **Delivery Address**:  
   Street, city, postal code, country + geo-coordinates for routing.  
2. **Map View**:  
   Pin delivery location; overlay supplier branch pins; cluster or heatmap for density.  
3. **Distance & ETA**:  
   Auto-calculate straight-line distance and travel time estimates.

---

## 5. Collaboration & In-House Chat  
Embedding real-time chat per request and per item provides central, contextual communication, reducing email overhead and accelerating decisions.

### 5.1 Benefits  
- **Centralized Communication** tied to requests/items.  
- **Instant Q&A** replaces fragmented emails.  
- **Auditability**: threaded chat preserves full history.  
- **Engagement**: read receipts & typing indicators.

### 5.2 Features  
1. **Threaded Conversations** at request and item levels.  
2. **Rich Text & Attachments** (markdown, images, conditional file uploads).  
3. **Read Receipts & Typing Indicators**.  
4. **Search & Filtering**: keyword, date, participant.  
5. **Configurable Notifications**: email, in-app, push.  
6. **Archiving & Export**: admin logs for audits.  
7. **Analytics Dashboard**: chat volume, response times in PostHog.

---

## 6. Architecture & Tech Stack  

### 6.1 Front-end Apps (Turborepo)  
- **Next.js 14** for full-stack React with App Router, Server Actions, and partial prerendering.  
- **React 19** with built-in async transitions for pending states and optimistic updates.  
- **UI**: shadcn/ui for glassmorphic, fully transparent, customizable components.  
- **State**: Zustand – small, hook-based, minimal boilerplate.  
- **Data Fetching**: TanStack Query – declarative server state management.  
- **Auth**: Clerk – embeddable UIs, secure auth, prebuilt components.  
- **Routing & Middleware**: Hono – ultrafast Web-Standards framework for Node.js and edge.  

Structure:  
```
/apps/admin-ui  
/apps/client-ui  
/apps/supplier-ui  
/apps/auth-ui
```  

### 6.2 Back-end Services (Turborepo)  
- Services in `/services/`: auth-service, user-service, procurement-service, bidding-service, billing-service, analytics-service, notification-service, geolocation-service.  
- **Database Access**: Kysely – TypeSafe SQL builder for PostgreSQL, MySQL, etc.  
- **API Style**: REST or lightweight RPC.  
- **Messaging**: Azure Service Bus or Event Grid.  
- **Storage**: Azure Blob Storage for file uploads.  
- **CI/CD**: Azure DevOps or GitHub Actions.

---

## 7. Observability & Analytics  
- **Monitoring**: Sentry for error tracking & performance monitoring.  
- **Logging & Telemetry**: BetterStack Telemetry API for logs & metrics.  
- **Product Analytics**: PostHog for funnels, retention, session replay.  
- **Infra Metrics**: Azure Monitor for resource health and autoscaling triggers.

---

## 8. Scalability & Deployment  
- **Containerization**: Docker for each service.  
- **Orchestration**: Azure Kubernetes Service (AKS) or Azure Functions for serverless.  
- **Auto-scaling**: CPU/memory and queue length-based rules.  
- **Infrastructure as Code**: Terraform or Azure Bicep.

---

## 9. Monetization & Pricing  

### 9.1 Seat-Based Subscriptions  
| Tier               | Branches    | Seats Included      | Overage Seat Fee |  
|--------------------|-------------|---------------------|------------------|  
| **Basic**          | 1           | 1 active user       | $X per user      |  
| **Professional**   | Up to 5     | Up to 10 active     | $Y per user      |  
| **Business**       | Unlimited   | Unlimited           | N/A              |  

- Active-seat billing via Stripe quantity.

### 9.2 Transaction Commission  
- **Base Take-Rate**: 5% of supplier’s quote; tiered volume discounts.

### 9.3 Bid-Credits & Limits  
| Tier             | Monthly Bid Credits | Overage Fee/Credit |  
|------------------|---------------------|--------------------|  
| **Basic**        | 10                  | $2                 |  
| **Professional** | 50                  | $1.50              |  
| **Business**     | Unlimited           | N/A                |  

- Credits consumed per bid; unused credits expire monthly.

### 9.4 Add-Ons  
- API access, White-labeling, Premium Analytics, Mobile SDK.

---

## 10. Invoice Management & Stripe Payment Flow  

1. **Invoice Generation**: billing-service uses Stripe Invoicing API to generate/send invoices.  
2. **Payment to Suppliers**: Clients can pay suppliers/vendors directly via Stripe. Payments can be processed in full or in installments based on the agreed bid/quote.  
3. **Commission Capture**: Commission line-item = quote × rate.  
4. **Payouts**: Supplier receives full payment minus the platform’s commission.  
5. **Webhooks**: `invoice.payment_succeeded` / `failed` update status and trigger supplier payout.  
6. **Reporting**: Store invoice PDFs/metadata; offer CSV export and dashboard charts; reconcile via Stripe Sigma.

---

## 11. Advanced Analytics & Dashboards

### 11.1 Real-Time Spend Dashboard  
- Visualize spend by category, supplier, branch, and time period to surface cost-saving opportunities.

### 11.2 Supplier Performance Scorecards  
- Track lead times, on-time delivery, quality metrics, and response times to drive continuous improvement.

---

## 12. Security & Identity Management  

### 12.1 Enterprise SSO & SCIM  
- Support **SAML** or **OpenID Connect** for SSO and automated user provisioning.

### 12.2 Role-Based Access Control (RBAC)  
- Fine-grained permissions on data objects, with **MFA** options for sensitive roles.

### 12.3 Audit Logs & Data Encryption  
- Immutable logs of all user actions; **end-to-end encryption** at rest and in transit.

---

## 13. Testing & Documentation

- **Unit Tests**: For individual components and services.  
- **Integration Tests**: Test interactions between services and databases.  
- **E2E Tests**: Simulate real-world user flows across front-end apps and back-end services.  
- **API Documentation**: Auto-generated RESTful API docs using **Swagger/OpenAPI**.

---

Let me know if you need further adjustments!
