# Research Summary: College ERP System (Multi-tenant)

**Domain:** Higher Education Enterprise Resource Planning (ERP)
**Researched:** 2024-04-14
**Overall confidence:** HIGH

## Executive Summary

Building a multi-tenant College ERP for 10k+ users across 13+ modules requires a delicate balance between **data isolation** (for compliance/security) and **operational scalability** (for maintenance). 

The modern standard (2024-2025) for Node.js/PostgreSQL applications of this scale has shifted away from "one-schema-per-tenant" (due to system catalog bloat and migration complexity) toward **Shared Schema with Row-Level Security (RLS)**. This approach treats the database as the "enforcement layer" for isolation, preventing cross-tenant data leakage even if application-level filters are missed.

For NAAC/NBA compliance, the system must go beyond CRUD and implement **Outcome-Based Education (OBE)** engines that map course-level assessments (COs) to program-level objectives (POs). Data integrity is ensured through immutable audit logs and a centralized "Evidence Vault" for DVV (Data Validation and Verification).

## Key Findings

**Stack:** Node.js (Fastify) + PostgreSQL (RLS) + Drizzle ORM + Redis + MinIO.
**Architecture:** Shared-schema (discriminator-based) enforced by PostgreSQL RLS using `AsyncLocalStorage` for tenant context.
**Critical Pitfall:** "Tenant Leakage" due to improper connection pool management (Mitigation: use `SET LOCAL` within transactions).

## Implications for Roadmap

Based on research, the suggested phase structure is:

1. **Phase 1: Multi-tenant Foundation** - Implementation of RLS, Tenant Middleware, and Auth.
   - Addresses: Core isolation, SIS, and User provisioning.
   - Avoids: Data leakage risks from the start.

2. **Phase 2: Academic Core & OBE Engine** - Marks entry and CO-PO mapping.
   - Addresses: Examination and NBA/NAAC table stakes.
   - Requires: Calculation logic for attainment levels.

3. **Phase 3: Evidence & Compliance** - Automated report generation (AQAR/SSR/SAR).
   - Addresses: Accreditation automation.
   - Feature: MinIO-backed Evidence Vault for proof of claim.

**Phase ordering rationale:**
- Multi-tenancy must be in the DNA of the system; retrofitting RLS is difficult.
- OBE data (Phase 2) is a prerequisite for Compliance reports (Phase 3).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Drizzle + RLS is the current SOTA for Node.js/PG. |
| Features | HIGH | NAAC/NBA requirements are well-documented by accreditation bodies. |
| Architecture | HIGH | RLS is a proven pattern for 10k+ user SaaS. |
| Pitfalls | MEDIUM | Scaling RLS requires careful indexing and query monitoring. |

## Gaps to Address

- **Performance at 100k+ Users:** While 10k is fine for a single PG instance, vertical/horizontal scaling (read replicas) needs to be tested if user base grows significantly.
- **Biometric Integration:** Hardware-level multi-tenancy (syncing local device IDs to tenant cloud) needs a separate research spike if biometric attendance is mandatory.
