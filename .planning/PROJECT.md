# Project: College ERP System

---

| Field            | Value                              |
|------------------|------------------------------------|
| **Project Name** | College ERP System                 |
| **Status**       | Initializing                       |
| **Date**         | 2026-04-14                         |
| **Author**       | Gemini CLI                         |

---

## 1. Overview

A multi-tenant, enterprise-grade College ERP system designed to digitize and manage academic, administrative, and financial workflows.

### 1.1 Core Value Proposition
- Unified platform for students, faculty, and administration.
- Automated compliance reporting (NAAC/NBA).
- Real-time analytics and dashboards.

---

## 2. Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js (Express/Fastify)
- **Database:** MongoDB (Multi-tenant), Redis
- **Auth:** JWT, OAuth 2.0 (Google SSO)
- **File Storage:** MinIO / AWS S3
- **Messaging:** RabbitMQ (for async notifications)
- **Search:** Elasticsearch

---

## 3. Decisions & Preferences

| Category        | Decision                          |
|-----------------|-----------------------------------|
| **Tenancy**     | Multi-Tenant / Multi-Campus       |
| **Backend**     | Node.js (Express/Fastify)         |
| **Attendance**  | QR-code / Manual (MVP)            |
| **Migration**   | No legacy migration               |
| **Styling**     | Tailwind CSS (as per PRD)         |

---

## 4. Key Milestones (Planned)

1. **Phase 1: Foundation (MVP)** - Auth, SIS, Attendance, Fee Management, Announcements.
2. **Phase 2: Academic Core** - Exam Management, Timetable, Course Management.
3. **Phase 3: Operational Support** - Library, Faculty HR, Reports Dashboard.
4. **Phase 4: Advanced Features** - Placement, Hostel, Mobile PWA.

---

*Note: Initialized from docs/PRD.md and docs/SRS.md.*
