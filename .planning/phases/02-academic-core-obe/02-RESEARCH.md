# Phase 2: Academic Core & OBE Engine - Research

**Researched:** Today
**Domain:** Academic Operations, OBE Mapping, Constraint Scheduling, Multi-tenant DB Architecture
**Confidence:** MEDIUM

## Summary
Phase 2 digitizes the core academic workflows. The most complex domain is the Outcome-Based Education (OBE) engine, requiring precise CO-PO/PSO mapping matrices and attainment calculations. Scheduling Timetables introduces Constraint Satisfaction complexity, while Attendance and Examination modules require robust background processing for notifications and PDF generation.

**Primary recommendation:** Use background workers (e.g., BullMQ with Redis) for compute-heavy tasks like grade computation, hall ticket PDF generation, and batch attendance notifications to maintain the <500ms API response time requirement (NFR-PERF-01).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `bullmq` | Latest | Background Jobs | Robust handling of notifications, PDF generation, and heavy grade calculations using Redis. |
| `pdfkit` or `pdfmake` | Latest | PDF Generation | Reliable, fast generation of Hall Tickets and Attendance Reports without headless browser overhead. |
| `date-fns` | Latest | Date Manipulation | Lightweight, immutable date logic crucial for timetable and attendance constraints. |

### Anti-Patterns to Avoid
- **Synchronous PDF Generation:** Do not generate Hall Tickets on the main Event Loop. It will block other tenant requests.
- **Deeply Nested OBE Arrays:** Avoid deeply nested CO-PO mapping arrays in MongoDB; use normalized mapping collections to ensure query performance.
- **Hand-rolling Job Queues:** Do not use `setTimeout` or `setInterval` for <75% attendance shortage alerts; use `bullmq` for reliable execution.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Background Jobs | Custom DB polling | `bullmq` | Handles retries, distributed locking, and scales horizontally. |
| Complex PDF Layouts | HTML string concat | `pdfmake` | Manageable pagination, styling, and robust multi-tenant branding. |

## Common Pitfalls

### Pitfall 1: Unbounded MongoDB Arrays in Attendance
**What goes wrong:** Pushing daily attendance records into a single `Student` document array.
**Why it happens:** Trying to keep data together for easy reads. Document eventually exceeds the 16MB limit.
**How to avoid:** Use a separate `Attendance` collection linked by `studentId` and `date`, or leverage MongoDB Time Series collections if strictly chronological.

### Pitfall 2: Timetable Conflict Race Conditions
**What goes wrong:** Two admins concurrently scheduling different classes in the same room.
**Why it happens:** Checking availability and inserting the record are two separate operations.
**How to avoid:** Use MongoDB transactions or unique compound indexes on `(tenantId, roomId, dayOfWeek, timeSlot)` to enforce consistency at the database level.

## Open Questions

1. **Timetable Algorithm Complexity**
   - What we know: TT-01 requires conflict detection for rooms and faculty.
   - What's unclear: Should the system automatically *generate* the timetable (very complex), or provide a drag-and-drop UI that *validates* constraints?
   - Recommendation: Start with a validation-first UI approach (assisting the admin) before attempting fully automated scheduling in V1.
