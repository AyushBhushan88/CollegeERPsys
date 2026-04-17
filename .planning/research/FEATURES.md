# Feature Landscape

**Domain:** College ERP System
**Researched:** 2024-05-22
**Confidence:** HIGH

## Table Stakes (Compliance Focus)

Features required for basic operations and NAAC/NBA compliance.

| Feature | Key Metrics for Accreditation | Complexity | Notes |
|---------|------------------------------|------------|-------|
| **Student Performance (SIS)** | Pass %, Graduation Rate (without backlogs), CGPA, SSS Readiness. | Medium | Mandatory for NAAC Criterion 2 & 5. |
| **Faculty Mgmt (HRMS)** | PhD/NET Qualifications, Research Publications (UGC-CARE), FDPs (min 5 days). | Medium | Mandatory for NAAC Criterion 3 & 5. |
| **Financial Health** | Infrastructure Augmentation, Library Spend, Maintenance Costs. | Medium | Required for NAAC Criterion 4. |
| **Placement Cell** | Placement %, Median Salary, Higher Study Proofs (ID cards/Letters). | Medium | High weightage for NBA & NIRF. |
| **OBE Engine** | CO-PO Attainment, Course Articulation Matrix. | High | Essential for NBA SAR. |

## Differentiators

Features that set this ERP apart and add immense value for institutional IQAC.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Evidence Vault** | Single-click DVV readiness; maps every activity/record to a NAAC criterion. | Medium | Prevents "document hunt" during visits. |
| **AQAR/SSR Automator** | Generates pre-filled NAAC SSR/NBA SAR templates using system data. | High | Saves months of manual data entry. |
| **Custom Report Builder** | Allows IQAC to create any cross-tenant report using MongoDB aggregation. | High | Flexible for local institutional needs. |
| **Alumni Connect** | Tracking career progression 3-5 years post-graduation. | Medium | Needed for PEO (Program Educational Objectives). |
| **Pre-Calculated Dashboards** | Real-time SFR (Student-Faculty Ratio) and Cadre Ratio tracking. | Low | Essential for maintaining NBA eligibility. |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Multi-schema DB | Complexity in migrations and system overhead. | Single-schema with `tenantId` discriminator. |
| Manual Excel Uploads | Prone to error and "data cooking." | Provide structured templates with validation (Zod). |
| Native Apps | High dev/maintenance cost across platforms. | Responsive PWA with deep-linking. |

## Feature Dependencies

```
SIS → Exam Mgmt (Student list required for exam)
Exam Mgmt → OBE Engine (Marks entry fuels attainment calculation)
Faculty HRMS → NAAC Reports (Publications & FDPs used in Criterion 3)
Finance → Infrastructure Reports (Audit statements for Criterion 4)
Alumni Portal → Placement Reports (Higher study proof & Salary details)
```

## MVP Recommendation

Prioritize:
1. **Multi-tenant Foundation** (Auth, SIS, Roles)
2. **Academic Core** (Attendance, Marks, CO-PO Mapping)
3. **Evidence Vault** (MinIO integration for document proof)
4. **Basic NAAC/NBA Metrics** (Pass %, SFR, SFR, Research Counts)

Defer: **Library**, **Hostel**, **Inventory** to subsequent phases.

## Sources

- [NAAC Assessment Framework 2024](http://www.naac.gov.in/)
- [NBA SAR Tier I/II Manuals 2024](https://www.nbaind.org/)
- [NIRF Ranking Parameters]
