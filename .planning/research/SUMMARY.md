# Research Summary: College ERP System (Multi-tenant)

**Domain:** Higher Education Enterprise Resource Planning (ERP)
**Researched:** 2024-05-22
**Overall confidence:** HIGH

## Executive Summary

Building a multi-tenant College ERP for 10k+ users requires a robust **data isolation** layer and a powerful **custom reporting engine** for accreditation (NAAC/NBA). 

The modern standard (2024-2025) for Node.js/MongoDB applications at this scale involves a **Shared Collection with Discriminator** pattern, where every document includes a `tenantId`. Isolation is enforced by Mongoose middleware, ensuring no cross-tenant data leakage.

Compliance with **NAAC (SSR/AQAR)** and **NBA (SAR)** requires tracking longitudinal data across four key areas:
1. **Student Performance:** CGPA, Pass %, CO-PO Attainment.
2. **Faculty Contributions:** Research (UGC-CARE), PhD Qualifications, FDPs.
3. **Financial Health:** Budget utilization for physical/academic facilities.
4. **Placement:** Salary details, higher study proofs, alumni career paths.

To provide institutions with flexibility, the system will implement a **Metadata-Driven Custom Report Builder** using MongoDB's Aggregation Framework. This allows IQAC (Internal Quality Assurance Cell) to generate any report without developer intervention.

## Key Findings

**Stack:** Node.js (Fastify) + MongoDB (Mongoose) + Redis + BullMQ + MinIO.
**Architecture:** Shared-collection (discriminator-based) enforced by Mongoose middleware using `AsyncLocalStorage` for tenant context.
**Critical Pitfall:** NoSQL Injection and Performance in custom reports (Mitigation: Whitelist operators, Zod validation, and background processing).

## Implications for Roadmap

Based on research, the suggested phase structure is:

1. **Phase 1: Multi-tenant Foundation** - Implementation of Mongoose middleware, Tenant Middleware, and Auth.
   - Addresses: Core isolation, SIS, and User roles.
   - Avoids: Data leakage risks from the start.

2. **Phase 2: Academic Core & OBE Engine** - Marks entry, Attendance, and CO-PO mapping.
   - Addresses: Examination and NBA/NAAC table stakes.
   - Requires: Accurate CGPA and attainment calculation logic.

3. **Phase 3: Evidence & Compliance** - Evidence Vault (MinIO) and NAAC/NBA metrics.
   - Addresses: Accreditation automation and document proof.
   - Feature: Mapping activities to NAAC Criteria (Criterion 1-7).

4. **Phase 4: Advanced Reporting & Analytics** - Custom Report Builder & Alumni Connect.
   - Addresses: IQAC flexibility and long-term placement tracking.
   - Requires: MongoDB Aggregation Pipeline Factory.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Mongoose + Fastify is the current SOTA for Node.js/MongoDB. |
| Features | HIGH | NAAC/NBA requirements are well-documented and researched. |
| Architecture | HIGH | Discriminator-based isolation is a proven pattern for 10k+ SaaS. |
| Pitfalls | HIGH | NoSQL injection and OOM in reports are common but avoidable. |

## Gaps to Address

- **Large Dataset Aggregations:** For institutions with 50,000+ students, raw aggregations may slow down. Horizontal scaling (Sharding) or the "Computed Pattern" (Pre-aggregation) must be implemented early for critical metrics.
- **Mobile PWA Offline Sync:** If attendance is marked in areas with poor connectivity, a PWA sync strategy needs a separate research spike.

## Sources

- [NAAC Assessment Framework 2024](http://www.naac.gov.in/)
- [NBA SAR Tier I/II Manuals 2024](https://www.nbaind.org/)
- [MongoDB Security & Performance Best Practices]
