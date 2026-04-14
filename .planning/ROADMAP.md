# Roadmap: College ERP System

## Phases

- [ ] **Phase 1: Multi-tenant Foundation & SIS** - Establish core multi-tenant architecture and primary student records.
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
- [ ] 01-01-PLAN.md — Multi-tenant Backend Foundation (Infrastructure + Isolation)
- [ ] 01-02-PLAN.md — Multi-tenant Auth Service (Auth + RBAC)
- [ ] 01-03-PLAN.md — SIS Core Service (Profiles + Search)
- [ ] 01-04-PLAN.md — Evidence Vault (MinIO + Metadata)
- [ ] 01-05-PLAN.md — Bulk Import Service (CSV/Excel)
- [ ] 01-06-PLAN.md — Frontend Foundation (Next.js + Auth UI)

### Phase 2: Academic Core & OBE Engine
**Goal**: Implement the core academic workflows including curriculum, attendance, scheduling, and examinations with OBE support.
**Depends on**: Phase 1
**Requirements**: CRS-01, CRS-02, CRS-03, CRS-04, ATT-01, ATT-02, ATT-03, ATT-04, ATT-05, TT-01, TT-02, TT-03, EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, EXAM-06
**Success Criteria** (what must be TRUE):
  1. Faculty can mark attendance and view real-time shortage alerts for their subjects.
  2. The system generates a clash-free master timetable based on room and faculty constraints.
  3. Students can register for elective courses and view their personalized schedules.
  4. The OBE Engine correctly maps exam marks to Course Outcomes (COs) and Program Outcomes (POs).
  5. Exam Cell can publish results, and students can download their transcripts.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Administrative & Operational Modules
**Goal**: Automate financial, HR, and library operations to centralize institutional management.
**Depends on**: Phase 1
**Requirements**: FEE-01, FEE-02, FEE-03, FEE-04, FEE-05, HR-01, HR-02, HR-03, LIB-01, LIB-02, LIB-03, COM-02
**Success Criteria** (what must be TRUE):
  1. Students can pay fees online and receive a QR-coded receipt instantly.
  2. Accounts staff can identify fee defaulters and send automated reminders.
  3. Faculty can apply for leave and track their workload through their dashboard.
  4. Librarians can manage book circulation (issue/return) with automated fine calculation.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Advanced Analytics & Compliance Reporting
**Goal**: Deliver actionable intelligence and automated reports for accreditation bodies.
**Depends on**: Phase 2, Phase 3
**Requirements**: RPT-01, RPT-02, RPT-03
**Success Criteria** (what must be TRUE):
  1. Principal/Director can view real-time institutional KPIs (enrollment, pass %, collection) on a unified dashboard.
  2. The Compliance Engine generates a draft NAAC SSR or NBA SAR report from live system data.
  3. Admins can build custom reports using a drag-and-drop interface and export them to multiple formats.
**Plans**: TBD
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Multi-tenant Foundation & SIS | 0/6 | Not started | - |
| 2. Academic Core & OBE Engine | 0/1 | Not started | - |
| 3. Administrative & Operational Modules | 0/1 | Not started | - |
| 4. Advanced Analytics & Compliance Reporting | 0/1 | Not started | - |
