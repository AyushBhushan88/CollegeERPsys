# Comparison: Multi-Tenancy Architecture Strategies

**Context:** Deciding the data isolation strategy for a College ERP system with 10k+ users.
**Recommendation:** **Shared-Schema (Discriminator-based) with Row-Level Security (RLS)** because it offers the best balance between security, scalability, and developer experience for modern Node.js/PostgreSQL stacks.

## Quick Comparison

| Criterion | Shared-Schema (RLS) | Schema-per-tenant | Database-per-tenant |
|-----------|--------------------|-------------------|----------------------|
| **Data Isolation** | Logical (Strong) | Logical (Moderate) | Physical (Absolute) |
| **Op. Complexity** | Low (Single schema) | High ($N$ schemas) | Very High ($N$ DBs) |
| **Maintenance** | Low (Single migration) | Complex ($N$ migrations) | High (Infrastructure-heavy) |
| **Postgres Overhead** | Minimal | High (Catalog bloat) | High (Conn. pooling issues) |
| **Cost** | Lowest | Medium | Highest |

## Detailed Analysis

### Shared-Schema with RLS (Recommended)
**Strengths:**
- Single source of truth for the schema.
- Migrations are run once for all tenants.
- Database itself enforces isolation, preventing leaks even if code filters are missing.
- Extremely easy to scale with modern Node.js/Prisma/Drizzle tools.

**Weaknesses:**
- Requires careful transaction and session management to avoid "connection leakage."
- All tenants share the same physical database resources (CPU/RAM).

**Best for:** Most SaaS platforms, including this College ERP.

### Schema-per-tenant ("The Bridge")
**Strengths:**
- Better isolation than code-only filtering.
- Allows for *some* per-tenant schema customization if needed.

**Weaknesses:**
- PostgreSQL performance degrades when you reach hundreds of schemas (system catalog bloat).
- Migrations become slow and risky as they must be run in loops.
- Deprecated for most modern SaaS due to RLS advancements.

**Best for:** Legacy migrations where per-tenant schema variation is mandatory.

### Database-per-tenant ("The Silo")
**Strengths:**
- Highest possible isolation.
- Tenant can "own" their database (useful for extreme compliance).
- No cross-tenant resource contention.

**Weaknesses:**
- Very expensive to run and manage.
- Node.js connection management becomes a nightmare (PgBouncer is mandatory).
- Almost impossible to run aggregate reports across all colleges (e.g., "Total ERP Revenue").

**Best for:** High-compliance government contracts or banks.

## Recommendation

**Choose Shared-Schema + RLS when:**
- You want a single codebase and a single database to manage.
- You need to support 100+ colleges without 100+ separate maintenance tasks.
- You want "Secure by Default" behavior.

**Choose Database-per-tenant when:**
- An institution pays a significant premium for physical isolation.
- Regulatory requirements strictly forbid sharing physical resources.

## Sources

- [Postgres RLS vs Schema vs Database Comparison 2024](https://ricofritzsche.me/post/multi-tenancy-with-postgresql-rls/)
- [Drizzle ORM Multi-tenancy Guide](https://orm.drizzle.team/docs/rls)
