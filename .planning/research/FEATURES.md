# Feature Landscape

**Domain:** College ERP System
**Researched:** 2024-04-14

## Table Stakes

Features users expect in any modern College ERP.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Student Profile (SIS) | Core identity record. | Low | Includes document uploads. |
| Attendance Marking | Daily faculty operation. | Low | Subject-wise and daily views. |
| Fee Management | Essential for survival. | Medium | Integration with Razorpay/Stripe. |
| Exam & Result Mgmt | Critical academic milestone. | High | Needs grading scheme flexibility. |
| Timetable Generator | Operational necessity. | High | Constraint-based solving. |

## Differentiators

Features that set this ERP apart, specifically for NAAC/NBA.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| OBE Engine | Automated CO-PO attainment. | High | Required for NBA SAR. |
| Evidence Vault | Single-click DVV readiness. | Medium | Maps every activity to criteria. |
| AQAR/SSR Automator | Save months of manual work. | Medium | Auto-fills 60% of NAAC reports. |
| Shortage Alerts | Proactive parent engagement. | Low | Automated SMS/WhatsApp. |
| Student Analytics | Predictive fail/success flags. | Medium | Helps IQAC intervene early. |

## Anti-Features

Features to explicitly NOT build to avoid scope creep or maintenance burden.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Custom DB Schema | Hard to scale across tenants. | Shared-schema with RLS. |
| Legacy Data Migration | Extremely high labor cost. | Provide CSV/Excel import templates. |
| Mobile Native Apps | High development cost. | Build a high-quality PWA. |
| Per-college custom CSS | Maintenance nightmare. | Use a themeable Tailwind config. |

## Feature Dependencies

```
SIS → Fee Structure (Fees depend on student category)
SIS → Attendance (Attendance needs student list)
Course Mgmt → OBE Engine (CO-PO mapping requires course catalog)
Marks Entry → OBE Engine (Attainment needs exam results)
OBE Engine → NBA Report (NBA SAR requires attainment scores)
```

## MVP Recommendation

Prioritize:
1. **Multi-tenant SIS & Auth** (The core)
2. **Attendance & Parent Alerts** (Immediate value)
3. **Fee Payment & Receipts** (Financial stability)
4. **Basic OBE Engine** (The differentiator)

Defer: **Hostel Management**, **Library Management**, **Placement Cell** to Phase 2/3.

## Sources

- [NAAC Assessment Framework 2024](http://www.naac.gov.in/)
- [NBA Accreditation Manual 2024](https://www.nbaind.org/)
