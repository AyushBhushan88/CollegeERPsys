# Software Requirements Specification (SRS)
# College ERP System

---

| Field                | Value                              |
|----------------------|------------------------------------|
| **Document Version** | 1.0                               |
| **Date**             | 2026-04-14                        |
| **Status**           | Draft                             |
| **Standard**         | IEEE 830-1998 / ISO/IEC 29148     |
| **Reference**        | PRD v1.0 — College ERP System     |

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the functional and non-functional software requirements for the **College ERP System**. It serves as the binding contract between stakeholders and the development team, guiding architecture, implementation, testing, and acceptance.

### 1.2 Scope
The system encompasses the following subsystems:
- Authentication & Authorization
- Student Information System
- Admission Management
- Attendance Management
- Timetable & Scheduling
- Examination Management
- Fee & Finance Management
- Course & Curriculum Management
- Faculty & HR Management
- Library Management
- Communication & Notifications
- Reports & Analytics
- Placement Management (v2)
- Hostel Management (v2)

### 1.3 Definitions & Acronyms

| Term      | Definition                                                    |
|-----------|---------------------------------------------------------------|
| ERP       | Enterprise Resource Planning                                  |
| SIS       | Student Information System                                    |
| RBAC      | Role-Based Access Control                                     |
| CO / PO   | Course Outcome / Program Outcome                              |
| NAAC      | National Assessment and Accreditation Council                 |
| NBA       | National Board of Accreditation                               |
| JWT       | JSON Web Token                                                |
| OTP       | One-Time Password                                             |
| PWA       | Progressive Web Application                                   |
| CRUD      | Create, Read, Update, Delete                                  |
| SLA       | Service Level Agreement                                       |
| DPDP      | Digital Personal Data Protection (Act 2023)                   |
| PII       | Personally Identifiable Information                           |
| ETL       | Extract, Transform, Load                                      |

### 1.4 References
- PRD v1.0 — College ERP System
- AICTE Approval Process Handbook
- UGC Regulations on Maintenance of Standards
- NAAC Assessment & Accreditation Framework
- OWASP Top 10 (2021)
- WCAG 2.1 Guidelines

---

## 2. Overall Description

### 2.1 Product Perspective
The College ERP is a standalone, self-hosted or cloud-deployed web application. It is not a component of a larger system but provides integration hooks for external services (payment gateways, SMS providers, university portals).

### 2.2 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Browser  │  │  Mobile  │  │  PWA     │  │  Admin CLI │  │
│  │  (React)  │  │  (PWA)   │  │  (SW)    │  │  (Scripts) │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └──────────────┴─────────────┴──────────────┘         │
│                          HTTPS / WSS                        │
├─────────────────────────────────────────────────────────────┤
│                      API GATEWAY / BFF                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Rate Limiter │ Auth Middleware │ Request Validator    │  │
│  └────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     APPLICATION TIER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Auth     │ │ Student  │ │ Academic │ │ Finance      │   │
│  │ Service  │ │ Service  │ │ Service  │ │ Service      │   │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤   │
│  │ HR       │ │ Library  │ │ Exam     │ │ Notification │   │
│  │ Service  │ │ Service  │ │ Service  │ │ Service      │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       DATA TIER                             │
│  ┌────────────┐  ┌───────┐  ┌─────────────┐  ┌──────────┐  │
│  │ PostgreSQL │  │ Redis │  │ MinIO / S3  │  │ Elastic  │  │
│  │ (Primary)  │  │(Cache)│  │ (Files)     │  │ search   │  │
│  └────────────┘  └───────┘  └─────────────┘  └──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE TIER                       │
│  Docker │ Kubernetes │ CI/CD │ Prometheus │ Grafana │Sentry │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 User Classes

| Class        | Access Level                                        | Auth Method         |
|--------------|-----------------------------------------------------|---------------------|
| Super Admin  | Full system access                                  | Username + MFA      |
| Admin        | Module-scoped admin (e.g., Exam Admin, Fee Admin)   | Username + Password  |
| HOD          | Department data + approval workflows                | Institutional SSO   |
| Faculty      | Own courses, attendance, grades, leaves              | Institutional SSO   |
| Student      | Own profile, fees, results, attendance               | Email/Phone + OTP   |
| Parent       | Read-only view of ward's data                        | Phone + OTP         |
| Staff        | Module-specific (library, accounts, placement)       | Username + Password  |

### 2.4 Operating Environment
- **Server**: Linux (Ubuntu 22.04+) with Docker runtime
- **Database**: PostgreSQL 15+
- **Browser**: Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- **Min Resolution**: 360px (mobile) to 1920px (desktop)

### 2.5 Assumptions & Dependencies
1. The college has a stable internet connection (≥10 Mbps).
2. Institutional email domain is available for SSO.
3. Payment gateway merchant account is pre-approved.
4. SMS credits are procured from a gateway vendor.
5. Biometric/RFID hardware (if used) supports webhook or REST API.

---

## 3. Functional Requirements

### 3.1 Module: Authentication & Authorization

#### FR-AUTH-001: User Registration
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-AUTH-001                                                           |
| **Priority**| Must Have                                                             |
| **Input**   | Name, email, phone, role, department, password                        |
| **Process** | Validate input → Hash password (bcrypt, cost=12) → Store user → Send verification email |
| **Output**  | User account created; verification email sent                         |
| **Rules**   | Email must be unique. Password min 8 chars, 1 uppercase, 1 number, 1 special char. |

#### FR-AUTH-002: Login
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-AUTH-002                                                           |
| **Priority**| Must Have                                                             |
| **Input**   | Email/username + password (or OTP for students/parents)               |
| **Process** | Validate credentials → Issue JWT (access + refresh tokens)            |
| **Output**  | Access token (15min TTL), refresh token (7d TTL), redirect to role-based dashboard |
| **Rules**   | Lock account after 5 failed attempts (30min cooldown). Log all attempts. |

#### FR-AUTH-003: Role-Based Access Control
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-AUTH-003                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Every API endpoint and UI route is protected by role + permission checks. |
| **Rules**   | Permissions are granular (e.g., `attendance:mark`, `exam:publish_result`). Roles are composable. Super Admin can create custom roles. |

#### FR-AUTH-004: Password Reset
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-AUTH-004                                                           |
| **Priority**| Must Have                                                             |
| **Process** | Request reset → Send OTP/link (expires in 15min) → Validate → Update password |

#### FR-AUTH-005: Session Management
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-AUTH-005                                                           |
| **Priority**| Must Have                                                             |
| **Rules**   | Max 3 concurrent sessions per user. Idle timeout = 30 min. Force logout from all devices. |

---

### 3.2 Module: Student Information System

#### FR-SIS-001: Student Profile Management
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-SIS-001                                                           |
| **Priority**| Must Have                                                             |
| **Description** | CRUD operations on student profiles.                              |
| **Fields**  | Name, DOB, gender, category (Gen/OBC/SC/ST), contact info, address, guardian details, photo, admission number, enrollment number, branch, section, batch, year of admission |
| **Rules**   | Admission number is auto-generated and immutable. Photo must be ≤ 2MB, JPEG/PNG. |

#### FR-SIS-002: Document Upload
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-SIS-002                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Students upload identity/academic documents for verification.     |
| **Accepted Formats** | PDF, JPEG, PNG — max 5MB per file                           |
| **Workflow** | Upload → Pending → Verified / Rejected (by admin with remarks)      |

#### FR-SIS-003: Student Search & Filtering
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-SIS-003                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Full-text search across name, admission number, enrollment number. Filter by branch, batch, section, year, category. |
| **Performance** | Results within 500ms for datasets up to 50,000 students.         |

#### FR-SIS-004: Bulk Import / Export
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-SIS-004                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Import student data from Excel/CSV. Export filtered student lists. |
| **Rules**   | Validate every row; return error report for invalid entries. Max 5000 rows per batch. |

---

### 3.3 Module: Attendance Management

#### FR-ATT-001: Mark Attendance
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-ATT-001                                                           |
| **Priority**| Must Have                                                             |
| **Input**   | Subject, date, lecture number, student list with Present/Absent/Late  |
| **Process** | Faculty selects class → System loads enrolled students → Mark individually or bulk → Save |
| **Rules**   | Attendance can be edited within 48 hours by the marking faculty. After that, HOD approval required. |

#### FR-ATT-002: Student Attendance Dashboard
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-ATT-002                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Student can view subject-wise attendance percentage, total percentage, calendar heatmap. |
| **Alerts**  | Visual warning when attendance < 75%. Critical alert at < 65%.        |

#### FR-ATT-003: Shortage Notifications
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-ATT-003                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Automated SMS/email to student and parent when attendance falls below configurable threshold (default: 75%). |
| **Frequency** | Weekly digest + immediate alert on crossing threshold.              |

#### FR-ATT-004: Attendance Reports
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-ATT-004                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Generate class-wise, subject-wise, department-wise attendance reports. Export to PDF/Excel. |

#### FR-ATT-005: Condonation Workflow
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-ATT-005                                                           |
| **Priority**| Should Have                                                           |
| **Process** | Student applies → Faculty recommends → HOD approves → Attendance adjusted |

---

### 3.4 Module: Examination Management

#### FR-EXAM-001: Exam Scheduling
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-EXAM-001                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Create exam events with type, date, time, duration, venue, and assigned subjects. |
| **Rules**   | No student should have two exams in the same slot. System validates clashes. |

#### FR-EXAM-002: Hall Ticket Generation
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-EXAM-002                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Generate downloadable hall tickets (PDF) with student photo, seat number, exam timetable. |
| **Rules**   | Hall ticket blocked if fee not paid or attendance < threshold.        |

#### FR-EXAM-003: Mark Entry
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-EXAM-003                                                           |
| **Priority**| Must Have                                                             |
| **Input**   | Subject, exam type, student-wise marks                                |
| **Process** | Faculty enters marks → HOD moderates → Exam cell finalizes            |
| **Rules**   | Marks must be within [0, max_marks]. Double-entry validation optional. |

#### FR-EXAM-004: Grade Computation
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-EXAM-004                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Compute grades based on configurable grading scheme (absolute or relative). Calculate SGPA, CGPA. |
| **Output**  | Grade card per student per semester.                                  |

#### FR-EXAM-005: Result Publishing
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-EXAM-005                                                           |
| **Priority**| Must Have                                                             |
| **Process** | Exam cell publishes results → Students view via portal → Notification sent |
| **Rules**   | Results visible only after publish. Unpublished results restricted to Exam cell. |

#### FR-EXAM-006: Revaluation Requests
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-EXAM-006                                                           |
| **Priority**| Should Have                                                           |
| **Process** | Student applies (with fee) → Reassign to different evaluator → Update marks if changed |

---

### 3.5 Module: Fee & Finance Management

#### FR-FEE-001: Fee Structure Configuration
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-FEE-001                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Define fee heads (tuition, library, lab, hostel, transport) per branch, year, and category. |
| **Rules**   | Fee structure versioned. Changes create a new version; existing dues remain on old structure. |

#### FR-FEE-002: Online Fee Payment
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-FEE-002                                                           |
| **Priority**| Must Have                                                             |
| **Process** | Student initiates payment → Redirect to payment gateway → Callback webhook → Update ledger → Generate receipt |
| **Methods** | UPI, Net Banking, Debit/Credit Card, Wallet                          |
| **Rules**   | Idempotent transaction handling. Retry on gateway timeout. Log all transactions. |

#### FR-FEE-003: Fee Receipt Generation
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-FEE-003                                                           |
| **Priority**| Must Have                                                             |
| **Output**  | Downloadable PDF receipt with institution header, receipt number, payment details, QR code for verification. |

#### FR-FEE-004: Defaulter Report
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-FEE-004                                                           |
| **Priority**| Must Have                                                             |
| **Description** | List students with overdue fees. Filter by branch, year, due date. Send reminder notifications. |

#### FR-FEE-005: Scholarship Management
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-FEE-005                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Apply scholarship/concession to student fee. Track government and institution scholarships separately. |

---

### 3.6 Module: Timetable & Scheduling

#### FR-TT-001: Timetable Generation
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-TT-001                                                           |
| **Priority**| Must Have                                                             |
| **Input**   | Subjects, faculty, rooms, batches, constraints (no back-to-back labs, min gap between lectures) |
| **Output**  | Clash-free timetable for all sections                                 |

#### FR-TT-002: Substitution Management
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-TT-002                                                           |
| **Priority**| Should Have                                                           |
| **Description** | When faculty marks leave, suggest available substitutes based on free slots and qualification match. |

#### FR-TT-003: View Timetable
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-TT-003                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Role-specific views: Student sees class timetable; Faculty sees teaching schedule; Admin sees master grid. |

---

### 3.7 Module: Course & Curriculum Management

#### FR-CRS-001: Course Catalog
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-CRS-001                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Maintain catalog of all courses with code, title, credits, type (theory/lab/project), and prerequisites. |

#### FR-CRS-002: Syllabus Management
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-CRS-002                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Upload syllabus PDF. Track syllabus versions. Map syllabus units to COs. |

#### FR-CRS-003: Course Registration
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-CRS-003                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Students select electives during registration window. Seat limits per elective. Waitlist management. |

---

### 3.8 Module: Faculty & HR Management

#### FR-HR-001: Faculty Profile
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-HR-001                                                           |
| **Priority**| Must Have                                                             |
| **Fields**  | Name, department, designation, qualifications, experience, publications, photo |

#### FR-HR-002: Leave Management
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-HR-002                                                           |
| **Priority**| Must Have                                                             |
| **Leave Types** | Casual Leave, Earned Leave, Medical Leave, On Duty, Compensatory Off |
| **Workflow** | Apply → HOD Approves → Admin Records → Leave balance updated          |
| **Rules**   | Cannot exceed allocated balance. Notify timetable module for substitution. |

#### FR-HR-003: Workload Report
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-HR-003                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Show teaching hours, subjects assigned, and weekly load per faculty.  |

---

### 3.9 Module: Library Management

#### FR-LIB-001: Book Catalog
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-LIB-001                                                           |
| **Priority**| Must Have                                                             |
| **Fields**  | Title, author, ISBN, publisher, edition, category, shelf location, copies available |
| **Search**  | Full-text search by title, author, ISBN. Filter by category, availability. |

#### FR-LIB-002: Issue & Return
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-LIB-002                                                           |
| **Priority**| Must Have                                                             |
| **Rules**   | Max 3 books per student, 5 per faculty. Loan period: 14 days (student), 30 days (faculty). Renewal allowed once. |
| **Fines**   | Configurable per-day fine after due date. Fine auto-calculated.       |

#### FR-LIB-003: Reservation
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-LIB-003                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Reserve a book that is currently issued. Notified when available.  |

---

### 3.10 Module: Communication & Notifications

#### FR-COM-001: Announcements
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-COM-001                                                           |
| **Priority**| Must Have                                                             |
| **Description** | Post announcements with scope: All, Department, Class, or Individual. Attachments supported. |
| **Channels** | In-app notification + Email + SMS (configurable per announcement)    |

#### FR-COM-002: Event Calendar
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-COM-002                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Shared academic calendar with holidays, exam dates, events. iCal export. |

#### FR-COM-003: Notification Preferences
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-COM-003                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Users can configure which notifications they receive via email vs SMS vs in-app. |

---

### 3.11 Module: Reports & Analytics

#### FR-RPT-001: Dashboard
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-RPT-001                                                           |
| **Priority**| Must Have                                                             |
| **Widgets** | Total enrollment, attendance trends, fee collection %, pass %, placement rate |
| **Access**  | Admin and HOD see department-level; Principal sees institution-level.  |

#### FR-RPT-002: NAAC/NBA Reports
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-RPT-002                                                           |
| **Priority**| Should Have                                                           |
| **Description** | Auto-generate data points required for NAAC SSR and NBA SAR from system data. Export as PDF/Excel. |

#### FR-RPT-003: Custom Report Builder
| Field       | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| **ID**      | FR-RPT-003                                                           |
| **Priority**| Could Have                                                            |
| **Description** | Drag-and-drop report builder. Select entity, filters, columns. Save report templates. Schedule periodic generation. |

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-PERF)

| ID          | Requirement                                                           |
|-------------|-----------------------------------------------------------------------|
| NFR-PERF-01 | Page load time ≤ 2 seconds on 4G connection (LCP metric)             |
| NFR-PERF-02 | API response time ≤ 500ms (95th percentile) under normal load        |
| NFR-PERF-03 | Bulk operations (CSV import of 5000 rows) complete within 60 seconds |
| NFR-PERF-04 | Database queries optimized with indexing; no query > 200ms           |
| NFR-PERF-05 | Support 500 concurrent WebSocket connections for real-time dashboards|

### 4.2 Security (NFR-SEC)

| ID          | Requirement                                                           |
|-------------|-----------------------------------------------------------------------|
| NFR-SEC-01  | All passwords hashed with bcrypt (cost factor ≥ 12)                  |
| NFR-SEC-02  | All traffic over HTTPS (TLS 1.3). HSTS header enforced.             |
| NFR-SEC-03  | Data at rest encrypted with AES-256                                  |
| NFR-SEC-04  | SQL injection prevention via parameterized queries / ORM             |
| NFR-SEC-05  | XSS prevention via output encoding and CSP headers                   |
| NFR-SEC-06  | CSRF protection on all state-changing endpoints                       |
| NFR-SEC-07  | Rate limiting: 100 req/min per IP for auth endpoints                 |
| NFR-SEC-08  | PII masking in application logs                                       |
| NFR-SEC-09  | File upload validation: MIME type check, antivirus scan hook          |
| NFR-SEC-10  | Quarterly vulnerability assessment (VAPT) required                    |

### 4.3 Scalability (NFR-SCALE)

| ID            | Requirement                                                         |
|---------------|---------------------------------------------------------------------|
| NFR-SCALE-01  | Horizontal scaling via stateless application containers              |
| NFR-SCALE-02  | Database read replicas for reporting queries                         |
| NFR-SCALE-03  | CDN for static assets (images, JS, CSS)                              |
| NFR-SCALE-04  | Support 10,000+ registered users with 2,000 concurrent sessions     |

### 4.4 Reliability & Availability (NFR-REL)

| ID          | Requirement                                                           |
|-------------|-----------------------------------------------------------------------|
| NFR-REL-01  | System uptime ≥ 99.5% (excluding scheduled maintenance)             |
| NFR-REL-02  | Automated daily backups with 30-day retention                         |
| NFR-REL-03  | Point-in-time recovery (RPO < 1 hour)                                |
| NFR-REL-04  | Recovery time objective (RTO) < 4 hours                               |
| NFR-REL-05  | Graceful degradation: read-only mode if primary DB fails              |
| NFR-REL-06  | Health check endpoints for all services                               |

### 4.5 Usability (NFR-USE)

| ID          | Requirement                                                           |
|-------------|-----------------------------------------------------------------------|
| NFR-USE-01  | Responsive design: mobile (360px) to desktop (1920px)                |
| NFR-USE-02  | WCAG 2.1 AA compliance for accessibility                              |
| NFR-USE-03  | Maximum 3 clicks to reach any primary function                        |
| NFR-USE-04  | Consistent UI language (design system with component library)         |
| NFR-USE-05  | Inline form validation with descriptive error messages                |
| NFR-USE-06  | Multi-language support: English (primary), Hindi (secondary)          |

### 4.6 Maintainability (NFR-MAINT)

| ID            | Requirement                                                         |
|---------------|---------------------------------------------------------------------|
| NFR-MAINT-01  | Codebase follows modular architecture (domain-driven design)         |
| NFR-MAINT-02  | Minimum 80% unit test coverage for business logic                    |
| NFR-MAINT-03  | API versioning (e.g., `/api/v1/...`)                                 |
| NFR-MAINT-04  | Database migrations managed via version-controlled scripts           |
| NFR-MAINT-05  | Centralized logging with correlation IDs across services             |
| NFR-MAINT-06  | CI/CD pipeline: lint → test → build → deploy (automated)             |

---

## 5. Data Requirements

### 5.1 Entity-Relationship Summary

```
Student ──────┬── belongs_to ──── Department
              ├── enrolled_in ─── Course
              ├── has_many ────── Attendance Records
              ├── has_many ────── Exam Results
              ├── has_many ────── Fee Transactions
              └── has_many ────── Library Issues

Faculty ──────┬── belongs_to ──── Department
              ├── teaches ─────── Course
              ├── has_many ────── Leave Applications
              └── marks ─────────  Attendance

Department ───┬── has_many ────── Courses
              ├── has_many ────── Faculty
              └── has_one ─────── HOD (Faculty)

Course ───────┬── has_many ────── Syllabus Units
              ├── has_many ────── Exam Schedules
              └── mapped_to ───── COs / POs

Exam ─────────┬── has_many ────── Results
              └── has_one ─────── Seating Plan

Fee Structure ─── applies_to ──── Student (via branch/year/category)
```

### 5.2 Key Data Entities

| Entity            | Estimated Volume (per year) | Retention Policy      |
|-------------------|-----------------------------|-----------------------|
| Students          | 2,000 – 10,000              | Permanent             |
| Faculty           | 100 – 500                   | Permanent             |
| Attendance Records| 500,000 – 2,000,000         | 5 years               |
| Exam Results      | 50,000 – 200,000            | Permanent             |
| Fee Transactions  | 20,000 – 100,000            | 10 years (regulatory) |
| Library Issues    | 50,000 – 200,000            | 3 years               |
| Notifications     | 100,000 – 500,000           | 1 year                |
| Audit Logs        | 1,000,000+                  | 3 years               |

---

## 6. Interface Requirements

### 6.1 User Interface Requirements

| Screen                  | Key Elements                                                                       |
|-------------------------|-------------------------------------------------------------------------------------|
| Login Page              | Email/phone input, password, "Forgot Password" link, SSO button                     |
| Student Dashboard       | Attendance %, upcoming exams, fee dues, recent announcements, quick links            |
| Faculty Dashboard       | Today's schedule, pending attendance, leave balance, announcements                   |
| Admin Dashboard         | KPI widgets, quick actions (add student, manage fees), notification center           |
| Attendance Marking      | Class selector, student list with checkboxes, bulk mark, save                        |
| Fee Payment             | Fee breakdown, pay now button, payment history, download receipt                     |
| Exam Results            | Semester picker, subject-wise marks/grades, SGPA/CGPA, download transcript          |
| Library Search          | Search bar, filters, book cards with availability status                             |
| Reports Page            | Report type selector, date range, filters, generate/export buttons                   |

### 6.2 API Interface Specifications

| Endpoint Pattern       | Method  | Description                          | Auth Required |
|------------------------|---------|--------------------------------------|---------------|
| `/api/v1/auth/login`   | POST    | Authenticate user                    | No            |
| `/api/v1/auth/refresh` | POST    | Refresh access token                 | Yes (refresh) |
| `/api/v1/students`     | GET     | List students (paginated, filtered)  | Yes (Admin+)  |
| `/api/v1/students/:id` | GET     | Get student profile                  | Yes           |
| `/api/v1/attendance`   | POST    | Mark attendance                      | Yes (Faculty) |
| `/api/v1/attendance/:studentId` | GET | Get student attendance        | Yes           |
| `/api/v1/exams`        | GET     | List exams                           | Yes           |
| `/api/v1/results`      | POST    | Enter marks                          | Yes (Faculty) |
| `/api/v1/fees/pay`     | POST    | Initiate payment                     | Yes (Student) |
| `/api/v1/fees/receipt/:id` | GET | Download receipt                     | Yes           |
| `/api/v1/library/books`| GET     | Search books                         | Yes           |
| `/api/v1/notifications`| GET     | Get user notifications               | Yes           |
| `/api/v1/reports/:type`| GET     | Generate report                      | Yes (Admin+)  |

> All APIs return JSON. Standard response format:
```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "totalPages": 10, "totalItems": 100 },
  "error": null
}
```

### 6.3 External Interface Requirements

| Interface              | Direction | Protocol  | Data Format | Frequency        |
|------------------------|-----------|-----------|-------------|------------------|
| Payment Gateway        | Outbound  | HTTPS     | JSON        | Per transaction  |
| Payment Webhook        | Inbound   | HTTPS     | JSON        | Per transaction  |
| SMS Gateway            | Outbound  | HTTPS     | JSON        | Event-driven     |
| Email Service          | Outbound  | SMTP/API  | MIME/JSON   | Event-driven     |
| Biometric Device       | Inbound   | HTTP/SDK  | JSON/Binary | Per punch        |
| University Portal      | Outbound  | HTTPS/CSV | JSON/CSV    | Semester-end     |

---

## 7. Validation & Acceptance Criteria

### 7.1 Module-Level Acceptance Tests

| Module       | Test ID    | Acceptance Criteria                                                          |
|--------------|------------|------------------------------------------------------------------------------|
| Auth         | AC-AUTH-01 | User can register, verify email, login, and access role-appropriate dashboard|
| Auth         | AC-AUTH-02 | Account locks after 5 failed login attempts                                  |
| SIS          | AC-SIS-01  | Admin can create, edit, search, and deactivate student profiles              |
| SIS          | AC-SIS-02  | Bulk import of 1000 students completes without errors in < 30s              |
| Attendance   | AC-ATT-01  | Faculty marks attendance for a class of 60 students in under 2 minutes       |
| Attendance   | AC-ATT-02  | Parent receives SMS within 5 minutes when ward's attendance < 75%            |
| Exam         | AC-EXAM-01 | Results are invisible to students before publish; visible after               |
| Exam         | AC-EXAM-02 | CGPA calculated correctly across 4 semesters with mixed grading schemes      |
| Fee          | AC-FEE-01  | Student completes payment and receives receipt within 30 seconds             |
| Fee          | AC-FEE-02  | Duplicate payment webhook is handled idempotently                             |
| Library      | AC-LIB-01  | Book search returns results within 500ms for 50,000+ catalog                 |
| Timetable    | AC-TT-01   | Generated timetable has zero room or faculty clashes                          |
| Reports      | AC-RPT-01  | NAAC report generates from live data in < 30 minutes                          |

### 7.2 Cross-Cutting Acceptance Tests

| Test ID    | Acceptance Criteria                                                              |
|------------|----------------------------------------------------------------------------------|
| AC-SEC-01  | Penetration test reveals no Critical or High vulnerabilities (OWASP Top 10)      |
| AC-PERF-01 | Load test: 1000 concurrent users, avg response time < 1s, error rate < 1%        |
| AC-USE-01  | WCAG 2.1 AA audit passes with zero critical violations                            |
| AC-DATA-01 | Backup restoration completes successfully within RTO window                       |

---

## 8. Constraints

1. **Budget**: Must be deployable on a single VPS (≥ 8 vCPU, 16GB RAM) for small colleges, or Kubernetes for larger institutions.
2. **Timeline**: MVP in 3 months with a team of 4-5 full-stack developers.
3. **Regulatory**: All financial data retention must comply with Indian IT Act and DPDP Act.
4. **Legacy**: Must provide CSV/Excel import paths for colleges migrating from spreadsheet-based systems.
5. **Connectivity**: Core workflows (attendance, fee receipt) must function during intermittent connectivity (offline-first optional for PWA).

---

## 9. Traceability Matrix

| PRD Module (§5)       | SRS Functional Req IDs               | NFR Coverage                    |
|-----------------------|--------------------------------------|---------------------------------|
| Student Info (5.1)    | FR-SIS-001 to FR-SIS-004            | NFR-PERF, NFR-SEC, NFR-USE     |
| Admission (5.2)       | — (v1.1 scope)                       | —                               |
| Attendance (5.3)      | FR-ATT-001 to FR-ATT-005            | NFR-PERF, NFR-REL              |
| Timetable (5.4)       | FR-TT-001 to FR-TT-003             | NFR-PERF                       |
| Examination (5.5)     | FR-EXAM-001 to FR-EXAM-006          | NFR-SEC, NFR-PERF, NFR-REL     |
| Fee & Finance (5.6)   | FR-FEE-001 to FR-FEE-005            | NFR-SEC, NFR-REL, NFR-SCALE    |
| Course & Curriculum (5.7)| FR-CRS-001 to FR-CRS-003         | NFR-USE                        |
| Faculty & HR (5.8)    | FR-HR-001 to FR-HR-003              | NFR-SEC, NFR-USE                |
| Library (5.9)         | FR-LIB-001 to FR-LIB-003            | NFR-PERF                       |
| Communication (5.10)  | FR-COM-001 to FR-COM-003            | NFR-PERF, NFR-SCALE             |
| Reports (5.13)        | FR-RPT-001 to FR-RPT-003            | NFR-PERF, NFR-USE               |

---

## 10. Appendices

### Appendix A: Grading Scheme Example

| Grade | Range       | Grade Points |
|-------|-------------|-------------|
| O     | 90 – 100    | 10          |
| A+    | 80 – 89     | 9           |
| A     | 70 – 79     | 8           |
| B+    | 60 – 69     | 7           |
| B     | 50 – 59     | 6           |
| C     | 40 – 49     | 5           |
| F     | < 40        | 0           |

### Appendix B: Sample Fee Structure

| Fee Head         | Amount (₹) | Frequency   |
|------------------|-----------|-------------|
| Tuition Fee      | 50,000    | Per Semester |
| Development Fee  | 5,000     | Per Semester |
| Library Fee      | 2,000     | Per Year     |
| Lab Fee          | 3,000     | Per Semester |
| Exam Fee         | 1,500     | Per Semester |
| Transport Fee    | 15,000    | Per Year     |

### Appendix C: Notification Templates

| Event                   | Channel     | Template                                                      |
|-------------------------|-------------|---------------------------------------------------------------|
| Fee Due Reminder        | SMS + Email | "Dear {parent_name}, fee of ₹{amount} for {student_name} is due by {date}. Pay online at {link}." |
| Attendance Shortage     | SMS         | "Alert: {student_name}'s attendance is {percentage}% (below 75%). — {college_name}" |
| Result Published        | Email       | "Results for {exam_name} are now available. Login to view: {link}" |
| Leave Approved          | In-App      | "Your leave from {start_date} to {end_date} has been approved by {approver}." |

---

*End of SRS*
