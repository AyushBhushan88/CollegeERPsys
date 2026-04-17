# Phase 4: Analytics & Compliance - Research

**Researched:** 2026-04-17
**Domain:** Advanced Analytics, NAAC/NBA Compliance, and Custom Reporting.
**Confidence:** HIGH

## Summary
Phase 4 focuses on converting the transactional data collected in Phases 1-3 into actionable insights and compliance reports. We will implement management dashboards, an automated compliance engine for NAAC/NBA, and a metadata-driven custom report builder.

## Compliance Metrics (NAAC/NBA)

### NAAC Criteria Focus
1. **Criterion 2: Teaching-Learning and Evaluation**
   - Student-Faculty Ratio (SFR).
   - Average pass percentage of students.
   - SSS (Student Satisfaction Survey) data extraction.
2. **Criterion 3: Research, Innovations, and Extension**
   - Research papers published per teacher in the Journals notified on UGC website.
   - Number of books and chapters in edited volumes/books published and papers published in national/ international conference proceedings per teacher.
3. **Criterion 4: Infrastructure and Learning Resources**
   - Percentage of expenditure, excluding salary for infrastructure augmentation.
   - Percentage per day usage of library by teachers and students.
4. **Criterion 5: Student Support and Progression**
   - Percentage of students benefited by scholarships and free ships.
   - Percentage of placement of outgoing students and students progressing to higher education.

### NBA SAR Focus
1. **Criterion 2: Program Curriculum and Teaching-Learning Processes**
   - CO-PO Attainment (calculated from Phase 2 Examination data).
2. **Criterion 4: Student Performance**
   - Success rate (graduation within stipulated time).
   - Academic performance (CGPA/SGPA).

## Architecture Patterns

### Custom Report Builder (Metadata-Driven Aggregation)
- **Engine:** Uses a "Pipeline Factory" to convert UI filters/columns into MongoDB `$match`, `$group`, `$addFields`, and `$project` stages.
- **Multi-tenancy:** Enforced by prepending `{ $match: { tenantId } }` to every pipeline.
- **Denormalization:** Use `$lookup` sparingly. For reporting, consider denormalizing common fields like `departmentName` into `Student` or `Faculty` models if performance degrades.

### Async Report Generation
- **Library:** `exceljs` for XLSX, `pdfmake` for PDF.
- **Workflow:** Large reports (like NAAC SSR) are processed via **BullMQ** to prevent blocking the Fastify event loop.
- **Storage:** Generated reports are stored in MinIO and valid for a limited time (via signed URLs).

## Standard Stack

| Library | Purpose | Why |
|---------|---------|-----|
| exceljs | XLSX generation | Streaming support for large datasets. |
| pdfmake | PDF generation | High precision layouts needed for compliance templates. |
| bullmq | Async jobs | Proven task queue for background processing. |
| mongodb-aggregation | Analytics | Native performance for complex metrics. |

## Common Pitfalls

### Pitfall 1: NoSQL Injection in Custom Reports
- **Risk:** User-defined filters being passed directly to `$match`.
- **Mitigation:** Use Zod to whitelist allowed fields and operators (e.g., only `$eq`, `$gt`, `$in`).

### Pitfall 2: Memory Bloat with Large PDFs
- **Risk:** `pdfmake` generating massive files in memory.
- **Mitigation:** Generate report chunks and stream them, or use worker threads for generation.

### Pitfall 3: Stale Analytics
- **Risk:** Real-time aggregation on multi-million records becomes slow.
- **Mitigation:** Implement the **Computed Pattern** (Materialized Views) for frequently accessed KPIs (e.g., Daily Attendance %).

## Environment Availability

| Dependency | Required By | Available |
|------------|------------|-----------|
| MongoDB Aggregation | All analytics | ✓ |
| BullMQ/Redis | Async reports | ✓ |
| MinIO | Report storage | ✓ |
