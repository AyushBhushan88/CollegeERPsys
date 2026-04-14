# Technology Stack

**Project:** College ERP System
**Researched:** 2024-04-14

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 20+ (LTS) | Runtime | Stability, async performance, `AsyncLocalStorage` support. |
| Fastify | 4.x | Web Framework | Superior performance for 10k+ concurrent requests over Express. |
| TypeScript | 5.x | Language | Essential for enterprise-grade 13+ module maintenance. |

### Database & Multi-Tenancy
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PostgreSQL | 15+ | Primary DB | Strong RLS, JSONB indexing, reliable ACID compliance. |
| Drizzle ORM | Latest | ORM | Native `pgPolicy` support for RLS; extremely lightweight. |
| Redis | 7+ | Cache/Session | Caching tenant config, API rate-limiting, and distributed locking. |

### Infrastructure & Storage
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| MinIO | Latest | Evidence Vault | S3-compatible, self-hosted for colleges with low internet reliability. |
| RabbitMQ | 3.x | Async Messaging | Background processing for report generation and notifications. |
| Elasticsearch | 8.x | Search/Analytics | High-performance search for student records and library catalog. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node-pg` | Latest | DB Driver | Direct control for `SET LOCAL` commands required by RLS. |
| `zod` | Latest | Validation | End-to-end type safety for 100+ API schemas. |
| `jose` / `passport` | Latest | Auth | JWT management for multi-tenant auth. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| ORM | Drizzle | Prisma | Prisma requires manual RLS migrations; Drizzle handles `pgPolicy` natively. |
| DB Pattern | Shared Schema | Schema-per-tenant | Catalog bloat and migration complexity at 100+ colleges. |
| Messaging | RabbitMQ | Redis Streams | RabbitMQ has better reliability for complex report workflows. |

## Installation

```bash
# Core
npm install fastify drizzle-orm pg redis amqplib @fastify/jwt

# Dev dependencies
npm install -D drizzle-kit typescript @types/node @types/pg
```

## Sources

- [PostgreSQL RLS Official Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Drizzle ORM RLS Guide](https://orm.drizzle.team/docs/rls)
- [Fastify vs Express Performance Benchmarks 2024]
