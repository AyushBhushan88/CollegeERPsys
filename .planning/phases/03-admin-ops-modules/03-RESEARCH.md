# Phase 3: Admin & Ops Modules - Research

**Researched:** 2024-05-24
**Domain:** Administrative & Operational Modules (Fee, HR, Library, Calendar)
**Confidence:** MEDIUM

## Summary

This phase implements Fee Management, HR/Faculty Profiles, Library Management, and Shared Calendars. The architecture will rely on the existing multi-tenant MongoDB setup (`mongooseTenantIsolation`), leveraging third-party APIs for payments (Razorpay/Stripe) and iCal standard generation (`ical-generator`) for calendars. We will use `pdfmake` and `qrcode` (already in `package.json` or verified available) for secure PDF receipts.

**Primary recommendation:** Integrate Razorpay/Stripe securely with webhook endpoints for payment verification. Use a `FeeDemands` collection to track individual student balances separate from base `FeeStructures`. Maintain strict multi-tenant isolation using the existing mongoose plugin.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEE-01 | Configurable fee structures | FeeStructure and FeeDemand schema design |
| FEE-02 | Online payment (Razorpay/Stripe) | Razorpay/Stripe Node.js SDKs |
| FEE-03 | PDF receipt with QR code | `pdfmake` and `qrcode` libraries |
| FEE-04 | Defaulter tracking | Scheduled jobs via existing BullMQ setup |
| FEE-05 | Scholarships/concessions | Concession arrays within FeeDemands |
| HR-01 | Detailed faculty profiles | Faculty collection extension |
| HR-02 | Leave management with approvals | LeaveRequest schema with approval workflows |
| HR-03 | workload analysis | Aggregation pipelines on Timetable/Faculty |
| LIB-01 | Book catalog with ISBN lookup | ISBN API integration, Book collection |
| LIB-02 | Circulation and fines | Circulation and Fine schemas |
| LIB-03 | Reservation system | Reservation queues in MongoDB |
| COM-02 | Shared institutional calendar | `ical-generator` for standard iCal feeds |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| razorpay | 2.9.6 | Payments | Official SDK for India-centric fee collection |
| stripe | 22.0.1 | Payments | Global payment gateway |
| pdfmake | 0.3.7 | Document Gen | Complex PDF receipts (existing in package.json) |
| qrcode | 1.5.4 | QR Generation | Receipt verification codes |
| ical-generator | 10.1.0 | Calendars | Robust iCal feed generation |
| bullmq | 5.74.1 | Task Queues | Daily fine and defaulter calculations (existing) |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── models/
│   ├── FeeStructure.ts
│   ├── FeeDemand.ts
│   ├── Payment.ts
│   ├── LeaveRequest.ts
│   ├── Book.ts
│   └── Circulation.ts
├── services/
│   ├── fee.service.ts
│   ├── hr.service.ts
│   ├── lib.service.ts
│   └── calendar.service.ts
└── routes/
    ├── fee.routes.ts
    ├── hr.routes.ts
    ├── lib.routes.ts
    └── calendar.routes.ts
```

### Pattern 1: Fee Demands over Hardcoded Structures
**What:** Link students to templates (`FeeStructures`) but store actual payable amounts and applied concessions in a separate `FeeDemands` collection.
**When to use:** Managing variable fee concessions and dynamic penalties without bloating fee structure definitions.

### Pattern 2: Workflow History Embeds
**What:** Embed the approval chain history (HOD -> HR) directly inside the `LeaveRequest` document rather than a separate collection.
**When to use:** When the audit history of a workflow is always accessed in the context of the primary document.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Payment Processing | Custom PG integrations | Razorpay / Stripe SDKs | Security, compliance, webhook reliability |
| iCal generation | String concatenation | `ical-generator` | Strict RFC 5545 compliance |
| PDF Layouts | HTML-to-PDF via Puppeteer | `pdfmake` | Lower resource usage than headless browsers |

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None (Greenfield modules) | Create new MongoDB collections |
| Live service config | Razorpay/Stripe keys | Add to environment and config schemas |
| OS-registered state | BullMQ cron jobs | Register daily fine calculation workers |
| Secrets/env vars | None existing for PG | Require RAZORPAY_KEY, STRIPE_KEY in `.env` |
| Build artifacts | None | None |

## Common Pitfalls

### Pitfall 1: Webhook Race Conditions
**What goes wrong:** Payment status is updated by user redirect AND webhook simultaneously, causing double entries.
**Why it happens:** Lack of idempotency keys in payment processing.
**How to avoid:** Use database-level locks or transactional updates when processing payment confirmations.

### Pitfall 2: Accidental Cross-Tenant Leaks
**What goes wrong:** Queries for Library books or Fee Demands return data from other colleges.
**How to avoid:** Ensure `mongooseTenantIsolation` plugin is applied to every new schema created in this phase.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | 20+ | — |
| MongoDB | Data layer | ✓ | 6+ | — |
| Redis | BullMQ/Cache | ✓ | 7+ | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest |
| Config file | `vitest.config.ts` (implied by package.json scripts) |
| Quick run command | `npm test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEE-01 | Fee calculation | unit | `vitest run tests/fee.service.test.ts` | ❌ Wave 0 |
| HR-02 | Leave approval workflow | unit | `vitest run tests/hr.service.test.ts` | ❌ Wave 0 |

## Sources

### Primary (HIGH confidence)
- Local `package.json` for existing libraries (`pdfmake`, `bullmq`, `mongoose`).
- `src/plugins/mongooseIsolation.ts` for tenant isolation enforcement.

### Secondary (MEDIUM confidence)
- MongoDB Schema design patterns for Fee/HR Systems (WebSearch)
