# Architecture Patterns

**Domain:** Multi-tenant College ERP
**Researched:** 2024-04-14

## Recommended Architecture: Shared-Schema RLS

The system uses a single PostgreSQL database with a `tenant_id` (UUID) column on every table. Isolation is enforced by the database engine itself using Row-Level Security (RLS).

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Auth Service** | Identity, Multi-tenant JWTs. | PostgreSQL, Redis. |
| **SIS Service** | Student Lifecycle Mgmt. | PostgreSQL, Elasticsearch. |
| **OBE Engine** | Attainment calculation logic. | PostgreSQL, Academic Core. |
| **Evidence Vault** | S3 metadata & file mapping. | MinIO, PostgreSQL. |
| **Report Worker** | Async NAAC/NBA report gen. | RabbitMQ, Redis. |

### Data Flow for Multi-tenancy

1. **Request Reception:** Application receives HTTP request with a Tenant Identifier (e.g., `x-tenant-id` header or subdomain).
2. **Context Setup:** Middleware extracts the identifier and stores it in `AsyncLocalStorage`.
3. **DB Execution:**
   - Transaction begins.
   - `SET LOCAL app.current_tenant_id = '...'` is executed.
   - Main query runs. PostgreSQL automatically applies the policy: `WHERE tenant_id = current_setting('app.current_tenant_id')`.
4. **Cleanup:** Transaction ends, local setting is cleared, connection returned to pool.

## Patterns to Follow

### Pattern 1: Tenant-Aware Repository
Encapsulate the session-setting logic in a base repository or a database wrapper to ensure it is never missed.

```typescript
// Drizzle implementation example
async function tenantTransaction<T>(cb: (tx: any) => Promise<T>) {
  const tenantId = storage.getStore()?.tenantId;
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
    return await cb(tx);
  });
}
```

### Pattern 2: Evidence Mapping (Evidence-as-a-Resource)
Every table that represents an activity (Seminar, Publication, Event) should have a polymorphic relationship or a standard link to the `EvidenceVault` table.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Code-only filtering
**What:** Adding `.where(eq(table.tenantId, tenantId))` to every single query in the application.
**Why bad:** Human error will eventually lead to a missing filter, causing a critical cross-tenant data leak.
**Instead:** Let RLS handle the "Where" clause implicitly.

### Anti-Pattern 2: Large Schema-per-tenant
**What:** Creating a new schema `college_a`, `college_b` for each institution.
**Why bad:** PostgreSQL system catalog performance degrades, and running migrations across 100+ schemas is unreliable.

## Scalability Considerations

| Concern | At 1000 users | At 10K users | At 100K users |
|---------|--------------|--------------|-------------|
| DB Load | Single instance (8GB) | Vertical scale (16GB) | Read-replicas / Sharding |
| Search | PostgreSQL `ILIKE` | GIN Indexes / Trigram | Elasticsearch / Algolia |
| Files | Local Disk | MinIO / S3 | CDN (CloudFront) |

## Sources

- [PostgreSQL Row-Level Security (RLS) best practices 2024]
- [AsyncLocalStorage Node.js Documentation]
