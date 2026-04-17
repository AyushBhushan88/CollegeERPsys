# Domain Pitfalls: College ERP

**Domain:** Higher Education Enterprise Resource Planning
**Researched:** 2024-05-22
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: NoSQL Injection in Custom Reports
**What goes wrong:** A user provides a malicious operator (e.g., `$where`) in a report definition, causing data leakage or remote code execution.
**Prevention:**
1. **Zod Validation:** Strictly validate the keys and operators in the `ReportDefinition` JSON.
2. **Whitelist Operators:** Allow only a small subset of safe operators (`$eq`, `$gt`, `$in`, etc.) for user-defined filters.
3. **Implicit `tenantId`:** Always force a `{ $match: { tenantId } }` stage as the very first stage in the pipeline.

### Pitfall 2: Audit Trail Inconsistency
**What goes wrong:** DVV (Data Validation) finds marks in the ERP that don't match the original answer sheet, and there's no record of who changed them.
**Why it happens:** Traditional CRUD operations overwrite data without history.
**Prevention:**
1. **Audit Logs:** Use Mongoose middleware to log every update: `(user, collection, docId, changes, timestamp)`.
2. **Immutability:** Marks, once submitted, should only be changeable via a "Request/Approve" workflow with a versioned trail.

### Pitfall 3: CO-PO Attainment Calculation Gaps
**What goes wrong:** The NBA SAR report shows 100% attainment for all students, which looks suspicious to auditors.
**Why it happens:** The calculation doesn't account for "indirect attainment" (surveys) or doesn't allow for identifying "non-attainment" areas.
**Prevention:**
1. Ensure the OBE engine includes both Direct (Marks) and Indirect (Surveys) components.
2. Allow for custom "target" levels for different programs.

## Moderate Pitfalls

### Pitfall 4: Memory Bloat in Reports
**What goes wrong:** Large PDF/Excel reports cause the Node.js process to crash (OOM).
**Why it happens:** Attempting to load 10,000+ student records into an array before processing.
**Prevention:**
1. **Streaming:** Use MongoDB cursors and stream results directly to the response or a file.
2. **BullMQ:** Offload report generation to a background worker and notify the user when ready.

### Pitfall 5: Broken Evidence Links
**What goes wrong:** During a NAAC visit, a link to a "PhD Certificate" leads to a 404.
**Prevention:**
1. Use UUIDs for MinIO filenames.
2. Implement soft-deletes for evidence metadata to prevent accidental link breakage.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation | Tenant Leakage | Test with a "chaos" script that makes concurrent requests for different tenants. |
| SIS/HRMS | PII Exposure | Strictly control access to Aadhaar/Bank details using RBAC. |
| Reports | Aggregation Timeout | Add a max execution time to custom report aggregations. |

## Sources

- [MongoDB Security Best Practices]
- [NAAC Data Validation and Verification (DVV) Manual]
- [OWASP NoSQL Injection Prevention Cheat Sheet]
