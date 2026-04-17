# Architecture Patterns

**Domain:** Multi-tenant College ERP
**Researched:** 2024-05-22
**Confidence:** HIGH

## Recommended Architecture: Metadata-Driven Shared-Schema

The system uses a single MongoDB database with a `tenantId` (ObjectId) discriminator on every collection. Isolation is enforced at the application layer through specialized Mongoose middleware and a global request context.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Auth Service** | Identity, Multi-tenant JWTs (tenantId embedded). | MongoDB, Redis. |
| **SIS/HRMS Service** | Lifecycle Management. | MongoDB. |
| **OBE Engine** | Attainment calculation logic. | MongoDB, Exam Service. |
| **Report Builder** | Dynamic aggregation pipeline factory. | MongoDB, BullMQ. |
| **Evidence Vault** | S3 metadata & NAAC criterion mapping. | MinIO, MongoDB. |

### Data Flow for Multi-tenant Reports

1. **Request Reception:** Client sends a `ReportDefinition` JSON (filters, groups, metrics).
2. **Context Setup:** Middleware extracts `tenantId` from JWT and stores in `AsyncLocalStorage`.
3. **Pipeline Factory:**
   - **Step 1 (Security):** Prepend `{ $match: { tenantId: currentTenantId } }`.
   - **Step 2 (Filter):** Translate UI filters to MongoDB `$match` operators.
   - **Step 3 (Reshape):** If using the **Attribute Pattern**, use `$addFields` and `$filter` to lift custom fields to the root level.
   - **Step 4 (Aggregate):** Apply `$group`, `$facet`, or `$pivot` based on the definition.
4. **Execution:** Run the aggregation via Mongoose and stream results to CSV/Excel using BullMQ for long-running reports.

## Patterns to Follow

### Pattern 1: The Attribute Pattern for Custom Fields
Avoid frequent schema migrations by storing institutional-specific fields in an array.
```typescript
const attributeSchema = new Schema({
  k: String, // e.g., "blood_group"
  v: Schema.Types.Mixed // e.g., "O+"
});
// Index: { tenantId: 1, "attributes.k": 1, "attributes.v": 1 }
```

### Pattern 2: Global Mongoose Multi-tenancy
Use a plugin to automatically inject the `tenantId` filter into `find`, `update`, `aggregate`, etc.
```typescript
// mongooseIsolation.ts implementation
schema.pre(['find', 'findOne', 'countDocuments', 'aggregate'], function() {
  const tenantId = storage.getStore()?.tenantId;
  if (!tenantId) throw new Error("Tenant Context Missing");
  
  if (this instanceof mongoose.Aggregate) {
    this.pipeline().unshift({ $match: { tenantId } });
  } else {
    this.where({ tenantId });
  }
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Large `$lookup` in Aggregations
**Why bad:** Performance degrades significantly as data grows.
**Instead:** Denormalize critical reporting fields (e.g., store `department_name` in the `Student` document) or use pre-calculated statistics in a separate collection.

### Anti-Pattern 2: Manual Pipeline String Interpolation
**Why bad:** Vulnerable to "NoSQL Injection."
**Instead:** Use a structured JSON schema for report definitions and validate with Zod before converting to an aggregation pipeline.

## Scalability Considerations

| Concern | 1,000 Users | 10,000 Users | 100,000+ Users |
|---------|--------------|--------------|---------------|
| DB Load | M0/M10 Atlas Cluster | Dedicated M30+ | Sharding by `tenantId` |
| Analytics | Raw Aggregations | Computed Pattern (Bucketing) | Data Lake / BigQuery Sync |
| Reports | Real-time APIs | BullMQ Async Generation | Dedicated Reporting Replica |

## Sources

- [MongoDB Multi-tenant Schema Design Patterns]
- [Mongoose Plugins Documentation]
- [NAAC/NBA Reporting Requirements 2024]
