# Domain Pitfalls: College ERP

**Domain:** Higher Education Enterprise Resource Planning
**Researched:** 2024-04-14

## Critical Pitfalls

### Pitfall 1: Tenant Data Leakage (The "SaaS Killer")
**What goes wrong:** A student from College A can see fees or results of a student from College B.
**Why it happens:** Most Node.js developers use connection pools. If a connection is returned to the pool with a tenant's session variable still set, the next request using that connection might inherit the previous tenant's identity.
**Prevention:** 
1. Always use `SET LOCAL` within a transaction (it resets on commit/rollback).
2. Use `AsyncLocalStorage` to maintain request-scoped tenant context.
3. Test with a "chaos" script that makes concurrent requests for different tenants.

### Pitfall 2: Audit Trail Inconsistency
**What goes wrong:** DVV (Data Validation) finds marks in the ERP that don't match the original answer sheet, and there's no record of who changed them.
**Why it happens:** Traditional CRUD operations over-write data without versioning or history.
**Prevention:**
1. Implement **immutable event logs** for all marks and result changes.
2. Use triggers or application-level "Audit Service" to log: (user_id, table, record_id, old_val, new_val, timestamp).

### Pitfall 3: CO-PO Attainment Calculation Gaps
**What goes wrong:** The NBA SAR report shows 100% attainment for all students, which looks suspicious to auditors.
**Why it happens:** The calculation logic doesn't account for indirect attainment (surveys) or doesn't allow for "Gaps" (real-world deviations).
**Prevention:**
1. Ensure the OBE engine includes both Direct (Marks) and Indirect (Surveys) components.
2. Allow for "target" setting and identification of non-attainment.

## Moderate Pitfalls

### Pitfall 4: Subdomain vs Header for Tenant Discovery
**What goes wrong:** SSL/CORS issues if using subdomains (`college-a.erp.com`) vs simple headers.
**Prevention:** Use subdomains for cleaner URL structure but ensure wildcard SSL certificates and CORS middleware are configured early.

## Minor Pitfalls

### Pitfall 5: Library Catalog Performance
**What goes wrong:** Search for "Engineering Physics" takes 5 seconds.
**Why it happens:** Simple `ILIKE %query%` on 50,000+ books with no indexing.
**Prevention:** Use GIN indexes or trigram search in PostgreSQL from Day 1.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation | RLS Bypass | Ensure the application user is NOT a superuser/owner. |
| SIS | PII Exposure | Encrypt Aadhaar/Personal IDs at rest using `pgcrypto`. |
| Compliance | Broken Evidence Links | Use UUIDs for files and ensure soft-deletes for metadata. |

## Sources

- [PostgreSQL Row Level Security (RLS) Pitfalls - dev.to]
- [DVV Best Practices - NAAC Official Guidelines]
