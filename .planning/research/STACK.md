# Technology Stack

**Project:** College ERP System
**Researched:** 2024-05-22
**Confidence:** HIGH

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 20+ (LTS) | Runtime | Stability, async performance, `AsyncLocalStorage` support. |
| Fastify | 5.x | Web Framework | Superior performance for high-throughput API requests. |
| TypeScript | 6.x | Language | Essential for enterprise-grade 13+ module maintenance. |

### Database & Multi-Tenancy
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| MongoDB | 7.0+ | Primary DB | Flexible schema for diverse college data; powerful aggregation for reports. |
| Mongoose | 9.x | ODM | Schema validation, middleware, and discriminator support. |
| Redis | 7+ | Cache/Session | Caching tenant config, API rate-limiting, and BullMQ backend. |

### Infrastructure & Storage
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| MinIO | 8.x | Evidence Vault | S3-compatible, self-hosted for local compliance/low internet reliability. |
| BullMQ | 5.x | Task Queue | Robust background processing for NAAC/NBA report generation. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | Latest | Validation | End-to-end type safety for 100+ API schemas. |
| `fastify-jwt` | Latest | Auth | JWT management for multi-tenant auth. |
| `exceljs` | 4.x | Reports | Exporting structured data for NAAC/NBA templates. |
| `pdfmake` | 0.3.x | Reports | Generating official SAR/SSR/AQAR documents. |

## Multi-Tenant Reporting Patterns

### 1. Attribute Pattern
For custom fields without schema migrations.
```json
{
  "tenantId": "abc",
  "attributes": [
    { "k": "admission_category", "v": "Management Quota" },
    { "k": "hostel_required", "v": true }
  ]
}
```

### 2. Computed Pattern (Pre-aggregation)
For high-performance metrics (e.g., Attendance %, Graduation Rate).
- Use BullMQ workers to update "stats" collections on data change.
- Reports query these pre-calculated stats instead of raw records.

### 3. Pipeline Factory
A metadata-driven engine to generate MongoDB aggregation pipelines.
- **Security:** Always prepends `{ $match: { tenantId } }`.
- **Dynamic Stages:** Maps user UI filters to `$match`, `$group`, `$facet`.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| DB | MongoDB | PostgreSQL | Project requirement for flexible schema and custom reporting via Aggregation Framework. |
| ODM | Mongoose | Prisma | Prisma's MongoDB support is maturing but Mongoose has better aggregation integration. |
| Messaging | BullMQ | RabbitMQ | BullMQ (Redis) is simpler to manage alongside the existing Redis instance. |

## Installation

```bash
# Core
npm install fastify mongoose redis bullmq minio @fastify/jwt

# Dev dependencies
npm install -D typescript @types/node @types/mongoose
```

## Sources

- [MongoDB Multi-tenancy Guide](https://www.mongodb.com/docs/manual/core/multi-tenancy/)
- [Mongoose Aggregation Documentation](https://mongoosejs.com/docs/api/aggregate.html)
- [NAAC Data Validation and Verification (DVV) Manual]
