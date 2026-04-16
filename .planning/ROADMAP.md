# Roadmap: College ERP System

## Phases

- [x] **Phase 1: Multi-tenant Foundation & SIS** - Establish core multi-tenant architecture and primary student records.
- [x] **Phase 2: Academic Core & OBE Engine** - Manage teaching-learning processes and outcome-based assessment.
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
**Goal**: Manage teaching-learning processes and outcome-based assessment (OBE).
**Depends on**: Phase 1
**Requirements**: ATT-01, ATT-02, ATT-03, ATT-04, ATT-05, EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, EXAM-06, TT-01, TT-02, TT-03, CRS-01, CRS-02, CRS-03, CRS-04
**Success Criteria**:
  1. Admins can manage a versioned course catalog with CO-PO mapping.
  2. Faculty can mark attendance and view shortage reports.
  3. The system can schedule exams and generate hall tickets with eligibility checks.
  4. Students can register for courses and view their personalized timetables.
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md — Course & Curriculum Management + OBE Engine (CRS)
- [x] 02-02-PLAN.md — Attendance Management System (ATT)
- [x] 02-03-PLAN.md — Timetable & Scheduling (TT)
- [x] 02-04-PLAN.md — Examination Management & Grade Engine (EXAM)

### Phase 3: Administrative & Operational Modules
**Goal**: Digitise supporting institutional functions (Finance, HR, Library, Calendar).
**Depends on**: Phase 2
**Requirements**: FEE-01, FEE-02, FEE-03, FEE-04, FEE-05, HR-01, HR-02, HR-03, LIB-01, LIB-02, LIB-03, COM-02
**Success Criteria**:
  1. Admins can define fee structures and generate student-specific fee demands.
  2. Students can pay fees online and receive automated PDF receipts with QR codes.
  3. Faculty can manage profiles and request leaves with multi-level approvals.
  4. Library staff can manage a book catalog and track circulations/fines.
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 03-01-PLAN.md — Fee Structure & Demand Management
- [ ] 03-02-PLAN.md — Payment Gateway Integration & Receipt Generation
- [ ] 03-03-PLAN.md — Faculty & HR Management
- [ ] 03-04-PLAN.md — Library Management System (Catalog, Circulation, Fines)

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Multi-tenant Foundation & SIS | 6/6 | Completed | 2026-04-15 |
| 2. Academic Core & OBE Engine | 4/4 | Completed | 2026-04-16 |
| 3. Administrative & Operational Modules | 0/4 | Not started | - |
| 4. Advanced Analytics & Compliance Reporting | 0/1 | Not started | - |
