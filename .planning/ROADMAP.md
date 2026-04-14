# Roadmap: College ERP System

## Phases

- [x] **Phase 1: Multi-tenant Foundation & SIS** - Establish core multi-tenant architecture and primary student records.
- [ ] **Phase 2: Academic Core & OBE Engine** - Manage teaching-learning processes and outcome-based assessment.
- [ ] **Phase 3: Administrative & Operational Modules** - Digitise supporting institutional functions (Finance, HR, Library).
- [ ] **Phase 4: Advanced Analytics & Compliance Reporting** - Provide high-level insights and automated accreditation support.

---

## Phase Details

### Phase 1: Multi-tenant Foundation & SIS
**Goal**: Establish a secure, isolated multi-tenant environment and the core Student Information System.
**Depends on**: None
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, SIS-01, SIS-02, SIS-03, SIS-04, SIS-05, COM-01, COM-03
**Success Criteria** (what must be TRUE):
  1. Super Admin can create a new tenant (college) and provision an Admin user.
  2. Users can only access data belonging to their specific tenant (verified via MongoDB tenant filters).
  3. Admins can bulk-import 1,000+ students and verify their uploaded documents in the Evidence Vault.
  4. Students can log in and manage their multi-tenant profiles securely.
**Plans**: 6 plans
**UI hint**: yes

Plans:
- [x] 01-01-PLAN.md — Multi-tenant Backend Foundation (Infrastructure + Isolation)
- [x] 01-02-PLAN.md — Multi-tenant Auth Service (Auth + RBAC)
- [x] 01-03-PLAN.md — SIS Core Service (Profiles + Search)
- [x] 01-04-PLAN.md — Evidence Vault (MinIO + Metadata)
- [x] 01-05-PLAN.md — Bulk Import Service (CSV/Excel)
- [x] 01-06-PLAN.md — Frontend Foundation (Next.js + Auth UI)

### Phase 2: Academic Core & OBE Engine
...
---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Multi-tenant Foundation & SIS | 6/6 | Completed | 2026-04-15 |
| 2. Academic Core & OBE Engine | 0/1 | Not started | - |
| 3. Administrative & Operational Modules | 0/1 | Not started | - |
| 4. Advanced Analytics & Compliance Reporting | 0/1 | Not started | - |
