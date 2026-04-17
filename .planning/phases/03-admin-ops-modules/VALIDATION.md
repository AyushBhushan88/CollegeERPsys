# Phase 3 Validation: Administrative & Operational Modules

This document maps the success criteria of Phase 3 to specific automated tests and verification steps.

## Success Criteria Mapping

### 1. Fee Structure & Demand Management
**Criterion:** Admins can define fee structures and generate student-specific fee demands.
- **Service Logic:** `tests/fee.service.test.ts`
  - `it('should create a fee structure')`
  - `it('should generate demands for multiple students')`
- **API Endpoints:** `tests/fee.routes.test.ts`
  - `POST /api/fees/structures`
  - `POST /api/fees/generate-demands`
- **Verification Command:** `npm test tests/fee.service.test.ts tests/fee.routes.test.ts`

### 2. Online Payments & Receipts
**Criterion:** Students can pay fees online and receive automated PDF receipts with QR codes.
- **Payment Logic:** `tests/payment.service.test.ts`
  - `it('should create a Razorpay order')`
  - `it('should handle webhook and update demand status')`
- **Receipt Logic:** `tests/receipt.service.test.ts`
  - `it('should generate a PDF receipt with a QR code')`
- **API Endpoints:** `tests/payment.routes.test.ts`
  - `POST /api/payments/order`
  - `POST /api/payments/webhook`
  - `GET /api/payments/:paymentId/receipt`
- **Verification Command:** `npm test tests/payment.service.test.ts tests/receipt.service.test.ts tests/payment.routes.test.ts`

### 3. Faculty & HR Management
**Criterion:** Faculty can manage profiles and request leaves with multi-level approvals.
- **Service Logic:** `tests/hr.service.test.ts`
  - `it('should update faculty profile history')`
  - `it('should process leave request through approval chain')`
- **API Endpoints:** `tests/hr.routes.test.ts`
  - `PUT /api/hr/profile`
  - `POST /api/hr/leaves`
  - `PATCH /api/hr/leaves/:id`
- **Verification Command:** `npm test tests/hr.service.test.ts tests/hr.routes.test.ts`

### 4. Library Management System
**Criterion:** Library staff can manage a book catalog and track circulations/fines.
- **Catalog & ISBN:** `tests/lib.service.test.ts`
  - `it('should fetch metadata by ISBN')`
  - `it('should search books by title/author')`
- **Circulation & Fines:** `tests/lib.service.test.ts`
  - `it('should issue and return books')`
  - `it('should calculate fines correctly')`
- **API Endpoints:** `tests/lib.routes.test.ts`
  - `POST /api/lib/books`
  - `POST /api/lib/issue`
  - `POST /api/lib/return`
- **Verification Command:** `npm test tests/lib.service.test.ts tests/lib.routes.test.ts`

### 5. Institutional Calendar & Analytics
**Criterion:** Institutional calendar provides iCal (.ics) feed and Admin/Ops Analytics.
- **Calendar Logic:** `tests/calendar.service.test.ts`
  - `it('should generate valid iCal feed')`
- **Analytics Logic:** `tests/analytics.service.test.ts`
  - `it('should aggregate metrics from Fees, HR, and Library')`
- **API Endpoints:** `tests/calendar.routes.test.ts`, `tests/admin.routes.test.ts`
  - `GET /api/calendar/events/feed.ics`
  - `GET /api/admin/dashboard-summary`
- **Verification Command:** `npm test tests/calendar.service.test.ts tests/analytics.service.test.ts tests/calendar.routes.test.ts tests/admin.routes.test.ts`

## Automated Test Suite
To run all Phase 3 validations:
```bash
npm test tests/fee.* tests/payment.* tests/receipt.* tests/hr.* tests/lib.* tests/calendar.* tests/analytics.* tests/admin.*
```
